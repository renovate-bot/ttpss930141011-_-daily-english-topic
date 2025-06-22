'use client'

import React, { ReactNode, useEffect } from 'react'
import { useWordLookupStore } from '@/stores/useWordLookupStore'

interface WordLookupProviderProps {
  children: ReactNode
  defaultLanguage?: string
}

export function WordLookupProvider({ 
  children, 
  defaultLanguage = 'zh-TW'
}: WordLookupProviderProps) {
  const setUserLanguage = useWordLookupStore(state => state.setUserLanguage)

  useEffect(() => {
    setUserLanguage(defaultLanguage)
  }, [defaultLanguage, setUserLanguage])

  return <>{children}</>
}