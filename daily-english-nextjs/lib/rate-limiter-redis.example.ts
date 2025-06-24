/**
 * Redis-based rate limiter example for future scaling.
 * This is not currently used but provided as a reference.
 */

import { Redis } from 'ioredis'

// Initialize Redis client (would come from env in production)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

/**
 * Check rate limit using Redis.
 */
export async function checkRateLimitRedis(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  
  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()
    const currentKey = `${key}:${window}`
    
    pipeline.incr(currentKey)
    pipeline.expire(currentKey, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    const count = results?.[0]?.[1] as number || 0
    
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: (window + 1) * windowMs
    }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // Fail open - allow request if Redis is down
    return { allowed: true, remaining: limit, resetAt: now + windowMs }
  }
}

/**
 * Advanced sliding window rate limiter.
 */
export async function slidingWindowRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<boolean> {
  const key = `sliding:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs
  
  try {
    // Remove old entries
    await redis.zremrangebyscore(key, '-inf', windowStart)
    
    // Count requests in current window
    const count = await redis.zcard(key)
    
    if (count < limit) {
      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`)
      await redis.expire(key, Math.ceil(windowMs / 1000))
      return true
    }
    
    return false
  } catch (error) {
    console.error('Sliding window rate limit error:', error)
    return true // Fail open
  }
}

/**
 * User-specific quotas with Redis.
 */
export async function checkUserQuota(
  userId: string,
  quotaType: 'daily' | 'monthly',
  limit: number
): Promise<{ allowed: boolean; used: number; resetAt: Date }> {
  const now = new Date()
  const period = quotaType === 'daily' 
    ? now.toISOString().split('T')[0]
    : now.toISOString().slice(0, 7)
  
  const key = `quota:${userId}:${quotaType}:${period}`
  
  try {
    const used = await redis.incr(key)
    
    // Set expiry on first use
    if (used === 1) {
      const ttl = quotaType === 'daily' 
        ? 86400 // 24 hours
        : 2592000 // 30 days
      await redis.expire(key, ttl)
    }
    
    const resetAt = quotaType === 'daily'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      : new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return {
      allowed: used <= limit,
      used,
      resetAt
    }
  } catch (error) {
    console.error('User quota error:', error)
    return { allowed: true, used: 0, resetAt: now }
  }
}

/**
 * Clean up helper for Redis connection.
 */
export async function closeRedis() {
  await redis.quit()
}