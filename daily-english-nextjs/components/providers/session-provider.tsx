/**
 * NextAuth session provider wrapper.
 * Provides session context to the entire application.
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

interface SessionProviderProps {
  children: React.ReactNode
}

/**
 * Session provider component for NextAuth.
 * Wraps the application to provide authentication context.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}