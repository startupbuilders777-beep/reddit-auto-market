import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    // Note: In real implementation, you'd expose a clear function
  })

  describe('RATE_LIMITS configuration', () => {
    it('should have rate limits for all tiers', () => {
      expect(RATE_LIMITS.free).toBeDefined()
      expect(RATE_LIMITS.starter).toBeDefined()
      expect(RATE_LIMITS.pro).toBeDefined()
      expect(RATE_LIMITS.enterprise).toBeDefined()
    })

    it('should have increasing limits by tier', () => {
      expect(RATE_LIMITS.starter.maxRequests).toBeGreaterThan(RATE_LIMITS.free.maxRequests)
      expect(RATE_LIMITS.pro.maxRequests).toBeGreaterThan(RATE_LIMITS.starter.maxRequests)
      expect(RATE_LIMITS.enterprise.maxRequests).toBeGreaterThan(RATE_LIMITS.pro.maxRequests)
    })

    it('should use configurable window from env', () => {
      expect(RATE_LIMITS.free.windowMs).toBeGreaterThan(0)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-user-1', 'free')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should track requests per unique identifier', () => {
      // First user
      const user1 = checkRateLimit('user-1', 'free')
      // Second user  
      const user2 = checkRateLimit('user-2', 'free')
      
      // Both should be allowed initially
      expect(user1.allowed).toBe(true)
      expect(user2.allowed).toBe(true)
    })

    it('should block requests exceeding limit', () => {
      // Use a unique identifier for this test
      const testId = `rate-limit-test-${Date.now()}`
      
      // Make requests up to the limit
      const limit = RATE_LIMITS.free.maxRequests
      for (let i = 0; i < limit; i++) {
        checkRateLimit(testId, 'free')
      }
      
      // The next request should be blocked
      const result = checkRateLimit(testId, 'free')
      expect(result.allowed).toBe(false)
    })

    it('should return correct remaining count', () => {
      const testId = `remaining-test-${Date.now()}`
      const result = checkRateLimit(testId, 'free')
      
      // Should have limit - 1 remaining (since we just made 1 request)
      expect(result.remaining).toBe(RATE_LIMITS.free.maxRequests - 1)
    })

    it('should apply different limits per tier', () => {
      const freeId = `tier-free-${Date.now()}`
      const starterId = `tier-starter-${Date.now()}`
      
      // Make max free requests
      for (let i = 0; i < RATE_LIMITS.free.maxRequests; i++) {
        checkRateLimit(freeId, 'free')
      }
      
      // Free should be blocked
      expect(checkRateLimit(freeId, 'free').allowed).toBe(false)
      
      // But starter tier should still be allowed
      const starterResult = checkRateLimit(starterId, 'starter')
      expect(starterResult.allowed).toBe(true)
    })
  })

  describe('getRateLimitHeaders', () => {
    it('should return correct headers', () => {
      const resetTime = Date.now() + 60000
      const headers = getRateLimitHeaders(5, resetTime, 10)
      
      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('5')
      expect(headers['X-RateLimit-Reset']).toBeDefined()
    })

    it('should include reset timestamp', () => {
      const resetTime = Date.now() + 60000
      const headers = getRateLimitHeaders(5, resetTime, 10)
      
      // Reset should be in seconds
      const resetTimestamp = parseInt(headers['X-RateLimit-Reset'])
      expect(resetTimestamp).toBeGreaterThan(Date.now() / 1000)
    })
  })
})
