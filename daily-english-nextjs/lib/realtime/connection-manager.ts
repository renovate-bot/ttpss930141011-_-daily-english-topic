/**
 * Connection manager for WebRTC with retry logic and error handling.
 * Provides production-grade connection reliability.
 */

export interface ConnectionConfig {
  maxRetries?: number
  retryDelay?: number
  backoffMultiplier?: number
  connectionTimeout?: number
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
  retryCount: number
  lastError?: Error
}

export class ConnectionManager {
  private config: Required<ConnectionConfig>
  private state: ConnectionState
  private listeners: Map<string, Set<(...args: unknown[]) => void>>
  private retryTimer?: NodeJS.Timeout
  private connectionTimer?: NodeJS.Timeout

  constructor(config: ConnectionConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      connectionTimeout: config.connectionTimeout ?? 30000,
    }

    this.state = {
      status: 'disconnected',
      retryCount: 0,
    }

    this.listeners = new Map()
  }

  /**
   * Add event listener.
   */
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * Remove event listener.
   */
  off(event: string, callback: (...args: unknown[]) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  /**
   * Emit event to listeners.
   */
  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Update connection state.
   */
  private updateState(updates: Partial<ConnectionState>) {
    const oldState = this.state
    this.state = { ...this.state, ...updates }
    
    if (oldState.status !== this.state.status) {
      this.emit('stateChange', this.state)
    }
  }

  /**
   * Connect with retry logic.
   */
  async connect(connectFn: () => Promise<RTCPeerConnection>): Promise<RTCPeerConnection> {
    this.clearTimers()
    this.updateState({ status: 'connecting', retryCount: 0 })

    while (this.state.retryCount <= this.config.maxRetries) {
      try {
        // Set connection timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          this.connectionTimer = setTimeout(() => {
            reject(new Error('Connection timeout'))
          }, this.config.connectionTimeout)
        })

        // Attempt connection
        const pc = await Promise.race([connectFn(), timeoutPromise])
        
        // Monitor connection state
        this.monitorConnection(pc)
        
        this.clearTimers()
        this.updateState({ status: 'connected', retryCount: 0 })
        this.emit('connected', pc)
        
        return pc
      } catch (error) {
        this.clearTimers()
        
        const errorObj = error instanceof Error ? error : new Error(String(error))
        this.updateState({ lastError: errorObj })
        
        console.error(`Connection attempt ${this.state.retryCount + 1} failed:`, error)
        
        if (this.state.retryCount >= this.config.maxRetries) {
          this.updateState({ status: 'error' })
          this.emit('error', errorObj)
          throw errorObj
        }
        
        // Calculate retry delay with exponential backoff
        const delay = this.config.retryDelay * Math.pow(
          this.config.backoffMultiplier, 
          this.state.retryCount
        )
        
        this.updateState({ 
          status: 'reconnecting',
          retryCount: this.state.retryCount + 1
        })
        
        this.emit('retry', {
          attempt: this.state.retryCount,
          delay,
          error: errorObj
        })
        
        // Wait before retry
        await new Promise(resolve => {
          this.retryTimer = setTimeout(resolve, delay)
        })
      }
    }

    throw new Error('Max retries exceeded')
  }

  /**
   * Monitor connection health.
   */
  private monitorConnection(pc: RTCPeerConnection) {
    pc.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', pc.connectionState)
      
      switch (pc.connectionState) {
        case 'connected':
          this.updateState({ status: 'connected' })
          break
        case 'disconnected':
        case 'failed':
          this.updateState({ status: 'error' })
          this.emit('disconnected', pc.connectionState)
          break
        case 'closed':
          this.updateState({ status: 'disconnected' })
          break
      }
    })

    pc.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', pc.iceConnectionState)
      
      if (pc.iceConnectionState === 'failed') {
        this.emit('iceFailure')
      }
    })
  }

  /**
   * Disconnect and cleanup.
   */
  disconnect() {
    this.clearTimers()
    this.updateState({ status: 'disconnected', retryCount: 0 })
    this.emit('disconnected', 'manual')
  }

  /**
   * Clear all timers.
   */
  private clearTimers() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = undefined
    }
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = undefined
    }
  }

  /**
   * Get current state.
   */
  getState(): ConnectionState {
    return { ...this.state }
  }

  /**
   * Cleanup resources.
   */
  destroy() {
    this.clearTimers()
    this.listeners.clear()
  }
}