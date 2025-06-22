'use client'

import React, { useEffect, useRef } from 'react'
import { useWordLookup } from '@/hooks/useWordLookup'
import { X, Copy, Volume2 } from 'lucide-react'
import { type Dictionary } from '@/types/dictionary'

interface TranslationPopupProps {
  className?: string
  dictionary: Dictionary
}

export function TranslationPopup({ className = '', dictionary }: TranslationPopupProps) {
  const {
    currentTranslation,
    isLoadingTranslation,
    activeSelection,
    showTranslationPopup,
    hideTranslationPopup,
    playPronunciation
  } = useWordLookup()

  const popupRef = useRef<HTMLDivElement>(null)

  // Position popup relative to selection
  useEffect(() => {
    if (showTranslationPopup && currentTranslation && activeSelection && popupRef.current) {
      const popup = popupRef.current
      const { x, y } = activeSelection.position
      
      // Calculate position with screen bounds checking
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const popupRect = popup.getBoundingClientRect()
      
      let left = x - popupRect.width / 2
      let top = y + 30 // Show below selection
      
      // Adjust horizontal position if popup goes off screen
      if (left < 10) left = 10
      if (left + popupRect.width > viewportWidth - 10) {
        left = viewportWidth - popupRect.width - 10
      }
      
      // Adjust vertical position if popup goes off screen
      if (top + popupRect.height > viewportHeight - 10) {
        top = y - popupRect.height - 10 // Show above selection instead
      }
      
      popup.style.left = `${left}px`
      popup.style.top = `${top}px`
    }
  }, [showTranslationPopup, currentTranslation, activeSelection])

  const handleCopyTranslation = async () => {
    if (currentTranslation?.translation) {
      try {
        await navigator.clipboard.writeText(currentTranslation.translation)
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy translation:', error)
      }
    }
  }

  const handlePronunciation = () => {
    if (activeSelection?.text) {
      playPronunciation(activeSelection.text)
    }
  }

  if (!showTranslationPopup) {
    return null
  }

  return (
    <div
      ref={popupRef}
      data-container="translation-popup"
      className={`fixed z-50 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-lg shadow-xl p-4 max-w-sm min-w-[280px] ${className}`}
      style={{ 
        position: 'fixed',
        animation: 'fadeInScale 200ms ease-out'
      }}
    >
      {/* Loading State */}
      {isLoadingTranslation && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600">{dictionary.wordLookup.translating}</span>
        </div>
      )}

      {/* Translation Content */}
      {!isLoadingTranslation && currentTranslation && (
        <div className="space-y-3">
          {/* Original Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {dictionary.wordLookup.original}
              </span>
              <button
                onClick={handlePronunciation}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title={dictionary.wordLookup.playAudio}
              >
                <Volume2 className="h-4 w-4 text-blue-600" />
              </button>
            </div>
            <p className="text-sm text-gray-800 font-medium">
              &ldquo;{currentTranslation.originalText}&rdquo;
            </p>
          </div>

          {/* Translation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                {dictionary.wordLookup.translation}
              </span>
              <button
                onClick={handleCopyTranslation}
                className="p-1 hover:bg-green-100 rounded transition-colors"
                title={dictionary.wordLookup.copyTranslation}
              >
                <Copy className="h-4 w-4 text-green-600" />
              </button>
            </div>
            <p className="text-sm text-gray-800">
              {currentTranslation.translation}
            </p>
          </div>

          {/* Confidence Score */}
          {currentTranslation.confidence && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{dictionary.wordLookup.accuracy}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentTranslation.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {Math.round(currentTranslation.confidence * 100)}%
              </span>
            </div>
          )}

          {/* Alternatives */}
          {currentTranslation.alternatives && currentTranslation.alternatives.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 mb-2 block">
                {dictionary.wordLookup.otherTranslations}
              </span>
              <div className="space-y-1">
                {currentTranslation.alternatives.slice(0, 2).map((alt, index) => (
                  <p key={index} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                    {alt}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={hideTranslationPopup}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        title={dictionary.wordLookup.close}
      >
        <X className="h-4 w-4" />
      </button>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}