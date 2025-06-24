/**
 * Authentication service layer.
 * Implements business logic for authentication following SOLID principles.
 */

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/**
 * Authentication service interface.
 * Defines the contract for authentication operations.
 */
export interface IAuthService {
  getCurrentUser(): Promise<User | null>
  getUserById(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  checkUserQuota(userId: string, requiredMinutes: number): Promise<boolean>
  updateUserQuota(userId: string, usedMinutes: number): Promise<void>
}

/**
 * Production-ready authentication service implementation.
 */
export class AuthService implements IAuthService {
  /**
   * Get the currently authenticated user.
   * 
   * @returns The authenticated user or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await auth()
    
    if (!session?.user?.email) {
      return null
    }
    
    return this.getUserByEmail(session.user.email)
  }
  
  /**
   * Get a user by their ID.
   * 
   * @param id - The user's unique identifier
   * @returns The user or null if not found
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      })
    } catch (error) {
      console.error('[AuthService] Error fetching user by ID:', error)
      return null
    }
  }
  
  /**
   * Get a user by their email address.
   * 
   * @param email - The user's email address
   * @returns The user or null if not found
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      })
    } catch (error) {
      console.error('[AuthService] Error fetching user by email:', error)
      return null
    }
  }
  
  /**
   * Check if a user has sufficient quota for a realtime session.
   * 
   * @param userId - The user's ID
   * @param requiredMinutes - Minutes required for the session
   * @returns True if user has sufficient quota
   */
  async checkUserQuota(userId: string, requiredMinutes: number): Promise<boolean> {
    // TODO: Implement quota checking logic
    // For now, return true to allow all users
    // Future implementation will use userId and requiredMinutes
    void userId
    void requiredMinutes
    return true
  }
  
  /**
   * Update user's quota usage.
   * 
   * @param userId - The user's ID
   * @param usedMinutes - Minutes consumed
   */
  async updateUserQuota(userId: string, usedMinutes: number): Promise<void> {
    // TODO: Implement quota update logic
    console.log(`[AuthService] User ${userId} used ${usedMinutes} minutes`)
  }
}

/**
 * Singleton instance of the authentication service.
 */
export const authService = new AuthService()