/**
 * Health check endpoint for monitoring and load balancers.
 * Provides system status and dependency checks.
 */

import { NextResponse } from 'next/server'
import { ENV, validateProductionConfig } from '@/lib/production-config'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    [key: string]: {
      status: 'pass' | 'fail'
      message?: string
      responseTime?: number
    }
  }
}

/**
 * Check OpenAI API connectivity.
 */
async function checkOpenAI(): Promise<{ status: 'pass' | 'fail'; message?: string; responseTime?: number }> {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 'fail', message: 'API key not configured' }
  }

  const start = Date.now()
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - start
    
    if (response.ok) {
      return { status: 'pass', responseTime }
    } else {
      return { 
        status: 'fail', 
        message: `API returned ${response.status}`,
        responseTime 
      }
    }
  } catch (error) {
    return { 
      status: 'fail', 
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start
    }
  }
}

/**
 * Check configuration validity.
 */
function checkConfiguration(): { status: 'pass' | 'fail'; message?: string } {
  const errors = validateProductionConfig()
  
  if (errors.length > 0) {
    return { 
      status: 'fail', 
      message: errors.join('; ')
    }
  }
  
  return { status: 'pass' }
}

/**
 * GET /api/health
 * Returns system health status.
 */
export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {},
  }

  // Basic configuration check
  const configCheck = checkConfiguration()
  health.checks.configuration = configCheck

  // Only check external services in production
  if (ENV.isProduction) {
    // OpenAI API check
    const openaiCheck = await checkOpenAI()
    health.checks.openai = openaiCheck

    // Add more checks as needed (Redis, database, etc.)
  }

  // Determine overall health
  const failedChecks = Object.values(health.checks).filter(
    check => check.status === 'fail'
  ).length

  if (failedChecks > 0) {
    health.status = failedChecks === Object.keys(health.checks).length 
      ? 'unhealthy' 
      : 'degraded'
  }

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  })
}

/**
 * HEAD /api/health
 * Simple health check for load balancers.
 */
export async function HEAD() {
  // Quick check without detailed diagnostics
  const hasApiKey = !!process.env.OPENAI_API_KEY
  
  return new NextResponse(null, {
    status: hasApiKey ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  })
}