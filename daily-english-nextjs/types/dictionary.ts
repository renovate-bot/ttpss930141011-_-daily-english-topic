export interface Dictionary {
  common: {
    loading: string
    error: string
    retry: string
    cancel: string
    confirm: string
    close: string
    save: string
    delete: string
    edit: string
    search: string
    clear: string
    back: string
    next: string
    previous: string
    submit: string
    success: string
    warning: string
    info: string
    language: string
    changeLanguage: string
    selectLanguage: string
    settings: string
    profile: string
    signIn: string
    signOut: string
    comingSoon: string
    darkMode: string
    notifications: string
    learningPreferences: string
    upgrade: string
    currentPlan: string
    manageBilling: string
    viewPlans: string
    voiceCallAuthRequired: string
    voiceCallAuthDescription: string
    voiceCallAuthAction: string
    voiceCallError: string
    voiceCallErrorDescription: string
  }
  homepage: {
    hero: {
      title: string
      subtitle: string
      description: string
      masterEnglish: string
      throughConversations: string
    }
    stats: {
      interactiveTopics: string
      realConversations: string
      daily: string
      freshContent: string
      interactiveLearning: string
    }
    filters: {
      all: string
      allCategories: string
      allLevels: string
      difficulty: string
      category: string
      tags: string
      selectCategory: string
      selectDifficulty: string
      newestFirst: string
      oldestFirst: string
      clearAll: string
    }
    search: {
      placeholder: string
      searchTags: string
      noResults: string
      tryDifferent: string
    }
    topicCard: {
      slides: string
      readMore: string
    }
    topicCount: {
      showing: string
      of: string
      topics: string
    }
    emptyState: {
      noTopicsFound: string
      tryAdjusting: string
      clearAllFilters: string
    }
    tags: {
      noTagsFound: string
    }
  }
  wordLookup: {
    loading: string
    notFound: string
    checkSpelling: string
    viewMore: string
    close: string
    playAudio: string
    deepExplanation: string
    examples: string
    synonyms: string
    antonyms: string
    etymology: string
    relatedWords: string
    // Translation popup
    translating: string
    original: string
    translation: string
    copyTranslation: string
    accuracy: string
    otherTranslations: string
    // Context menu
    quickTranslation: string
    translateNow: string
    deepAnalysis: string
    detailedExplanation: string
    addToNotes: string
    saveToNotes: string
    words: string
    // Deep learning drawer
    detailedLearning: string
    closeDrawer: string
    minimizeDrawer: string
    expandDrawer: string
    closeTab: string
    generating: string
    regenerate: string
    noContent: string
    aiAssistant: string
    selectTextToLearn: string
    selectTextToLearnDescription: string
    shortcuts: string
    keyboardShortcuts: string
  }
  pricing: {
    title: string
    subtitle: string
    billingMonthly: string
    billingYearly: string
    save20: string
    mostPopular: string
    perMonth: string
    perYear: string
    planFree: {
      name: string
      price: string
      tagline: string
      features: string[]
      cta: string
    }
    planPro: {
      name: string
      price: string
      yearlyPrice: string
      tagline: string
      features: string[]
      cta: string
    }
  }
  billing: {
    title: string
    needHelp: string
    contactSupport: string
    managePlan: string
    demo: {
      title: string
      description: string
      testCardsLink: string
      forPayments: string
    }
    currentPlan: {
      title: string
      description: string
      monthlyCost: string
      billingCycle: string
      status: string
      expiresOn: string
      nextBilling: string
      monthly: string
      active: string
      canceled: string
      na: string
      upgradeButton: string
      manageButton: string
    }
    usage: {
      title: string
      description: string
      topicsGenerated: string
      translations: string
      apiCalls: string
    }
    tabs: {
      paymentBilling: string
      invoiceHistory: string
    }
    payment: {
      title: string
      description: string
      manageInStripe: string
      secureMessage: string
      clickToView: string
    }
    invoices: {
      title: string
      description: string
      viewInStripe: string
      noInvoices: string
      upgradeToSee: string
      tableHeaders: {
        invoice: string
        date: string
        description: string
        amount: string
        status: string
      }
      paid: string
      planMonthly: string
    }
    security: {
      message: string
    }
    subscription: {
      title: string
      description: string
      currentPlan: string
      status: string
      active: string
      canceled: string
      nextBilling: string
      endsOn: string
      upgradePrompt: string
    }
  }
}