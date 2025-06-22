'use client'

import React, { useRef } from 'react'
import { useTextSelection } from '@/hooks/useTextSelection'
import { useWordLookup } from '@/hooks/useWordLookup'
import { QuickLookupPopup } from './QuickLookupPopup'
import { ContextMenu } from './ContextMenu'
import { DeepLearningDrawer } from './DeepLearningDrawer'
import { TranslationPopup } from './TranslationPopup'
import { type Dictionary } from '@/types/dictionary'

interface WordLookupManagerProps {
  children: React.ReactNode
  className?: string
  dictionary: Dictionary
}

export function WordLookupManager({ children, className = '', dictionary }: WordLookupManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    showQuickLookupPopup,
    showContextMenuAt
  } = useWordLookup()

  // Setup text selection detection
  const { isSelecting } = useTextSelection({
    containerRef,
    onWordDoubleClick: (selection) => {
      showQuickLookupPopup(selection)
    },
    onTextSelect: (selection) => {
      // Always show context menu for any text selection (both words and phrases)
      showContextMenuAt(selection)
    },
    minSelectionLength: 1,
    debounceMs: 300
  })

  return (
    <div 
      ref={containerRef}
      data-container="main-content"
      className={`relative ${className}`}
      style={{ userSelect: 'text' }}
    >
      {/* Main content */}
      {children}
      
      {/* Word lookup UI components */}
      <QuickLookupPopup dictionary={dictionary} />
      <ContextMenu dictionary={dictionary} />
      <TranslationPopup dictionary={dictionary} />
      <DeepLearningDrawer dictionary={dictionary} />
      
      {/* Selection indicator for debugging in development */}
      {process.env.NODE_ENV === 'development' && isSelecting && (
        <div className="fixed top-4 left-4 bg-blue-500 text-white px-2 py-1 text-xs rounded z-50">
          Selecting...
        </div>
      )}
    </div>
  )
}