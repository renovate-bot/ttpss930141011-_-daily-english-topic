import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
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
  note?: string
  service?: string
  fallbackService?: string
  fromCache?: boolean
  error?: string
}

export interface DeepExplanationTab {
  id: string
  title: string
  content: string
  isLoading: boolean
  timestamp: Date
  originalText: string
}

interface WordLookupState {
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

interface WordLookupActions {
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
  explainText: (text: string, context?: string) => Promise<string>
  
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

export const useWordLookupStore = create<WordLookupState & WordLookupActions>()(
  devtools(
    (set, get) => ({
      // Initial state
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
      isLoadingTranslation: false,

      // Selection management
      setActiveSelection: (selection) => set({ activeSelection: selection }),
      
      clearSelection: () => set({
        activeSelection: null,
        showQuickLookup: false,
        showContextMenu: false,
        showTranslationPopup: false
      }),

      // UI controls
      showQuickLookupPopup: (selection) => set({
        activeSelection: selection,
        showQuickLookup: true,
        showContextMenu: false,
        showTranslationPopup: false
      }),

      hideQuickLookup: () => set({ showQuickLookup: false }),

      showContextMenuAt: (selection) => set({
        activeSelection: selection,
        showContextMenu: true,
        showQuickLookup: false,
        showTranslationPopup: false
      }),

      hideContextMenu: () => set({ showContextMenu: false }),

      showTranslationResult: () => set({
        showTranslationPopup: true,
        showContextMenu: false,
        showDeepDrawer: false
      }),

      hideTranslationPopup: () => set({ showTranslationPopup: false }),

      openDeepDrawer: () => set({
        showDeepDrawer: true,
        isDeepDrawerMinimized: false,
        showTranslationPopup: false,
        showContextMenu: false
      }),

      closeDeepDrawer: () => set({
        showDeepDrawer: false,
        isDeepDrawerMinimized: true
        // Keep tabs - don't clear them
      }),

      minimizeDeepDrawer: () => set({ isDeepDrawerMinimized: true }),

      maximizeDeepDrawer: () => set({
        isDeepDrawerMinimized: false,
        showDeepDrawer: true
      }),

      toggleDeepDrawerMinimized: () => set(state => ({
        isDeepDrawerMinimized: !state.isDeepDrawerMinimized
      })),

      setDeepDrawerWidth: (width) => {
        const clampedWidth = Math.max(300, Math.min(800, width))
        set({ deepDrawerWidth: clampedWidth })
      },

      // Data fetching
      lookupWord: async (word) => {
        set({ isLoadingDictionary: true })
        
        try {
          const response = await fetch('/api/dictionary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              word, 
              userLanguage: get().userLanguage 
            })
          })
          
          if (!response.ok) throw new Error('Dictionary lookup failed')
          
          const data = await response.json()
          set({ 
            currentDictionary: data,
            isLoadingDictionary: false
          })
        } catch (error) {
          console.error('Dictionary lookup error:', error)
          set({ isLoadingDictionary: false })
        }
      },

      translateText: async (text) => {
        set({ isLoadingTranslation: true })
        
        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              targetLanguage: get().userLanguage,
              context: get().activeSelection?.element?.textContent?.slice(0, 500)
            })
          })
          
          if (!response.ok) throw new Error('Translation failed')
          
          const data = await response.json()
          set({ 
            currentTranslation: data,
            isLoadingTranslation: false
          })
          get().showTranslationResult()
        } catch (error) {
          console.error('Translation error:', error)
          set({ isLoadingTranslation: false })
        }
      },

      explainText: async (text, context) => {
        const tabId = get().createDeepTab(text)
        
        try {
          const response = await fetch('/api/deep-explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              userLanguage: get().userLanguage,
              context: context || get().activeSelection?.element?.textContent?.slice(0, 500),
              difficulty: 'intermediate'
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
            get().updateDeepTab(tabId, content, true)
          }
          
          get().updateDeepTab(tabId, content, false)
          return tabId
        } catch (error) {
          console.error('Deep explanation error:', error)
          get().updateDeepTab(tabId, 'Failed to load explanation. Please try again.', false)
          return tabId
        }
      },

      // Tab management
      createDeepTab: (text, content = '') => {
        const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newTab: DeepExplanationTab = {
          id: tabId,
          title: text.length > 20 ? `${text.slice(0, 20)}...` : text,
          content,
          isLoading: true,
          timestamp: new Date(),
          originalText: text
        }
        
        set(state => ({
          deepTabs: [...state.deepTabs, newTab],
          activeTabId: tabId,
          showDeepDrawer: true,
          isDeepDrawerMinimized: false
        }))
        
        return tabId
      },

      updateDeepTab: (tabId, content, isLoading = false) => {
        set(state => ({
          deepTabs: state.deepTabs.map(tab =>
            tab.id === tabId ? { ...tab, content, isLoading } : tab
          )
        }))
      },

      closeDeepTab: (tabId) => {
        set(state => {
          const newTabs = state.deepTabs.filter(tab => tab.id !== tabId)
          const newActiveTabId = state.activeTabId === tabId
            ? newTabs[newTabs.length - 1]?.id || null
            : state.activeTabId
          
          return {
            deepTabs: newTabs,
            activeTabId: newActiveTabId
          }
        })
      },

      switchToTab: (tabId) => set({ activeTabId: tabId }),

      // Settings
      setUserLanguage: (language) => set({ userLanguage: language }),

      togglePronunciation: () => set(state => ({
        pronunciationEnabled: !state.pronunciationEnabled
      })),

      // Utilities
      playPronunciation: (word, audioUrl) => {
        if (!get().pronunciationEnabled) return
        
        if (audioUrl) {
          const audio = new Audio(audioUrl)
          audio.play().catch(console.error)
        } else {
          // Fallback to speech synthesis
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.lang = 'en-US'
          speechSynthesis.speak(utterance)
        }
      }
    }),
    {
      name: 'word-lookup-store',
    }
  )
)