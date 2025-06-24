/**
 * Unified production configuration.
 * Single source of truth for all production settings.
 */

/**
 * Environment detection.
 */
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

/**
 * Feature flags for gradual rollout.
 */
export const FEATURES = {
  // Authentication
  REQUIRE_AUTH: ENV.isProduction,
  ENABLE_OAUTH: false, // Future: Google/GitHub OAuth
  
  // Rate limiting
  USE_REDIS_RATE_LIMIT: false, // Enable when Redis is configured
  
  // Monitoring
  ENABLE_TELEMETRY: ENV.isProduction,
  ENABLE_ERROR_TRACKING: ENV.isProduction,
  
  // Cost control
  ENABLE_USAGE_TRACKING: ENV.isProduction,
  ENABLE_QUOTAS: ENV.isProduction,
} as const

/**
 * Service endpoints.
 */
export const ENDPOINTS = {
  OPENAI_REALTIME: 'https://api.openai.com/v1/realtime',
  OPENAI_SESSIONS: 'https://api.openai.com/v1/realtime/sessions',
} as const

/**
 * Resource limits.
 */
export const LIMITS = {
  // Connection limits
  MAX_CONCURRENT_CONNECTIONS: 100,
  MAX_CONNECTIONS_PER_USER: 3,
  CONNECTION_TIMEOUT_MS: 30000,
  
  // Session limits
  MAX_SESSION_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  MAX_IDLE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  
  // Audio limits
  MAX_AUDIO_CHUNK_SIZE: 15 * 1024 * 1024, // 15MB
  AUDIO_SAMPLE_RATE: 24000,
  
  // Message limits
  MAX_MESSAGE_SIZE: 1024 * 1024, // 1MB
  MAX_MESSAGES_PER_MINUTE: 60,
} as const

/**
 * Cost control settings.
 */
export const COST_CONTROL = {
  // Pricing (example values, update based on actual OpenAI pricing)
  PRICE_PER_MINUTE: 0.06, // $0.06 per minute
  
  // Default quotas
  DEFAULT_DAILY_MINUTES: 60,
  DEFAULT_MONTHLY_MINUTES: 1000,
  
  // Alerts
  USAGE_ALERT_THRESHOLD: 0.8, // Alert at 80% usage
  COST_ALERT_DAILY: 10, // Alert if daily cost exceeds $10
} as const

/**
 * Monitoring configuration.
 */
export const MONITORING = {
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || (ENV.isProduction ? 'info' : 'debug'),
  LOG_FORMAT: ENV.isProduction ? 'json' : 'pretty',
  
  // Metrics
  METRICS_INTERVAL_MS: 60000, // 1 minute
  
  // Health check
  HEALTH_CHECK_INTERVAL_MS: 30000, // 30 seconds
  HEALTH_CHECK_TIMEOUT_MS: 5000, // 5 seconds
} as const

/**
 * Error handling configuration.
 */
export const ERROR_HANDLING = {
  // Retry configuration
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Circuit breaker
  CIRCUIT_BREAKER_THRESHOLD: 5, // Open after 5 failures
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000, // Try again after 1 minute
  
  // Error reporting
  REPORT_TO_SENTRY: ENV.isProduction,
  SENTRY_DSN: process.env.SENTRY_DSN,
} as const

/**
 * Get configuration value with fallback.
 */
export function getConfig<T>(
  key: string,
  defaultValue: T,
  parser?: (value: string) => T
): T {
  const value = process.env[key]
  if (!value) return defaultValue
  
  try {
    return parser ? parser(value) : (value as unknown as T)
  } catch {
    console.warn(`Failed to parse config ${key}, using default`)
    return defaultValue
  }
}

/**
 * Validate production configuration.
 */
export function validateProductionConfig(): string[] {
  const errors: string[] = []
  
  if (ENV.isProduction) {
    // Required environment variables
    if (!process.env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required in production')
    }
    
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production')
    }
    
    if (!process.env.ALLOWED_ORIGINS) {
      errors.push('ALLOWED_ORIGINS must be configured in production')
    }
    
    // Recommended configurations
    if (!process.env.SENTRY_DSN && ERROR_HANDLING.REPORT_TO_SENTRY) {
      console.warn('SENTRY_DSN not configured, error tracking disabled')
    }
    
    if (!process.env.REDIS_URL && FEATURES.USE_REDIS_RATE_LIMIT) {
      errors.push('REDIS_URL required when USE_REDIS_RATE_LIMIT is enabled')
    }
  }
  
  return errors
}