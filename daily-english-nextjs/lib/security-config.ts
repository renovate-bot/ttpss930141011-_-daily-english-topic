/**
 * Security configuration for production deployment.
 * Centralizes security settings and best practices.
 */

/**
 * Rate limiting configuration.
 */
export const RATE_LIMIT_CONFIG = {
  // Number of requests allowed per window
  MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) 
    : 10,
  
  // Time window in milliseconds
  WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS 
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) 
    : 60 * 1000, // 1 minute
  
  // Skip rate limiting for specific IPs (e.g., monitoring services)
  WHITELIST_IPS: process.env.RATE_LIMIT_WHITELIST_IPS?.split(',') || []
} as const

/**
 * CORS configuration for API endpoints.
 */
export const CORS_CONFIG = {
  // Allowed origins for API requests
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://eng.zeabur.app'
  ],
  
  // Allowed methods
  ALLOWED_METHODS: ['GET', 'POST', 'OPTIONS'],
  
  // Allowed headers
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  
  // Max age for preflight cache
  MAX_AGE: 86400 // 24 hours
} as const

/**
 * Security headers for all API responses.
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'microphone=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.openai.com"
} as const

/**
 * Session configuration for ephemeral tokens.
 */
export const SESSION_CONFIG = {
  // Token expiration time (OpenAI default is 1 minute)
  TOKEN_EXPIRY_MS: 60 * 1000,
  
  // Maximum concurrent sessions per IP
  MAX_CONCURRENT_SESSIONS: 3,
  
  // Session cleanup interval
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000 // 5 minutes
} as const

/**
 * Logging configuration.
 */
export const LOGGING_CONFIG = {
  // Log level
  LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Sensitive fields to redact
  REDACT_FIELDS: ['authorization', 'token', 'apikey', 'password'],
  
  // Enable request logging
  LOG_REQUESTS: process.env.LOG_REQUESTS === 'true',
  
  // Enable error stack traces in production
  LOG_STACK_TRACES: process.env.NODE_ENV !== 'production'
} as const

/**
 * Input validation rules.
 */
export const VALIDATION_RULES = {
  // Maximum request body size
  MAX_BODY_SIZE: '1mb',
  
  // Allowed content types
  ALLOWED_CONTENT_TYPES: ['application/json'],
  
  // IP address validation regex
  IP_REGEX: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
} as const

/**
 * Error messages for client responses.
 */
export const ERROR_MESSAGES = {
  RATE_LIMIT: 'Too many requests. Please try again later.',
  UNAUTHORIZED: 'Unauthorized access.',
  INVALID_REQUEST: 'Invalid request format.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable.',
  INTERNAL_ERROR: 'An error occurred. Please try again.',
  SESSION_EXPIRED: 'Session expired. Please refresh and try again.'
} as const