'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { TextSelection } from '@/hooks/useTextSelection'

export interface DictionaryEntry {
  word: string
  phonetic?: string
  audioUrl?: string
  definitions: Array<{
    partOfSpeech: string
    definition: string
    translation: string
    example?: string
  }>
}

export interface TranslationResult {
  originalText: string
  translation: string
  confidence: number
  alternatives?: string[]
  note?: string // 教育性注釋
  service?: string // 使用的翻譯服務
  fallbackService?: string // 降級使用的服務
  fromCache?: boolean // 是否來自快取
  error?: string // 錯誤訊息
}

export interface DeepExplanationTab {
  id: string
  title: string
  content: string
  isLoading: boolean
  timestamp: Date
  originalText: string
}

export interface WordLookupState {
  // Current selection
  activeSelection: TextSelection | null
  
  // UI states
  showQuickLookup: boolean
  showContextMenu: boolean
  showTranslationPopup: boolean
  showDeepDrawer: boolean
  isDeepDrawerMinimized: boolean
  deepDrawerWidth: number
  
  // Data
  currentDictionary: DictionaryEntry | null
  currentTranslation: TranslationResult | null
  deepTabs: DeepExplanationTab[]
  activeTabId: string | null
  
  // Settings
  userLanguage: string
  pronunciationEnabled: boolean
  
  // Loading states
  isLoadingDictionary: boolean
  isLoadingTranslation: boolean
}

export interface WordLookupActions {
  // Selection management
  setActiveSelection: (selection: TextSelection | null) => void
  clearSelection: () => void
  
  // UI controls
  showQuickLookupPopup: (selection: TextSelection) => void
  hideQuickLookup: () => void
  showContextMenuAt: (selection: TextSelection) => void
  hideContextMenu: () => void
  showTranslationResult: () => void
  hideTranslationPopup: () => void
  openDeepDrawer: () => void
  closeDeepDrawer: () => void
  minimizeDeepDrawer: () => void
  maximizeDeepDrawer: () => void
  toggleDeepDrawerMinimized: () => void
  setDeepDrawerWidth: (width: number) => void
  
  // Data fetching
  lookupWord: (word: string) => Promise<void>
  translateText: (text: string) => Promise<void>
  explainText: (text: string, context?: string) => Promise<string> // returns tabId
  
  // Tab management
  createDeepTab: (text: string, content?: string) => string
  updateDeepTab: (tabId: string, content: string, isLoading?: boolean) => void
  closeDeepTab: (tabId: string) => void
  switchToTab: (tabId: string) => void
  
  // Settings
  setUserLanguage: (language: string) => void
  togglePronunciation: () => void
  
  // Utilities
  playPronunciation: (word: string, audioUrl?: string) => void
}

export type WordLookupContextType = WordLookupState & WordLookupActions

const WordLookupContext = createContext<WordLookupContextType | null>(null)

// Default state
const initialState: WordLookupState = {
  activeSelection: null,
  showQuickLookup: false,
  showContextMenu: false,
  showTranslationPopup: false,
  showDeepDrawer: false,
  isDeepDrawerMinimized: false,
  deepDrawerWidth: 400,
  currentDictionary: null,
  currentTranslation: null,
  deepTabs: [],
  activeTabId: null,
  userLanguage: 'zh-TW',
  pronunciationEnabled: true,
  isLoadingDictionary: false,
  isLoadingTranslation: false
}

interface WordLookupProviderProps {
  children: ReactNode
  defaultLanguage?: string
}

export function WordLookupProvider({ 
  children, 
  defaultLanguage = 'zh-TW'
}: WordLookupProviderProps) {
  const [state, setState] = useState<WordLookupState>({
    ...initialState,
    userLanguage: defaultLanguage
  })

  // Selection management
  const setActiveSelection = useCallback((selection: TextSelection | null) => {
    setState(prev => ({ ...prev, activeSelection: selection }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeSelection: null,
      showQuickLookup: false,
      showContextMenu: false,
      showTranslationPopup: false
    }))
  }, [])

  // UI controls
  const showQuickLookupPopup = useCallback((selection: TextSelection) => {
    setState(prev => ({
      ...prev,
      activeSelection: selection,
      showQuickLookup: true,
      showContextMenu: false,
      showTranslationPopup: false
    }))
  }, [])

  const hideQuickLookup = useCallback(() => {
    setState(prev => ({ ...prev, showQuickLookup: false }))
  }, [])

  const showContextMenuAt = useCallback((selection: TextSelection) => {
    setState(prev => ({
      ...prev,
      activeSelection: selection,
      showContextMenu: true,
      showQuickLookup: false,
      showTranslationPopup: false
    }))
  }, [])

  const hideContextMenu = useCallback(() => {
    setState(prev => ({ ...prev, showContextMenu: false }))
  }, [])

  const showTranslationResult = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showTranslationPopup: true,
      showContextMenu: false,
      showDeepDrawer: false
    }))
  }, [])

  const hideTranslationPopup = useCallback(() => {
    setState(prev => ({ ...prev, showTranslationPopup: false }))
  }, [])

  const openDeepDrawer = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showDeepDrawer: true,
      showTranslationPopup: false,
      showContextMenu: false
    }))
  }, [])

  const closeDeepDrawer = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showDeepDrawer: false,
      deepTabs: [],
      activeTabId: null
    }))
  }, [])

  const minimizeDeepDrawer = useCallback(() => {
    setState(prev => ({ ...prev, isDeepDrawerMinimized: true }))
  }, [])

  const maximizeDeepDrawer = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isDeepDrawerMinimized: false,
      showDeepDrawer: true 
    }))
  }, [])

  const toggleDeepDrawerMinimized = useCallback(() => {
    setState(prev => ({ ...prev, isDeepDrawerMinimized: !prev.isDeepDrawerMinimized }))
  }, [])

  const setDeepDrawerWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(300, Math.min(800, width))
    setState(prev => ({ ...prev, deepDrawerWidth: clampedWidth }))
  }, [])

  // Data fetching
  const lookupWord = useCallback(async (word: string) => {
    setState(prev => ({ ...prev, isLoadingDictionary: true }))
    
    try {
      const response = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word, 
          userLanguage: state.userLanguage 
        })
      })
      
      if (!response.ok) throw new Error('Dictionary lookup failed')
      
      const dictionary: DictionaryEntry = await response.json()
      setState(prev => ({ 
        ...prev, 
        currentDictionary: dictionary,
        isLoadingDictionary: false
      }))
    } catch (error) {
      console.error('Dictionary lookup error:', error)
      setState(prev => ({ ...prev, isLoadingDictionary: false }))
    }
  }, [state.userLanguage])

  const translateText = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isLoadingTranslation: true }))
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage: 'en',
          targetLanguage: state.userLanguage,
          context: state.activeSelection?.element?.textContent?.slice(0, 200)
        })
      })
      
      if (!response.ok) throw new Error('Translation failed')
      
      const translation: TranslationResult = await response.json()
      setState(prev => ({ 
        ...prev, 
        currentTranslation: translation,
        isLoadingTranslation: false
      }))
      
      // Show translation popup
      showTranslationResult()
    } catch (error) {
      console.error('Translation error:', error)
      setState(prev => ({ ...prev, isLoadingTranslation: false }))
    }
  }, [state.userLanguage, state.activeSelection])

  const explainText = useCallback(async (text: string, context?: string): Promise<string> => {
    const tabId = createDeepTab(text)
    
    try {
      const response = await fetch('/api/deep-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userLanguage: state.userLanguage,
          context: context || state.activeSelection?.element?.textContent?.slice(0, 500),
          difficulty: 'intermediate' // Could be configurable
        })
      })
      
      if (!response.ok) throw new Error('Deep explanation failed')
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      let content = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        content += chunk
        updateDeepTab(tabId, content, true)
      }
      
      updateDeepTab(tabId, content, false)
      return tabId
    } catch (error) {
      console.error('Deep explanation error:', error)
      updateDeepTab(tabId, 'Failed to load explanation. Please try again.', false)
      return tabId
    }
  }, [state.userLanguage, state.activeSelection])

  // Tab management
  const createDeepTab = useCallback((text: string, content = ''): string => {
    const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTab: DeepExplanationTab = {
      id: tabId,
      title: text.length > 20 ? `${text.slice(0, 20)}...` : text,
      content,
      isLoading: true,
      timestamp: new Date(),
      originalText: text
    }
    
    setState(prev => ({
      ...prev,
      deepTabs: [...prev.deepTabs, newTab],
      activeTabId: tabId,
      showDeepDrawer: true
    }))
    
    return tabId
  }, [])

  const updateDeepTab = useCallback((tabId: string, content: string, isLoading = false) => {
    setState(prev => ({
      ...prev,
      deepTabs: prev.deepTabs.map(tab =>
        tab.id === tabId ? { ...tab, content, isLoading } : tab
      )
    }))
  }, [])

  const closeDeepTab = useCallback((tabId: string) => {
    setState(prev => {
      const newTabs = prev.deepTabs.filter(tab => tab.id !== tabId)
      const newActiveTabId = prev.activeTabId === tabId 
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
        : prev.activeTabId
      
      return {
        ...prev,
        deepTabs: newTabs,
        activeTabId: newActiveTabId,
        showDeepDrawer: newTabs.length > 0
      }
    })
  }, [])

  const switchToTab = useCallback((tabId: string) => {
    setState(prev => ({ ...prev, activeTabId: tabId }))
  }, [])

  // Settings
  const setUserLanguage = useCallback((language: string) => {
    setState(prev => ({ ...prev, userLanguage: language }))
  }, [])

  const togglePronunciation = useCallback(() => {
    setState(prev => ({ ...prev, pronunciationEnabled: !prev.pronunciationEnabled }))
  }, [])

  // Utilities
  const playPronunciation = useCallback((word: string, audioUrl?: string) => {
    if (!state.pronunciationEnabled) return
    
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(console.error)
    } else {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [state.pronunciationEnabled])

  const contextValue: WordLookupContextType = {
    ...state,
    setActiveSelection,
    clearSelection,
    showQuickLookupPopup,
    hideQuickLookup,
    showContextMenuAt,
    hideContextMenu,
    showTranslationResult,
    hideTranslationPopup,
    openDeepDrawer,
    closeDeepDrawer,
    minimizeDeepDrawer,
    maximizeDeepDrawer,
    toggleDeepDrawerMinimized,
    setDeepDrawerWidth,
    lookupWord,
    translateText,
    explainText,
    createDeepTab,
    updateDeepTab,
    closeDeepTab,
    switchToTab,
    setUserLanguage,
    togglePronunciation,
    playPronunciation
  }

  return (
    <WordLookupContext.Provider value={contextValue}>
      {children}
    </WordLookupContext.Provider>
  )
}

export function useWordLookup() {
  const context = useContext(WordLookupContext)
  if (!context) {
    throw new Error('useWordLookup must be used within a WordLookupProvider')
  }
  return context
}