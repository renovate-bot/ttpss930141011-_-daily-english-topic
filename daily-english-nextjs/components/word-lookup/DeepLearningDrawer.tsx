'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useWordLookup } from '@/contexts/WordLookupContext'
import { X, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { marked } from 'marked'
import { type Dictionary } from '@/types/dictionary'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'

interface DeepLearningDrawerProps {
  className?: string
  dictionary: Dictionary
}

export function DeepLearningDrawer({ className = '', dictionary }: DeepLearningDrawerProps) {
  const {
    showDeepDrawer,
    isDeepDrawerMinimized,
    deepDrawerWidth,
    deepTabs,
    activeTabId,
    openDeepDrawer,
    closeDeepDrawer,
    closeDeepTab,
    switchToTab,
    explainText,
    activeSelection,
    minimizeDeepDrawer,
    maximizeDeepDrawer,
    setDeepDrawerWidth
  } = useWordLookup()

  const drawerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidth, setDragStartWidth] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Auto-focus on drawer open
  useEffect(() => {
    if (showDeepDrawer && !isDeepDrawerMinimized && drawerRef.current) {
      drawerRef.current.focus()
    }
  }, [showDeepDrawer, isDeepDrawerMinimized])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showDeepDrawer || isDeepDrawerMinimized) return

      // Global shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // Focus on search input if available
        const searchInput = drawerRef.current?.querySelector('input[type="search"]')
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
        return
      }

      switch (event.key) {
        case 'Escape':
          if (isDesktop) {
            closeDeepDrawer()
          } else {
            minimizeDeepDrawer()
          }
          break
        case 'Tab':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            const currentIndex = deepTabs.findIndex(tab => tab.id === activeTabId)
            const nextIndex = event.shiftKey 
              ? (currentIndex - 1 + deepTabs.length) % deepTabs.length
              : (currentIndex + 1) % deepTabs.length
            
            if (deepTabs[nextIndex]) {
              switchToTab(deepTabs[nextIndex].id)
            }
          }
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (event.altKey && deepTabs.length > 0) {
            event.preventDefault()
            const index = parseInt(event.key) - 1
            if (deepTabs[index]) {
              switchToTab(deepTabs[index].id)
            }
          }
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          if (event.altKey && deepTabs.length > 1) {
            event.preventDefault()
            const currentIndex = deepTabs.findIndex(tab => tab.id === activeTabId)
            const nextIndex = event.key === 'ArrowLeft'
              ? (currentIndex - 1 + deepTabs.length) % deepTabs.length
              : (currentIndex + 1) % deepTabs.length
            
            if (deepTabs[nextIndex]) {
              switchToTab(deepTabs[nextIndex].id)
            }
          }
          break
      }
    }

    if (showDeepDrawer) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDeepDrawer, isDeepDrawerMinimized, deepTabs, activeTabId, closeDeepDrawer, switchToTab, minimizeDeepDrawer, isDesktop])

  const activeTab = deepTabs.find(tab => tab.id === activeTabId)

  const handleRetry = async () => {
    if (activeTab && activeSelection) {
      try {
        await explainText(activeTab.originalText)
        showToastMessage(dictionary.common.success, 'success')
      } catch {
        showToastMessage(dictionary.common.error, 'error')
      }
    }
  }

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3000)
  }

  // Drag to resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartWidth(deepDrawerWidth)
    e.preventDefault()
  }, [deepDrawerWidth])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = dragStartX - e.clientX
    const newWidth = dragStartWidth + deltaX
    setDeepDrawerWidth(newWidth)
  }, [isDragging, dragStartX, dragStartWidth, setDeepDrawerWidth])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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

  // Show expand button when drawer is minimized or closed (desktop only)
  if ((!showDeepDrawer || isDeepDrawerMinimized) && isDesktop) {
    return (
      <div
        className="fixed right-0 top-32 z-40"
        style={{
          width: '40px',
          height: '80px',
        }}
      >
        <div
          className="h-full bg-white hover:bg-gray-50 text-gray-700 rounded-l-lg shadow-lg cursor-pointer transition-all duration-200 flex items-center justify-center hover:scale-105"
          style={{
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          }}
          onClick={() => {
            if (!showDeepDrawer) {
              openDeepDrawer()
            } else {
              maximizeDeepDrawer()
            }
          }}
          aria-label={dictionary.wordLookup.expandDrawer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!showDeepDrawer) {
                openDeepDrawer()
              } else {
                maximizeDeepDrawer()
              }
            }
          }}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </div>
      </div>
    )
  }

  // Mobile drawer
  if (!isDesktop) {
    return (
      <>
        {/* Toast notification */}
        {showToast && (
          <div
            className={cn(
              "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300",
              showToast.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {showToast.message}
          </div>
        )}

        <Drawer open={showDeepDrawer} onOpenChange={(open) => {
          if (!open) closeDeepDrawer()
        }}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>{dictionary.wordLookup.detailedLearning}</DrawerTitle>
              <DrawerDescription>
                {deepTabs.length > 0 ? deepTabs[deepTabs.length - 1].title : dictionary.wordLookup.selectTextToLearn}
              </DrawerDescription>
            </DrawerHeader>
            
            {/* Mobile tab bar */}
            {deepTabs.length > 0 && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {deepTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
                        tab.id === activeTabId
                          ? "bg-purple-600 text-white scale-105 shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      onClick={() => switchToTab(tab.id)}
                    >
                      <span className="truncate max-w-[120px]">{tab.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile content */}
            <div className="flex-1 overflow-y-auto px-4 pb-20">
              {activeTab ? (
                <div className="space-y-4">
                  {activeTab.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                      <span className="text-gray-600">{dictionary.wordLookup.generating}</span>
                    </div>
                  ) : activeTab.content ? (
                    <div className="animate-in fade-in duration-300">
                      <div 
                        className="prose prose-sm max-w-none word-lookup-content"
                        dangerouslySetInnerHTML={{ __html: marked(activeTab.content) }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">{dictionary.wordLookup.noContent}</p>
                      <button
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {dictionary.wordLookup.regenerate}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <ChevronLeft className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">
                    {dictionary.wordLookup.selectTextToLearn}
                  </h3>
                  <p className="text-gray-500">
                    {dictionary.wordLookup.selectTextToLearnDescription}
                  </p>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // Desktop state
  return (
    <>
      {/* Toast notification */}
      {showToast && (
        <div
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300",
            showToast.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
          )}
        >
          {showToast.message}
        </div>
      )}

      <div
        ref={drawerRef}
        tabIndex={-1}
        data-container="deep-learning-drawer"
        className={cn(
          "fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl z-40 flex transition-all duration-300 ease-out",
          showDeepDrawer ? "translate-x-0" : "translate-x-full",
          className
        )}
        style={{ 
          width: `${deepDrawerWidth}px`,
        }}
      >
        {/* Integrated collapse button - moves with drawer */}
        <div
          className="absolute -left-10 top-32 z-50"
          style={{
            width: '40px',
            height: '80px',
          }}
        >
          <div
            className="h-full bg-white hover:bg-gray-50 text-gray-700 rounded-l-lg shadow-lg cursor-pointer transition-all duration-200 flex items-center justify-center hover:scale-105"
            style={{
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
            }}
            onClick={minimizeDeepDrawer}
            aria-label={dictionary.wordLookup.minimizeDrawer}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                minimizeDeepDrawer()
              }
            }}
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </div>
        </div>

        {/* Main drawer content */}
        <div className="flex flex-col h-full w-full">
          {/* Drag handle with accessibility */}
          <div
            className="absolute left-0 top-0 w-1 h-full bg-transparent hover:bg-purple-400 cursor-col-resize z-50 transition-colors"
            onMouseDown={handleMouseDown}
            style={{
              background: isDragging ? '#a855f7' : 'transparent'
            }}
            role="separator"
            aria-valuenow={deepDrawerWidth}
            aria-valuemin={300}
            aria-valuemax={800}
            aria-label="Resize drawer"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                setDeepDrawerWidth(Math.max(300, deepDrawerWidth - 10))
              } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                setDeepDrawerWidth(Math.min(800, deepDrawerWidth + 10))
              }
            }}
          />

          {/* Header */}
          <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{dictionary.wordLookup.detailedLearning}</h2>
              <button
                onClick={closeDeepDrawer}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title={dictionary.wordLookup.closeDrawer}
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Tab Bar */}
            {deepTabs.length > 0 && (
              <div className="flex space-x-1 overflow-x-auto pb-1">
                {deepTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                      tab.id === activeTabId
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => switchToTab(tab.id)}
                  >
                    <span className="truncate max-w-[120px]">{tab.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeDeepTab(tab.id)
                      }}
                      className="p-0.5 hover:bg-gray-300 rounded"
                      title={dictionary.wordLookup.closeTab}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
            {activeTab ? (
              <div className="space-y-4">
                {activeTab.isLoading ? (
                  <div className="space-y-4">
                    {/* Loading skeleton */}
                    <div className="animate-pulse">
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    
                    {/* Loading indicator */}
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-25"></div>
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      </div>
                      <span className="mt-4 text-gray-600">{dictionary.wordLookup.generating}</span>
                      <div className="mt-2 h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  </div>
                ) : activeTab.content ? (
                  <div className="animate-in fade-in duration-300">
                    <div 
                      className="prose prose-sm max-w-none word-lookup-content"
                      dangerouslySetInnerHTML={{ __html: marked(activeTab.content) }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">{dictionary.wordLookup.noContent}</p>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {dictionary.wordLookup.regenerate}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                  <ChevronLeft className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  {dictionary.wordLookup.selectTextToLearn}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {dictionary.wordLookup.selectTextToLearnDescription}
                </p>
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Alt+[1-5]: {dictionary.wordLookup.shortcuts}</span>
              <span>Cmd/Ctrl+K: {dictionary.common.search}</span>
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">
              {dictionary.wordLookup.keyboardShortcuts}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}