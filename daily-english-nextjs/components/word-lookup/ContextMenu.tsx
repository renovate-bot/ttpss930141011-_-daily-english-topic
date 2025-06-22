'use client'

import React, { useEffect, useRef } from 'react'
import { useWordLookup } from '@/contexts/WordLookupContext'
import { 
  Globe, 
  Brain, 
  BookOpen 
} from 'lucide-react'
import { type Dictionary } from '@/types/dictionary'

interface ContextMenuProps {
  className?: string
  dictionary: Dictionary
}

export function ContextMenu({ className = '', dictionary }: ContextMenuProps) {
  const {
    showContextMenu,
    activeSelection,
    hideContextMenu,
    translateText,
    explainText,
    openDeepDrawer
  } = useWordLookup()

  const menuRef = useRef<HTMLDivElement>(null)

  // Position menu relative to selection
  useEffect(() => {
    if (showContextMenu && activeSelection && menuRef.current) {
      const menu = menuRef.current
      const { x, y } = activeSelection.position
      
      // Calculate position with screen bounds checking
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuRect = menu.getBoundingClientRect()
      
      let left = x - menuRect.width / 2
      let top = y + 10 // 10px below selection
      
      // Adjust horizontal position if menu goes off screen
      if (left < 10) left = 10
      if (left + menuRect.width > viewportWidth - 10) {
        left = viewportWidth - menuRect.width - 10
      }
      
      // Adjust vertical position if menu goes off screen
      if (top + menuRect.height > viewportHeight - 10) {
        top = y - menuRect.height - 10 // Show above selection instead
      }
      
      menu.style.left = `${left}px`
      menu.style.top = `${top}px`
    }
  }, [showContextMenu, activeSelection])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu()
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContextMenu, hideContextMenu])

  const handleQuickTranslate = async () => {
    if (!activeSelection) return
    
    try {
      await translateText(activeSelection.text)
      hideContextMenu()
    } catch (error) {
      console.error('Translation failed:', error)
    }
  }

  const handleDeepExplain = async () => {
    if (!activeSelection) return
    
    try {
      // Open drawer first for better UX
      openDeepDrawer()
      hideContextMenu()
      // Then load the explanation
      await explainText(activeSelection.text)
    } catch (error) {
      console.error('Deep explanation failed:', error)
    }
  }

  const handleAddToNotes = () => {
    if (!activeSelection) return
    
    // TODO: Implement note-taking functionality
    console.log('Add to notes:', activeSelection.text)
    hideContextMenu()
  }

  if (!showContextMenu || !activeSelection) {
    return null
  }

  const menuItems = [
    {
      icon: Globe,
      label: dictionary.wordLookup.quickTranslation,
      description: dictionary.wordLookup.translateNow,
      onClick: handleQuickTranslate,
      shortcut: '⌘T'
    },
    {
      icon: Brain,
      label: dictionary.wordLookup.deepAnalysis,
      description: dictionary.wordLookup.detailedExplanation,
      onClick: handleDeepExplain,
      shortcut: '⌘E'
    },
    {
      icon: BookOpen,
      label: dictionary.wordLookup.addToNotes,
      description: dictionary.wordLookup.saveToNotes,
      onClick: handleAddToNotes,
      shortcut: '⌘N'
    }
  ]

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl py-2 w-64 max-w-xs ${className}`}
      style={{ 
        position: 'fixed',
        animation: 'slideUpFade 150ms ease-out'
      }}
    >
      {/* Selected text preview */}
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate" title={activeSelection.text}>
          &ldquo;{activeSelection.text.length > 30 
            ? `${activeSelection.text.slice(0, 30)}...` 
            : activeSelection.text}&rdquo;
        </p>
        <p className="text-xs text-gray-500">
          {activeSelection.text.split(/\s+/).length} {dictionary.wordLookup.words}
        </p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-4 w-4 text-gray-500 group-hover:text-purple-600" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-900">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {item.shortcut}
                  </span>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-purple-600">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}