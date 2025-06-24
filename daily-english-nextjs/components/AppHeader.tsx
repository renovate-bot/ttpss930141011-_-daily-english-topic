'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Globe, LogIn } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSignInModal } from '@/hooks/use-sign-in-modal'
import { UserNav } from '@/components/auth/user-nav'
import { type Locale } from '@/i18n-config'
import { type Dictionary } from '@/types/dictionary'

interface LanguageOption {
  code: Locale
  name: string
  nativeName: string
}

interface AppHeaderProps {
  className?: string
  dictionary: Dictionary
  locale: Locale
}



// Available language options
const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: '日本語', nativeName: '日本語' },
  { code: 'ko', name: '한국어', nativeName: '한국어' }
]

/**
 * Application header component with language switching and sign in.
 * Uses Next.js App Router official i18n pattern.
 */
export function AppHeader({ className = '', dictionary, locale }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { open: openSignInModal } = useSignInModal()


  /**
   * Handles language change by redirecting to the same path with new locale.
   */
  const handleLanguageChange = (newLocale: Locale) => {
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
    setShowLanguageMenu(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header 
      className={`bg-transparent backdrop-blur-md border-b border-white/10 fixed top-0 left-0 right-0 z-30 ${className}`}
      data-fixed-element>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Empty left side */}
          <div></div>

          {/* Right side - Language and Sign In */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={dictionary.common.changeLanguage}
              >
                <Globe className="h-5 w-5 text-white" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 py-2 z-50">
                  <div className="px-3 py-2 text-xs font-medium text-gray-300 border-b border-white/20">
                    {dictionary.common.selectLanguage}
                  </div>
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                        locale === language.code 
                          ? 'text-purple-400 bg-purple-500/20' 
                          : 'text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{language.name}</span>
                        {locale === language.code && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In Button or User Nav */}
            {session?.user ? (
              <UserNav />
            ) : (
              <button
                className="hidden gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors md:flex items-center"
                onClick={() => openSignInModal()}
              >
                <span>{dictionary.common.signIn}</span>
                <LogIn className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}