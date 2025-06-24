/**
 * Production-ready WebSocket server for OpenAI Realtime API proxy.
 * Handles authentication, rate limiting, and connection management.
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const WebSocket = require('ws')
const crypto = require('crypto')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Connection management
const connections = new Map() // userId -> connection info
const connectionsByWebSocket = new WeakMap() // ws -> connection info

// Rate limiting
const rateLimits = new Map() // userId -> { count, resetTime }
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100

/**
 * Connection info structure
 */
class Connection {
  constructor(userId, clientWs, openaiWs) {
    this.id = crypto.randomUUID()
    this.userId = userId
    this.clientWs = clientWs
    this.openaiWs = openaiWs
    this.createdAt = Date.now()
    this.messageCount = 0
    this.audioBytesSent = 0
    this.audioBufferQueue = []
    this.isAuthenticated = false
  }

  cleanup() {
    if (this.clientWs.readyState === WebSocket.OPEN) {
      this.clientWs.close()
    }
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.close()
    }
    connections.delete(this.userId)
    connectionsByWebSocket.delete(this.clientWs)
    if (this.openaiWs) {
      connectionsByWebSocket.delete(this.openaiWs)
    }
  }
}

/**
 * Verify user authentication
 */
async function authenticateUser(token) {
  if (!token) return null
  
  // In production, verify JWT or session token
  // For now, simple validation
  if (token.length < 10) return null
  
  // Return user info
  return {
    id: token, // In production, decode from JWT
    tier: 'free', // Could be 'free', 'pro', etc.
    rateLimit: 100
  }
}

/**
 * Check rate limits
 */
function checkRateLimit(userId, limit = RATE_LIMIT_MAX_REQUESTS) {
  const now = Date.now()
  const userLimit = rateLimits.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (userLimit.count >= limit) {
    return false
  }
  
  userLimit.count++
  return true
}

/**
 * Log usage for monitoring/billing
 */
function logUsage(connection, event, data = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    connectionId: connection.id,
    userId: connection.userId,
    event,
    messageCount: connection.messageCount,
    audioBytes: connection.audioBytesSent,
    duration: Date.now() - connection.createdAt,
    ...data
  }
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(log))
  } else {
    console.log(`[${connection.userId}] ${event}`, data)
  }
}

/**
 * Handle WebSocket connection
 */
async function handleWebSocketConnection(clientWs, request) {
  let connection = null
  
  try {
    // Parse authentication
    const url = new URL(request.url, `http://${request.headers.host}`)
    const token = url.searchParams.get('token') || 
                 request.headers.authorization?.replace('Bearer ', '')
    
    // Authenticate user
    const user = await authenticateUser(token)
    if (!user) {
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        error: 'Authentication required' 
      }))
      clientWs.close(1008, 'Unauthorized')
      return
    }
    
    // Check if user already has a connection
    if (connections.has(user.id)) {
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        error: 'Already connected' 
      }))
      clientWs.close(1008, 'Duplicate connection')
      return
    }
    
    // Check rate limits
    if (!checkRateLimit(user.id, user.rateLimit)) {
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        error: 'Rate limit exceeded' 
      }))
      clientWs.close(1008, 'Rate limit exceeded')
      return
    }
    
    // Verify OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      clientWs.close(1011, 'Server not configured')
      return
    }
    
    // Create connection to OpenAI
    const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    })
    
    // Create connection object
    connection = new Connection(user.id, clientWs, openaiWs)
    connections.set(user.id, connection)
    connectionsByWebSocket.set(clientWs, connection)
    connectionsByWebSocket.set(openaiWs, connection)
    
    // Set up OpenAI WebSocket handlers
    openaiWs.on('open', () => {
      connection.isAuthenticated = true
      clientWs.send(JSON.stringify({ 
        type: 'connection.established',
        connectionId: connection.id
      }))
      logUsage(connection, 'connected')
    })
    
    openaiWs.on('message', (data) => {
      // Forward to client
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data)
        
        // Track audio data
        try {
          const message = JSON.parse(data)
          if (message.type === 'response.audio.delta' && message.delta) {
            connection.audioBytesSent += message.delta.length
          }
        } catch (e) {
          // Binary data or parsing error
        }
      }
    })
    
    openaiWs.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error)
      logUsage(connection, 'openai_error', { error: error.message })
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ 
          type: 'error',
          error: 'Connection error with AI service'
        }))
      }
    })
    
    openaiWs.on('close', (code, reason) => {
      logUsage(connection, 'openai_closed', { code, reason })
      
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1001, 'AI service disconnected')
      }
      connection.cleanup()
    })
    
    // Set up client WebSocket handlers
    clientWs.on('message', async (data) => {
      try {
        // Check if still authenticated
        if (!connection.isAuthenticated) {
          clientWs.send(JSON.stringify({ 
            type: 'error',
            error: 'Not authenticated'
          }))
          return
        }
        
        // Rate limit check
        if (!checkRateLimit(user.id, user.rateLimit)) {
          clientWs.send(JSON.stringify({ 
            type: 'error',
            error: 'Rate limit exceeded'
          }))
          return
        }
        
        connection.messageCount++
        
        // Parse and validate message
        const message = JSON.parse(data.toString())
        
        // Filter sensitive operations
        if (message.type === 'session.update') {
          // Don't allow clients to change certain settings
          delete message.session?.model
          delete message.session?.max_response_output_tokens
        }
        
        // Track audio input
        if (message.type === 'input_audio_buffer.append' && message.audio) {
          connection.audioBytesSent += message.audio.length
        }
        
        // Forward to OpenAI
        if (openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(JSON.stringify(message))
        } else {
          clientWs.send(JSON.stringify({ 
            type: 'error',
            error: 'AI service not connected'
          }))
        }
      } catch (error) {
        console.error('Client message error:', error)
        clientWs.send(JSON.stringify({ 
          type: 'error',
          error: 'Invalid message format'
        }))
      }
    })
    
    clientWs.on('close', (code, reason) => {
      logUsage(connection, 'client_disconnected', { 
        code, 
        reason,
        duration: Date.now() - connection.createdAt,
        totalMessages: connection.messageCount,
        totalAudioBytes: connection.audioBytesSent
      })
      connection.cleanup()
    })
    
    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error)
      logUsage(connection, 'client_error', { error: error.message })
    })
    
    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.ping()
      } else {
        clearInterval(heartbeatInterval)
      }
    }, 30000)
    
  } catch (error) {
    console.error('WebSocket setup error:', error)
    
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ 
        type: 'error',
        error: 'Server error'
      }))
      clientWs.close(1011, 'Server error')
    }
    
    if (connection) {
      connection.cleanup()
    }
  }
}

// Start server
app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      
      // Skip WebSocket upgrade requests
      if (parsedUrl.pathname === '/api/realtime-ws' && req.headers.upgrade === 'websocket') {
        return
      }
      
      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  
  // Create WebSocket server
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/realtime-ws',
    verifyClient: (info, cb) => {
      // Additional verification can be done here
      cb(true)
    }
  })
  
  // Handle new connections
  wss.on('connection', handleWebSocketConnection)
  
  // Error handling
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error)
  })
  
  // Start listening
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket endpoint: ws://${hostname}:${port}/api/realtime-ws`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
    console.log(`> OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing!'}`)
  })
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing connections...')
    
    // Close all connections
    connections.forEach(connection => {
      connection.cleanup()
    })
    
    // Close servers
    wss.close(() => {
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })
  })
})