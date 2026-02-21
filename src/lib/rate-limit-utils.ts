import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Extract identifier for rate limiting from request
 * Priority: user ID (authenticated) > IP address (unauthenticated)
 */
export async function getRateLimitIdentifier(request: NextRequest): Promise<string> {
  // Try to get user ID from JWT token
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (token?.sub) {
      return `user:${token.sub}`
    }
  } catch {
    // Continue to IP-based
  }

  // Fall back to IP address from forwarded header
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}
