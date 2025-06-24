/**
 * Authentication guards for route protection.
 * Implements reusable authentication checks following DRY principle.
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/lib/security-config'

/**
 * Guard options interface.
 */
export interface AuthGuardOptions {
  requireAuth?: boolean
  allowedRoles?: string[]
  checkQuota?: boolean
  quotaMinutes?: number
}

/**
 * Authentication guard result.
 */
export type AuthGuardResult = 
  | { success: true; session: unknown }
  | { success: false; response: NextResponse }

/**
 * Guard to check if user is authenticated.
 * 
 * @param options - Guard configuration options
 * @returns Guard result with session or error response
 */
export async function authGuard(
  options: AuthGuardOptions = { requireAuth: true }
): Promise<AuthGuardResult> {
  const session = await auth()
  
  // Check if authentication is required
  if (options.requireAuth && !session?.user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      ),
    }
  }
  
  // Check role-based access if specified
  if (options.allowedRoles?.length && session?.user) {
    // TODO: Implement role checking once roles are added to the user model
    // For now, allow all authenticated users
  }
  
  // Check quota if specified
  if (options.checkQuota && session?.user && options.quotaMinutes) {
    // TODO: Implement quota checking
    // For now, allow all authenticated users
  }
  
  return {
    success: true,
    session,
  }
}

/**
 * Higher-order function to protect API routes.
 * 
 * @param handler - The route handler to protect
 * @param options - Guard configuration options
 * @returns Protected route handler
 */
export function withAuth<T extends (...args: unknown[]) => unknown>(
  handler: T,
  options: AuthGuardOptions = { requireAuth: true }
): T {
  return (async (...args: Parameters<T>) => {
    const guardResult = await authGuard(options)
    
    if (!guardResult.success) {
      return guardResult.response
    }
    
    // Inject session into handler context if needed
    // This allows handlers to access the session without re-fetching
    const [request] = args
    if (request && typeof request === 'object') {
      (request as Record<string, unknown>).session = guardResult.session
    }
    
    return handler(...args)
  }) as T
}