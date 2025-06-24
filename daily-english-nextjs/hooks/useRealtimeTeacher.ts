/**
 * Hook for OpenAI Realtime API English teacher functionality.
 * Minimal implementation inspired by Solar System demo architecture.
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { REALTIME_MODEL, TEACHER_INSTRUCTIONS } from '@/lib/realtime-config'
import { Topic } from '@/lib/topics'

/**
 * Connection status for the realtime session.
 */
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * Server event from Realtime API.
 */
interface ServerEvent {
  type: string
  [key: string]: any
}

/**
 * Hook options.
 */
interface UseRealtimeTeacherOptions {
  topic?: Topic
  slideIndex?: number
  slideContent?: string
}

/**
 * Hook return value.
 */
interface UseRealtimeTeacherReturn {
  isCallActive: boolean
  connectionStatus: ConnectionStatus
  transcript: string
  isTeacherSpeaking: boolean
  audioLevel: number
  startCall: () => Promise<void>
  endCall: () => void
}

/**
 * Custom hook for realtime English teacher conversations.
 * Handles WebRTC connection, audio streaming, and teaching context.
 */
export function useRealtimeTeacher({
  topic,
  slideIndex = 0,
  slideContent
}: UseRealtimeTeacherOptions): UseRealtimeTeacherReturn {
  const [isCallActive, setIsCallActive] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [transcript, setTranscript] = useState('')
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const responseInProgressRef = useRef<boolean>(false)
  const isFirstGreetingRef = useRef<boolean>(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Generate teaching instructions based on current slide.
   */
  const generateInstructions = useCallback((): string => {
    if (!slideContent || !topic) return TEACHER_INSTRUCTIONS

    return `${TEACHER_INSTRUCTIONS}

[INITIAL LESSON CONTEXT]
- Topic: ${topic.title}
- Total slides: ${topic.slides.length}
- Current slide: ${slideIndex + 1}
- Slide preview: ${slideContent.substring(0, 150)}...`
  }, [slideContent, topic, slideIndex])

  /**
   * Handle incoming server events.
   */
  const handleServerEvent = useCallback((event: ServerEvent) => {
    switch (event.type) {
      case 'session.created':
        console.log('Session created:', event)
        break
      
      case 'session.updated':
        console.log('Session updated:', event)
        // Initial greeting handled by system prompt, no need to send user message
        if (dcRef.current?.readyState === 'open' && isFirstGreetingRef.current && !responseInProgressRef.current) {
          isFirstGreetingRef.current = false
          // Simply trigger the initial response without fake user message
          dcRef.current.send(JSON.stringify({
            type: 'response.create'
          }))
        }
        break
        
      case 'response.created':
        console.log('Response created:', event)
        responseInProgressRef.current = true
        break
        
      case 'response.done':
        console.log('Response done:', event)
        responseInProgressRef.current = false
        // Check if response has function call
        if (event.response?.output?.[0]?.type === 'function_call') {
          const toolCall = event.response.output[0]
          console.log('Tool call:', toolCall)
          
          if (toolCall.name === 'suggest_next_slide') {
            // Handle the function call following Realtime API pattern
            if (dcRef.current?.readyState === 'open') {
              // 1. Add function call output to conversation
              const functionOutput = {
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: toolCall.call_id,
                  output: JSON.stringify({
                    success: true,
                    message: 'Suggestion noted. The student can navigate when ready.'
                  })
                }
              }
              dcRef.current.send(JSON.stringify(functionOutput))
              
              // 2. Trigger response to continue conversation
              dcRef.current.send(JSON.stringify({
                type: 'response.create'
              }))
              
              // 3. Emit custom event for UI to optionally handle
              console.log('Teacher suggests moving to next slide:', toolCall.arguments)
              // Parent component can listen for this suggestion
            }
          }
        }
        break
      
      case 'conversation.item.created':
        console.log('Conversation item created:', event)
        break
        
      case 'input_audio_buffer.speech_started':
        console.log('Speech started')
        break
        
      case 'input_audio_buffer.speech_stopped':
        console.log('Speech stopped')
        break
        
      case 'input_audio_buffer.committed':
        console.log('Audio buffer committed')
        break
      
      case 'conversation.item.input_audio_transcription.completed':
        console.log('Transcription completed:', event.transcript)
        setTranscript(event.transcript || '')
        break
        
      case 'conversation.item.input_audio_transcription.failed':
        console.error('Transcription failed:', event.error)
        break
      
      case 'response.output_item.added':
        console.log('Output item added:', event)
        // Check for function calls in real-time
        if (event.item?.type === 'function_call' && event.item?.name === 'suggest_next_slide') {
          console.log('Teacher suggesting slide change during response')
        }
        break
        
      case 'response.audio.started':
        console.log('Audio playback started')
        setIsTeacherSpeaking(true)
        break
        
      case 'response.audio.delta':
        // Audio chunks are being received
        break
      
      case 'response.audio.done':
        console.log('Audio playback done')
        setIsTeacherSpeaking(false)
        break
        
      case 'response.audio_transcript.delta':
        // Transcript of what the model is saying
        break
        
      case 'response.audio_transcript.done':
        console.log('Model said:', event.transcript)
        break
      
      case 'error':
        console.error('Server error:', event.error)
        setConnectionStatus('error')
        break
        
      default:
        console.log('Unhandled event:', event.type)
    }
  }, [])

  /**
   * Start the voice call.
   */
  const startCall = useCallback(async () => {
    if (isCallActive) return

    try {
      setIsCallActive(true)
      setConnectionStatus('connecting')

      // Get ephemeral token
      const tokenResponse = await fetch('/api/realtime-session')
      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }

      const { client_secret } = await tokenResponse.json()
      const ephemeralKey = client_secret.value

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      pcRef.current = pc

      // Set up audio playback
      const audio = document.createElement('audio')
      audio.autoplay = true
      audioRef.current = audio

      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0]
      }

      // Add microphone with specific constraints for PCM16
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })
      
      // Set up audio level monitoring
      try {
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
        analyserRef.current.fftSize = 256
        
        // Start monitoring audio levels
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        audioLevelIntervalRef.current = setInterval(() => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length
            setAudioLevel(Math.min(average / 128, 1)) // Normalize to 0-1
          }
        }, 50)
      } catch (error) {
        console.error('Failed to set up audio monitoring:', error)
      }

      // Create data channel
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onopen = () => {
        setConnectionStatus('connected')
        console.log('Data channel opened')
        
        // Send session update with configuration
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            instructions: generateInstructions(),
            voice: 'coral',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,
              create_response: true
            },
            tools: [{
              type: 'function',
              name: 'suggest_next_slide',
              description: 'Suggest moving to the next slide when appropriate',
              parameters: {
                type: 'object',
                properties: {
                  reason: {
                    type: 'string',
                    description: 'Brief reason for suggesting to move on'
                  }
                },
                required: ['reason']
              }
            }],
            tool_choice: 'auto',
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        }
        dc.send(JSON.stringify(sessionUpdate))
        console.log('Session update sent:', sessionUpdate)
      }

      dc.onmessage = (e) => {
        const event = JSON.parse(e.data)
        console.log('Server event:', event)
        handleServerEvent(event)
      }

      dc.onerror = () => {
        setConnectionStatus('error')
      }

      // Create offer and connect
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp'
          }
        }
      )

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI')
      }

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text()
      }
      await pc.setRemoteDescription(answer)

    } catch (error) {
      console.error('Failed to start call:', error)
      setConnectionStatus('error')
      setIsCallActive(false)
    }
  }, [isCallActive, generateInstructions, handleServerEvent])

  /**
   * End the voice call.
   */
  const endCall = useCallback(() => {
    if (!isCallActive) return

    // Stop audio level monitoring
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
      audioLevelIntervalRef.current = null
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
    }
    
    // Stop media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Clean up connections
    if (dcRef.current) {
      dcRef.current.close()
      dcRef.current = null
    }

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current = null
    }

    // Reset state
    setIsCallActive(false)
    setConnectionStatus('disconnected')
    setTranscript('')
    setIsTeacherSpeaking(false)
    setAudioLevel(0)
  }, [isCallActive])

  /**
   * Update instructions when slide changes.
   */
  useEffect(() => {
    if (dcRef.current?.readyState === 'open' && slideContent && !isFirstGreetingRef.current) {
      // Only send context update - don't cancel or create new response
      // Let the teacher naturally transition in their next response
      const contextUpdate = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'system',
          content: [{
            type: 'input_text',
            text: `[SLIDE CHANGE NOTIFICATION] The student has moved to slide ${slideIndex + 1} of ${topic?.slides.length || 'unknown'}. New slide content: ${slideContent.substring(0, 150)}...`
          }]
        }
      }
      dcRef.current.send(JSON.stringify(contextUpdate))
      console.log('Slide context silently updated')
    }
  }, [slideIndex, slideContent])

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      endCall()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isCallActive,
    connectionStatus,
    transcript,
    isTeacherSpeaking,
    audioLevel,
    startCall,
    endCall
  }
}