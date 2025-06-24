/**
 * Voice call button component for initiating English teacher conversations.
 * Handles UI state and user interactions for voice calls.
 * 
 * @module VoiceCallButton
 */

'use client'

import { useState } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react'
import { ConnectionStatus } from '@/lib/realtime/types'

interface VoiceCallButtonProps {
  isFullscreen?: boolean
  isCallActive?: boolean
  onCallStart?: () => void
  onCallEnd?: () => void
  className?: string
}

/**
 * Voice call control button for starting/ending teaching sessions.
 * Follows Single Responsibility Principle by handling only UI interactions.
 */
export function VoiceCallButton({
  isFullscreen = false,
  isCallActive: isCallActiveProp = false,
  onCallStart,
  onCallEnd,
  className = ''
}: VoiceCallButtonProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [connectionStatus] = useState<ConnectionStatus>('disconnected')
  const [audioLevel] = useState(0)

  const handleCallToggle = () => {
    if (isCallActiveProp) {
      onCallEnd?.()
    } else {
      onCallStart?.()
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500 animate-pulse'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main call button */}
      <button
        onClick={handleCallToggle}
        className={`
          relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
          transition-all duration-200 border-none cursor-pointer
          ${isCallActiveProp 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
          ${isFullscreen ? 'text-sm' : 'text-xs sm:text-sm'}
        `}
        aria-label={isCallActiveProp ? 'End voice call' : 'Start voice call'}
      >
        {isCallActiveProp ? (
          <>
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Call</span>
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Start Lesson</span>
          </>
        )}
        
        {/* Connection status indicator */}
        {isCallActiveProp && (
          <div 
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`}
            title={connectionStatus}
          />
        )}
      </button>

      {/* Mute button - only show during active call */}
      {isCallActiveProp && (
        <button
          onClick={handleMuteToggle}
          className={`
            flex items-center justify-center p-2 rounded-lg
            transition-all duration-200 border-none cursor-pointer
            ${isMuted 
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' 
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Audio level indicator - only show during active call */}
      {isCallActiveProp && !isMuted && (
        <div className="flex items-center gap-1">
          <Volume2 className="w-4 h-4 text-white/70" />
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full transition-all duration-100 ${
                  i < Math.ceil(audioLevel * 5)
                    ? 'bg-green-400'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Floating voice call interface for active conversations.
 * Provides detailed call controls and status information.
 */
export function VoiceCallInterface({
  connectionStatus,
  audioLevel,
  transcript,
  isTeacherSpeaking,
  onMute,
  onUnmute,
  onEnd,
  isMuted = false
}: {
  connectionStatus: ConnectionStatus
  audioLevel: number
  transcript?: string
  isTeacherSpeaking?: boolean
  onMute: () => void
  onUnmute: () => void
  onEnd: () => void
  isMuted?: boolean
}) {
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
              } ring-2 ring-slate-900`} />
            </div>
            <div>
              <h3 className="text-white font-semibold">English Teacher</h3>
              <p className="text-white/80 text-sm capitalize">{connectionStatus}</p>
            </div>
          </div>
          <button
            onClick={onEnd}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Audio visualization */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-center gap-1 h-16">
          {[...Array(20)].map((_, i) => {
            const height = isTeacherSpeaking 
              ? Math.random() * 100 
              : audioLevel * 100 * (1 - Math.abs(i - 10) / 10)
            return (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(10, height)}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="p-4 max-h-32 overflow-y-auto">
          <p className="text-white/80 text-sm">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 flex justify-center gap-4">
        <button
          onClick={isMuted ? onUnmute : onMute}
          className={`p-3 rounded-full transition-all ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  )
}