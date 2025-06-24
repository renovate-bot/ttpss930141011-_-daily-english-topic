import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

import { i18n } from './i18n-config'
import { CORS_CONFIG, SECURITY_HEADERS } from '@/lib/security-config'

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

/**
 * Check if origin is allowed for CORS.
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true
  }
  
  return CORS_CONFIG.ALLOWED_ORIGINS.includes(origin)
}

// Routes that should not have i18n prefix
const NON_I18N_ROUTES = [
  '/auth',
  '/sentry-example-page',
  '/api/sentry-example-api',
  '/test-word-lookup',
  '/about',
  '/privacy',
  '/terms',
  '/monitoring', // Sentry tunnel route
]

function shouldSkipI18n(pathname: string): boolean {
  return NON_I18N_ROUTES.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Handle API routes security
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const response = NextResponse.next()

    // Apply security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Handle CORS
    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.ALLOWED_METHODS.join(', '))
      response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.ALLOWED_HEADERS.join(', '))
      response.headers.set('Access-Control-Max-Age', CORS_CONFIG.MAX_AGE.toString())
      return new NextResponse(null, { status: 200, headers: response.headers })
    }

    // Add request ID for tracking
    response.headers.set('X-Request-ID', crypto.randomUUID())

    return response
  }

  // Skip i18n for certain routes
  if (shouldSkipI18n(pathname)) {
    return NextResponse.next()
  }

  // Handle i18n routing for non-API routes
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }
}

export const config = {
  // Updated matcher to include API routes for security
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/realtime-session',
  ],
}