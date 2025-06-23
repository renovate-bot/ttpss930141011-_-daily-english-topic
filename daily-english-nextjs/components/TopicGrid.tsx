"use client";

import React, { useState, useEffect } from 'react';
import { Topic } from '@/lib/topics';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, X as IconX, Tag as IconTag, Sparkles, TrendingUp, Clock, Users, Calendar, BarChart3, ArrowUp, ArrowDown, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { type Locale } from '@/i18n-config';
import { type Dictionary } from '@/types/dictionary';

interface TopicGridProps {
  topics: Topic[];
  lang?: Locale;
  dictionary?: Dictionary;
}

interface FilterState {
  tags: string[];
  category: string;
  difficulty: string;
}

type SortOrder = 'asc' | 'desc';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300
    }
  }
};

const heroVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100,
      delay: 0.2
    }
  }
};

export default function TopicGrid({ topics, lang = 'zh-TW', dictionary }: TopicGridProps) {
  // Default dictionary fallback
  const defaultDict: Dictionary = {
    common: {
      loading: 'Loading...',
      error: 'Error occurred',
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
      learningPreferences: 'Learning Preferences'
    },
    homepage: {
      hero: {
        title: 'Daily English',
        subtitle: 'Topics',
        description: 'Learn English through interactive slide presentations from real Reddit discussions',
        masterEnglish: 'Master English',
        throughConversations: 'Through Conversations'
      },
      stats: {
        interactiveTopics: 'Interactive Topics',
        realConversations: 'Real Conversations',
        daily: 'Daily Updates',
        freshContent: 'Fresh Content',
        interactiveLearning: 'Interactive Learning'
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
        clearAll: 'Clear All'
      },
      search: {
        placeholder: 'Search topics...',
        searchTags: 'Search tags...',
        noResults: 'No results found',
        tryDifferent: 'Try different keywords'
      },
      topicCard: {
        slides: 'slides',
        readMore: 'Start Reading'
      },
      topicCount: {
        showing: 'Showing',
        of: 'of',
        topics: 'topics'
      },
      emptyState: {
        noTopicsFound: 'No topics found',
        tryAdjusting: 'Try adjusting your search or filters',
        clearAllFilters: 'Clear all filters'
      },
      tags: {
        noTagsFound: 'No tags found'
      }
    },
    wordLookup: {
      loading: 'Looking up...',
      notFound: 'Word not found',
      checkSpelling: 'Please check spelling',
      viewMore: 'View more definitions',
      close: 'Close',
      playAudio: 'Play pronunciation',
      deepExplanation: 'Deep explanation',
      examples: 'Examples',
      synonyms: 'Synonyms',
      antonyms: 'Antonyms',
      etymology: 'Etymology',
      relatedWords: 'Related words',
      translating: 'Translating...',
      original: 'Original',
      translation: 'Translation',
      copyTranslation: 'Copy Translation',
      accuracy: 'Accuracy',
      otherTranslations: 'Other Translations',
      quickTranslation: 'Quick Translation',
      translateNow: 'Translate selected text now',
      deepAnalysis: 'Deep Analysis',
      detailedExplanation: 'Get detailed explanations and examples',
      addToNotes: 'Add to Notes',
      saveToNotes: 'Save to your learning notes',
      words: 'words',
      detailedLearning: 'Detailed Learning',
      closeDrawer: 'Close Drawer',
      minimizeDrawer: 'Minimize Drawer',
      expandDrawer: 'Expand Drawer',
      closeTab: 'Close Tab',
      generating: 'Generating...',
      regenerate: 'Regenerate',
      noContent: 'No Content',
      aiAssistant: 'AI Assistant',
      selectTextToLearn: 'Select some text to start learning',
      selectTextToLearnDescription: 'Select and highlight any text, then click the Deep Analysis option to start learning the detailed explanation of the vocabulary or sentence pattern.',
      shortcuts: 'Shortcuts',
      keyboardShortcuts: 'Esc: Close | Ctrl+Tab: Switch Tab'
    }
  }

  const dict = dictionary || defaultDict;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = dict.homepage;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ tags: [], category: 'all', difficulty: 'all' });
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoaded, setIsLoaded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const allTags = Array.from(new Set(topics.flatMap(t => t.tags)));
  const allCategories = Array.from(new Set(topics.map(t => t.category).filter((cat): cat is string => Boolean(cat))));
  const allDifficulties = Array.from(new Set(topics.map(t => t.difficulty).filter((diff): diff is NonNullable<Topic['difficulty']> => Boolean(diff))));

  const categoryOptions = [
    { value: 'all', label: t('filters.allCategories') },
    ...allCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const difficultyOptions = [
    { value: 'all', label: t('filters.allLevels') },
    ...Array.from(new Set(allDifficulties.map(diff => diff.toLowerCase()))).map(diff => ({ 
      value: diff, 
      label: diff.charAt(0).toUpperCase() + diff.slice(1) 
    }))
  ];

  const filteredTopics = topics
    .filter(topic => {
      const matchesSearch =
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        filters.tags.length === 0 || filters.tags.some(tag => topic.tags.includes(tag));
      const matchesCategory =
        filters.category === 'all' || topic.category === filters.category;
      const matchesDifficulty =
        filters.difficulty === 'all' || (topic.difficulty?.toLowerCase() || '') === filters.difficulty;
      return matchesSearch && matchesTags && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const clearAllFilters = () => setFilters({ tags: [], category: 'all', difficulty: 'all' });

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <motion.div 
        className="relative pt-24 pb-16 px-6"
        variants={heroVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-16 left-16 text-purple-300 opacity-20"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <BookOpen size={32} />
            </motion.div>
            <motion.div
              className="absolute top-32 right-20 text-blue-300 opacity-20"
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Sparkles size={28} />
            </motion.div>
            <motion.div
              className="absolute bottom-16 left-1/4 text-indigo-300 opacity-20"
              animate={{ 
                y: [0, -15, 0],
                x: [0, 10, 0]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
            >
              <TrendingUp size={30} />
            </motion.div>
          </div>

          {/* Main Title */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
              {t('hero.title')}
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('hero.subtitle')}
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {t('hero.description')} 
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold"> {t('hero.masterEnglish')}</span> {t('hero.throughConversations')}
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{topics.length}+</h3>
              <p className="text-gray-300">{t('stats.interactiveTopics')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">10K+</h3>
              <p className="text-gray-300">{t('stats.realConversations')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{t('stats.daily')}</h3>
              <p className="text-gray-300">{t('stats.freshContent')}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Search and Filters */}
        <motion.div
          className="mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            {/* Search Bar */}
            <div className="relative w-full mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 transition-all duration-300"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Category Filter */}
                <Popover open={openDropdown === 'category'} onOpenChange={(open) => setOpenDropdown(open ? 'category' : null)}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <Filter className="w-4 h-4 mr-2" /> 
                      {categoryOptions.find(opt => opt.value === filters.category)?.label || t('filters.category')}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white mb-3">{t('filters.selectCategory')}</h4>
                      {categoryOptions.map(option => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          className={`w-full justify-start text-sm ${
                            filters.category === option.value 
                              ? 'bg-purple-600/30 text-purple-200' 
                              : 'text-gray-300 hover:bg-purple-600/20 hover:text-white'
                          }`}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, category: option.value }));
                            setOpenDropdown(null);
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Difficulty Filter */}
                <Popover open={openDropdown === 'difficulty'} onOpenChange={(open) => setOpenDropdown(open ? 'difficulty' : null)}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> 
                      {difficultyOptions.find(opt => opt.value === filters.difficulty)?.label || t('filters.difficulty')}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white mb-3">{t('filters.selectDifficulty')}</h4>
                      {difficultyOptions.map(option => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          className={`w-full justify-start text-sm ${
                            filters.difficulty === option.value 
                              ? 'bg-purple-600/30 text-purple-200' 
                              : 'text-gray-300 hover:bg-purple-600/20 hover:text-white'
                          }`}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, difficulty: option.value }));
                            setOpenDropdown(null);
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  {sortOrder === 'desc' ? (
                    <><ArrowDown className="w-4 h-4 mr-2" /> {t('filters.newestFirst')}</>
                  ) : (
                    <><ArrowUp className="w-4 h-4 mr-2" /> {t('filters.oldestFirst')}</>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Tags Filter */}
                <Popover open={openDropdown === 'tags'} onOpenChange={(open) => setOpenDropdown(open ? 'tags' : null)}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                      <IconTag className="w-4 h-4 mr-2" /> 
                      {t('filters.tags')} {filters.tags.length > 0 && `(${filters.tags.length})`}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
                    <Command className="bg-transparent">
                      <CommandInput 
                        placeholder={t('search.searchTags')} 
                        className="text-white placeholder:text-gray-400 border-gray-700" 
                      />
                      <CommandList className="max-h-64 overflow-y-auto">
                        <CommandEmpty className="text-gray-400 py-4 text-center">{t('tags.noTagsFound')}</CommandEmpty>
                        <CommandGroup>
                          {allTags.map(tag => (
                            <CommandItem
                              key={tag}
                              onSelect={() => {
                                const newTags = filters.tags.includes(tag)
                                  ? filters.tags.filter(t => t !== tag)
                                  : [...filters.tags, tag];
                                setFilters(prev => ({ ...prev, tags: newTags }));
                                // Don't close the dropdown for tags as users might want to select multiple
                              }}
                              className="text-gray-200 hover:bg-purple-600/20 hover:text-white cursor-pointer transition-colors"
                            >
                              <Checkbox 
                                checked={filters.tags.includes(tag)} 
                                className="mr-2 border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" 
                              />
                              <span className="capitalize">{tag}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Clear Filters Button */}
                {(filters.tags.length > 0 || filters.category !== 'all' || filters.difficulty !== 'all') && (
                  <Button 
                    variant="ghost" 
                    onClick={clearAllFilters}
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <IconX className="w-4 h-4 mr-1" /> {t('filters.clearAll')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Topics Count */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <p className="text-gray-300">
            {t('topicCount.showing')} <span className="text-purple-400 font-semibold">{filteredTopics.length}</span> {t('topicCount.of')} <span className="text-blue-400 font-semibold">{topics.length}</span> {t('topicCount.topics')}
          </p>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic.date}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group"
              >
                <Card className="h-full flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Card Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                    {index + 1}
                  </div>
                  
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="text-xl text-white group-hover:text-purple-200 transition-colors duration-300 pr-10">
                      {topic.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(topic.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {topic.difficulty && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span className="capitalize">{topic.difficulty}</span>
                        </div>
                      )}
                    </div>
                    {topic.category && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                          {topic.category}
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col relative z-10">
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {topic.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs bg-white/10 border-white/30 text-gray-200 hover:bg-white/20 transition-colors duration-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-white/10 border-white/30 text-gray-400">
                            +{topic.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105" 
                        asChild
                      >
                        <a href={`/${lang}/topic/${topic.date}`} className="flex items-center justify-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('topicCard.readMore')}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredTopics.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-md mx-auto border border-white/20">
              <BookOpen className="mx-auto mb-6 w-16 h-16 text-gray-400" />
              <h3 className="text-2xl font-bold text-white mb-3">{t('emptyState.noTopicsFound')}</h3>
              <p className="text-gray-300 mb-6">{t('emptyState.tryAdjusting')}</p>
              <Button 
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {t('emptyState.clearAllFilters')}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}