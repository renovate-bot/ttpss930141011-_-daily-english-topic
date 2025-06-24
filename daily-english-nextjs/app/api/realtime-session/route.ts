/**
 * Production-grade API endpoint for ephemeral token generation.
 * Implements security best practices for OpenAI Realtime API.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { REALTIME_MODEL, TEACHER_VOICE } from '@/lib/realtime-config'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // max requests per window

// In-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for IP address.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  limit.count++
  return true
}

/**
 * Clean up expired rate limit entries.
 */
function cleanupRateLimits() {
  const now = Date.now()
  for (const [ip, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

/**
 * GET /api/realtime-session
 * Returns ephemeral token for WebRTC connection with production security.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // 1. Get client IP for rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // 2. Check rate limit
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Window': (RATE_LIMIT_WINDOW / 1000).toString()
          }
        }
      )
    }

    // 3. Clean up old rate limit entries periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup
      cleanupRateLimits()
    }

    // 4. Verify API key configuration
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[Realtime Session] API key not configured')
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // 5. Additional security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }

    // 6. Create ephemeral session with OpenAI
    const sessionResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: TEACHER_VOICE,
        // Add additional session constraints in production
        // max_response_output_tokens: 4096,
        // temperature: 0.8
      })
    })

    // 7. Handle OpenAI API errors
    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text()
      console.error('[Realtime Session] OpenAI API error:', errorText)
      
      // Don't expose internal errors to client
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 503, headers: securityHeaders }
      )
    }

    // 8. Parse response and add metadata
    const sessionData = await sessionResponse.json()
    
    // 9. Log session creation for monitoring (use proper logging service in production)
    console.log('[Realtime Session] Created session', {
      clientIp,
      timestamp: new Date().toISOString(),
      sessionId: sessionData.id || 'unknown'
    })

    // 10. Return ephemeral token with security headers
    return NextResponse.json(sessionData, {
      status: 200,
      headers: {
        ...securityHeaders,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    // 11. Handle unexpected errors
    console.error('[Realtime Session] Unexpected error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}

/**
 * POST /api/realtime-session
 * Optionally support POST for future authentication flows.
 */
export async function POST(request: NextRequest) {
  // In production, implement authentication here
  // const body = await request.json()
  // const { userId, sessionToken } = body
  // await validateUserSession(userId, sessionToken)
  
  return GET(request)
}