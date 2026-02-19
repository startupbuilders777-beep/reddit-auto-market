// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limit configuration by plan tier
 */
export const RATE_LIMITS = {
  free: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_FREE_MAX || '10'),
  },
  starter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_STARTER_MAX || '60'),
  },
  pro: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_PRO_MAX || '300'),
  },
  enterprise: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_ENTERPRISE_MAX || '1000'),
  },
}

export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise'

/**
 * Check if request is within rate limit
 * Note: For middleware use only (Edge runtime compatible)
 */
export function checkRateLimit(
  identifier: string,
  tier: PlanTier = 'free'
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[tier]
  const now = Date.now()
  const key = `${identifier}:${tier}`

  let record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new window
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, record)
  }

  record.count++
  const remaining = Math.max(0, config.maxRequests - record.count)

  return {
    allowed: record.count <= config.maxRequests,
    remaining,
    resetTime: record.resetTime,
  }
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
  }
}
