/**
 * Prisma client singleton instance.
 * Implements best practices for Next.js to prevent multiple instances in development.
 * 
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client'

/**
 * Global type declaration for Prisma client singleton.
 */
declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Create Prisma client with production-ready configuration.
 */
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
}

/**
 * Singleton Prisma client instance.
 * In development, this prevents creating multiple instances during hot reloading.
 * In production, a single instance is created and reused.
 */
export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

/**
 * Gracefully shutdown Prisma client.
 * Call this when shutting down the application.
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}