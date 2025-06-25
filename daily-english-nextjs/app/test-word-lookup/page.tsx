'use client'

import { WordLookupProvider } from '@/components/word-lookup/WordLookupProvider'
import { WordLookupManager } from '@/components/word-lookup/WordLookupManager'
import { type Dictionary } from '@/types/dictionary'

// Mock dictionary for testing
const mockDictionary: Dictionary = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    clear: 'Clear',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    language: 'Language',
    changeLanguage: 'Change Language',
    selectLanguage: 'Select Language',
    settings: 'Settings',
    profile: 'Profile',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    comingSoon: 'Coming Soon',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    learningPreferences: 'Learning Preferences',
    upgrade: 'Upgrade',
    currentPlan: 'Current Plan',
    manageBilling: 'Manage Billing',
    viewPlans: 'View Plans',
  },
  homepage: {
    hero: {
      title: 'Daily English Topic',
      subtitle: 'Learn English Daily',
      description: 'Master English through daily conversations',
      masterEnglish: 'Master English',
      throughConversations: 'Through Conversations',
    },
    stats: {
      interactiveTopics: 'Interactive Topics',
      realConversations: 'Real Conversations',
      daily: 'Daily',
      freshContent: 'Fresh Content',
      interactiveLearning: 'Interactive Learning',
    },
    filters: {
      all: 'All',
      allCategories: 'All Categories',
      allLevels: 'All Levels',
      difficulty: 'Difficulty',
      category: 'Category',
      tags: 'Tags',
      selectCategory: 'Select Category',
      selectDifficulty: 'Select Difficulty',
      newestFirst: 'Newest First',
      oldestFirst: 'Oldest First',
      clearAll: 'Clear All',
    },
    search: {
      placeholder: 'Search topics...',
      searchTags: 'Search tags',
      noResults: 'No results found',
      tryDifferent: 'Try different keywords',
    },
    topicCard: {
      slides: 'slides',
      readMore: 'Read More',
    },
    topicCount: {
      showing: 'Showing',
      of: 'of',
      topics: 'topics',
    },
    emptyState: {
      noTopicsFound: 'No topics found',
      tryAdjusting: 'Try adjusting your filters',
      clearAllFilters: 'Clear all filters',
    },
    tags: {
      noTagsFound: 'No tags found',
    },
  },
  wordLookup: {
    loading: '載入中...',
    notFound: '找不到此單字',
    checkSpelling: '請檢查拼寫',
    viewMore: '查看更多定義',
    close: '關閉',
    playAudio: '播放發音',
    deepExplanation: '深度解釋',
    examples: '例句',
    synonyms: '同義詞',
    antonyms: '反義詞',
    etymology: '詞源',
    relatedWords: '相關詞彙',
    // Translation popup
    translating: '翻譯中...',
    original: '原文',
    translation: '翻譯',
    copyTranslation: '複製翻譯',
    accuracy: '準確度',
    otherTranslations: '其他翻譯',
    // Context menu
    quickTranslation: '快速翻譯',
    translateNow: '立即翻譯',
    deepAnalysis: '深度分析',
    detailedExplanation: '詳細解釋',
    addToNotes: '加入筆記',
    saveToNotes: '儲存到筆記',
    words: '個單字',
    // Deep learning drawer
    detailedLearning: '詳細學習',
    closeDrawer: '關閉抽屜',
    minimizeDrawer: '最小化抽屜',
    expandDrawer: '展開抽屜',
    closeTab: '關閉分頁',
    generating: '生成中...',
    regenerate: '重新生成',
    noContent: '無內容',
    aiAssistant: 'AI 助手',
    selectTextToLearn: '選擇文字以開始學習',
    selectTextToLearnDescription: '選擇並反白任何文字，然後點擊「深度分析」選項，即可開始學習該詞彙或句型的詳細解釋。',
    shortcuts: '快捷鍵',
    keyboardShortcuts: '鍵盤快捷鍵',
  },
  pricing: {
    title: 'Choose Your Plan',
    subtitle: 'Unlock all features',
    billingMonthly: 'Monthly',
    billingYearly: 'Yearly',
    save20: 'Save 20%',
    mostPopular: 'Most Popular',
    perMonth: '/month',
    perYear: '/year',
    planFree: {
      name: 'Free',
      price: '$0',
      tagline: 'Start your journey',
      features: ['3 daily topics', 'Basic features'],
      cta: 'Get Started'
    },
    planPro: {
      name: 'Pro',
      price: '$19.99',
      yearlyPrice: '$191.90',
      tagline: 'Complete experience',
      features: ['Unlimited topics', 'All features'],
      cta: 'Upgrade Now'
    }
  },
  billing: {
    title: 'Billing',
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
    managePlan: 'Manage Plan',
    subscription: {
      title: 'Current Subscription',
      description: 'Manage your subscription',
      currentPlan: 'Current Plan',
      status: 'Status',
      active: 'Active',
      canceled: 'Canceled',
      nextBilling: 'Next billing date',
      endsOn: 'Ends on',
      upgradePrompt: 'Upgrade to Pro'
    }
  }
}

export default function TestWordLookupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <WordLookupProvider defaultLanguage="zh-TW">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Word Lookup Test Page
          </h1>
          
          <WordLookupManager className="bg-white text-slate-800 rounded-xl p-8 shadow-2xl" dictionary={mockDictionary}>
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-purple-600">
                  Test Text Selection and Word Lookup
                </h2>
                <p className="text-lg leading-relaxed">
                  Welcome to our <strong>interactive</strong> English learning platform! 
                  Here you can select any word to get detailed explanations, translations, 
                  and pronunciation guides. Try selecting words like &ldquo;beautiful&rdquo;, &ldquo;interesting&rdquo;, 
                  &ldquo;affordable&rdquo;, or &ldquo;explanation&rdquo; to test the features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-purple-600">
                  Advanced Vocabulary
                </h2>
                <p className="text-lg leading-relaxed">
                  This paragraph contains more <em>sophisticated</em> vocabulary. Words like 
                  &ldquo;magnificent&rdquo;, &ldquo;extraordinary&rdquo;, &ldquo;phenomenal&rdquo;, and &ldquo;unprecedented&rdquo; are perfect 
                  for testing the deep explanation feature. The system should provide comprehensive 
                  analysis including etymology, usage patterns, and cultural context.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-purple-600">
                  Common Phrases and Idioms
                </h2>
                <p className="text-lg leading-relaxed">
                  English idioms can be tricky! Phrases like &ldquo;break the ice&rdquo;, &ldquo;piece of cake&rdquo;, 
                  &ldquo;hit the nail on the head&rdquo;, and &ldquo;spill the beans&rdquo; have meanings that go beyond 
                  their literal words. Select these phrases to see how the system handles 
                  multi-word expressions and cultural explanations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-purple-600">
                  Technical Terms
                </h2>
                <p className="text-lg leading-relaxed">
                  For more advanced learners, try technical terms like &ldquo;algorithm&rdquo;, &ldquo;paradigm&rdquo;, 
                  &ldquo;infrastructure&rdquo;, &ldquo;authentication&rdquo;, and &ldquo;optimization&rdquo;. These words often have 
                  specific meanings in professional contexts and should trigger detailed explanations.
                </p>
              </section>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  How to Test:
                </h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Select any word by double-clicking or dragging</li>
                  <li>• Wait for the quick lookup popup to appear</li>
                  <li>• Test the drag functionality by moving the popup</li>
                  <li>• Click &ldquo;查看更多定義&rdquo; to open deep explanation</li>
                  <li>• Try the translation feature with different words</li>
                </ul>
              </div>
            </div>
          </WordLookupManager>
        </div>
      </WordLookupProvider>
    </div>
  )
}