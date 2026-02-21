import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRateLimitIdentifier } from '@/lib/rate-limit-utils'
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS, PlanTier } from '@/lib/rate-limit'

// Paths to apply rate limiting (API routes only)
const API_PATHS = ['/api/']

/**
 * Determine tier from request (Edge runtime compatible)
 * In production, you might want to check a cookie or header set after auth
 */
function getTierFromRequest(request: NextRequest): PlanTier {
  // Check for tier header (set by API routes after session verification)
  const tierHeader = request.headers.get('x-user-tier')
  if (tierHeader && ['free', 'starter', 'pro', 'enterprise'].includes(tierHeader)) {
    return tierHeader as PlanTier
  }
  
  // Default to free tier
  return 'free'
}

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  const isApiRoute = API_PATHS.some(path => request.nextUrl.pathname.startsWith(path))
  if (!isApiRoute) {
    return NextResponse.next()
  }

  // Skip rate limiting for health checks
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next()
  }

  try {
    const identifier = await getRateLimitIdentifier(request)
    const tier = getTierFromRequest(request)
    const { allowed, remaining, resetTime } = checkRateLimit(identifier, tier)
    
    const headers = getRateLimitHeaders(
      remaining,
      resetTime,
      RATE_LIMITS[tier].maxRequests
    )

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch {
    // If rate limiting fails, allow the request through
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/api/:path*',
}
