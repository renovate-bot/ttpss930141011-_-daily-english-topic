/**
 * NextAuth v5 configuration with Prisma adapter.
 * Implements production-ready authentication with OAuth providers.
 */

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'

/**
 * NextAuth configuration with Prisma adapter and OAuth providers.
 */
export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  callbacks: {
    /**
     * JWT callback to add user ID to token.
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    
    /**
     * Session callback to add user ID to session.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
    
    /**
     * Sign in callback for additional validation.
     */
    async signIn({ user, account, profile }) {
      // Example: Block certain email domains
      if (user.email?.endsWith('@blocked-domain.com')) {
        return false
      }
      
      // Log sign in for monitoring
      console.log(`[Auth] User signed in: ${user.email} via ${account?.provider}`)
      
      return true
    },
  },
  
  events: {
    /**
     * Log authentication events for monitoring.
     */
    async signIn({ user, account }) {
      console.log(`[Auth Event] Sign in: ${user.email} via ${account?.provider}`)
    },
    async signOut(message) {
      // Log sign out event
      console.log(`[Auth Event] Sign out event triggered`)
    },
    async createUser({ user }) {
      console.log(`[Auth Event] New user created: ${user.email}`)
    },
    async linkAccount({ user, account }) {
      console.log(`[Auth Event] Account linked: ${user.email} with ${account.provider}`)
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
})