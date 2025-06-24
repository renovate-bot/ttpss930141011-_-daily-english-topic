/**
 * Custom Next.js server with WebSocket support for OpenAI Realtime API proxy.
 * This allows us to keep API keys secure while supporting WebSocket connections.
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const WebSocket = require('ws')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Create Next.js app instance
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Simple in-memory session storage (use Redis in production)
const sessions = new Map()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      
      // Handle WebSocket upgrade requests
      if (parsedUrl.pathname === '/api/realtime-ws' && req.headers.upgrade === 'websocket') {
        // Don't handle through Next.js
        return
      }
      
      // All other requests go through Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create WebSocket server using the same HTTP server
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/realtime-ws'
  })

  wss.on('connection', async (clientWs, request) => {
    console.log('New WebSocket connection')
    
    let openaiWs = null
    let userId = null

    try {
      // Extract auth from query params or headers
      // In production, validate JWT or session token
      const url = new URL(request.url, `http://${request.headers.host}`)
      const token = url.searchParams.get('token')
      
      // TODO: Validate token and get user ID
      userId = token // Simplified for demo
      
      if (!userId) {
        clientWs.close(1008, 'Unauthorized')
        return
      }

      // Check if user already has a session
      if (sessions.has(userId)) {
        clientWs.close(1008, 'Duplicate connection')
        return
      }

      // Connect to OpenAI Realtime API
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        clientWs.close(1011, 'Server not configured')
        return
      }

      openaiWs = new WebSocket('wss://api.openai.com/v1/realtime', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      })

      // Store session
      sessions.set(userId, { clientWs, openaiWs })

      // Proxy events from OpenAI to client
      openaiWs.on('open', () => {
        console.log('Connected to OpenAI')
        clientWs.send(JSON.stringify({ type: 'proxy.connected' }))
      })

      openaiWs.on('message', (data) => {
        // Forward to client
        clientWs.send(data)
      })

      openaiWs.on('error', (error) => {
        console.error('OpenAI WebSocket error:', error)
        clientWs.send(JSON.stringify({ 
          type: 'proxy.error',
          error: 'Connection error'
        }))
      })

      openaiWs.on('close', () => {
        console.log('OpenAI connection closed')
        clientWs.close(1000, 'Server closed connection')
      })

      // Proxy events from client to OpenAI
      clientWs.on('message', (data) => {
        try {
          // You can add validation/filtering here
          const message = JSON.parse(data.toString())
          
          // Log usage for billing/monitoring
          console.log(`User ${userId} sent:`, message.type)
          
          // Forward to OpenAI
          if (openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(data)
          }
        } catch (error) {
          console.error('Failed to process client message:', error)
        }
      })

      clientWs.on('close', () => {
        console.log('Client disconnected')
        if (openaiWs) {
          openaiWs.close()
        }
        sessions.delete(userId)
      })

      clientWs.on('error', (error) => {
        console.error('Client WebSocket error:', error)
      })

    } catch (error) {
      console.error('WebSocket setup error:', error)
      clientWs.close(1011, 'Server error')
      if (openaiWs) {
        openaiWs.close()
      }
      if (userId) {
        sessions.delete(userId)
      }
    }
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> WebSocket endpoint: ws://localhost:3000/api/realtime-ws')
  })
})