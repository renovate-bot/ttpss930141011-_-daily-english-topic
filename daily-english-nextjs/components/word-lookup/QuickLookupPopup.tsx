'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useWordLookup } from '@/hooks/useWordLookup'
import { ChevronDown, Volume2 } from 'lucide-react'
import { type Dictionary } from '@/types/dictionary'

interface QuickLookupPopupProps {
  className?: string
  dictionary: Dictionary
}

export function QuickLookupPopup({ className = '', dictionary }: QuickLookupPopupProps) {
  const {
    showQuickLookup,
    activeSelection,
    currentDictionary,
    isLoadingDictionary,
    hideQuickLookup,
    lookupWord,
    playPronunciation,
    openDeepDrawer,
    explainText,
    createDeepTab
  } = useWordLookup()


  const popupRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false)

  // Position popup relative to selection (only when first shown)
  useEffect(() => {
    if (showQuickLookup && activeSelection && popupRef.current && !hasBeenPositioned) {
      const popup = popupRef.current
      const { x, y } = activeSelection.position
      
      // Calculate initial position with screen bounds checking
      const viewportWidth = window.innerWidth
      const popupRect = popup.getBoundingClientRect()
      
      let left = x - popupRect.width / 2
      let top = y - popupRect.height - 10 // 10px above selection
      
      // Adjust horizontal position if popup goes off screen
      if (left < 10) left = 10
      if (left + popupRect.width > viewportWidth - 10) {
        left = viewportWidth - popupRect.width - 10
      }
      
      // Adjust vertical position if popup goes off screen
      if (top < 10) {
        top = y + 30 // Show below selection instead
      }
      
      setPosition({ x: left, y: top })
      setHasBeenPositioned(true)
    }
  }, [showQuickLookup, activeSelection, hasBeenPositioned])

  // Reset positioning flag when popup is hidden
  useEffect(() => {
    if (!showQuickLookup) {
      setHasBeenPositioned(false)
    }
  }, [showQuickLookup])

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      e.preventDefault()
    }
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep popup within viewport bounds
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const popup = popupRef.current
      if (!popup) return
      
      const rect = popup.getBoundingClientRect()
      const constrainedX = Math.max(0, Math.min(newX, viewportWidth - rect.width))
      const constrainedY = Math.max(0, Math.min(newY, viewportHeight - rect.height))
      
      setPosition({ x: constrainedX, y: constrainedY })
    }
  }, [isDragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Update popup position when state changes
  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.style.left = `${position.x}px`
      popupRef.current.style.top = `${position.y}px`
    }
  }, [position])

  // Auto-lookup word when selection changes
  useEffect(() => {
    if (showQuickLookup && activeSelection?.isWord && activeSelection.text) {
      lookupWord(activeSelection.text)
    }
  }, [showQuickLookup, activeSelection, lookupWord])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        hideQuickLookup()
      }
    }

    if (showQuickLookup) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQuickLookup, hideQuickLookup])

  if (!showQuickLookup || !activeSelection?.isWord) {
    return null
  }

  const handlePronunciationClick = () => {
    if (currentDictionary) {
      playPronunciation(currentDictionary.word, currentDictionary.audioUrl)
    }
  }

  return (
    <div
      ref={popupRef}
      data-container="quick-lookup-popup"
      className={`fixed z-50 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-lg shadow-xl max-w-sm min-w-[280px] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{ 
        position: 'fixed',
        animation: showQuickLookup ? 'fadeInScale 200ms ease-out' : '',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle */}
      <div className="drag-handle flex items-center justify-end p-2 border-b border-purple-100 cursor-grab active:cursor-grabbing">
        <button
          onClick={hideQuickLookup}
          className="text-gray-400 hover:text-gray-600"
          title={dictionary.wordLookup.close}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {/* Loading State */}
      {isLoadingDictionary && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600">{dictionary.wordLookup.loading}</span>
        </div>
      )}

      {/* Dictionary Content */}
      {!isLoadingDictionary && currentDictionary && (
        <div className="space-y-3">
          {/* Word and Pronunciation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDictionary.word}
              </h3>
              {currentDictionary.phonetic && (
                <span className="text-sm font-mono text-gray-500">
                  {currentDictionary.phonetic}
                </span>
              )}
            </div>
            <button
              onClick={handlePronunciationClick}
              className="p-1 hover:bg-purple-100 rounded transition-colors"
              title={dictionary.wordLookup.playAudio}
            >
              <Volume2 className="h-4 w-4 text-purple-600" />
            </button>
          </div>

          {/* Definitions */}
          <div className="space-y-2">
            {currentDictionary.definitions.slice(0, 2).map((def, index) => (
              <div key={index} className="border-l-3 border-purple-200 pl-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    {def.partOfSpeech}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-1">
                  {def.translation}
                </p>
                <p className="text-xs text-gray-600">
                  {def.definition}
                </p>
                {def.example && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    &ldquo;{def.example}&rdquo;
                  </p>
                )}
              </div>
            ))}
            
            {currentDictionary.definitions.length > 2 && (
              <button 
                onClick={async () => {
                  if (activeSelection?.text) {
                    // Create a new deep explanation tab
                    createDeepTab(activeSelection.text)
                    
                    // Open the deep drawer
                    openDeepDrawer()
                    
                    // Start explaining the text
                    try {
                      await explainText(activeSelection.text)
                    } catch (error) {
                      console.error('Failed to generate deep explanation:', error)
                    }
                    
                    // Hide the quick lookup popup
                    hideQuickLookup()
                  }
                }}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center space-x-1 transition-colors"
              >
                <span>{dictionary.wordLookup.viewMore}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoadingDictionary && !currentDictionary && (
        <div className="text-sm text-gray-600">
          <p>{dictionary.wordLookup.notFound}</p>
          <p className="text-xs text-gray-500 mt-1">{dictionary.wordLookup.checkSpelling}</p>
        </div>
      )}
      </div>

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