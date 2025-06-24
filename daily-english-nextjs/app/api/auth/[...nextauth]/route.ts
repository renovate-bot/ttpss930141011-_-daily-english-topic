/**
 * NextAuth route handler for authentication endpoints.
 * Handles all auth-related routes under /api/auth/*.
 */

import { handlers } from '@/auth'

export const { GET, POST } = handlers