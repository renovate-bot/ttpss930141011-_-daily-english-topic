/**
 * NextAuth type extensions.
 * Extends default types to include custom user properties.
 */

import { DefaultSession, DefaultUser } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  /**
   * Extended session interface with custom properties.
   */
  interface Session {
    user: {
      id: string
      provider?: string
    } & DefaultSession['user']
  }

  /**
   * Extended user interface with custom properties.
   */
  interface User extends DefaultUser {
    provider?: string
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface with custom properties.
   */
  interface JWT {
    id?: string
    provider?: string
  }
}