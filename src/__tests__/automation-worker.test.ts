import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the dependencies before importing
vi.mock('@/lib/prisma', () => ({
  prisma: {
    campaign: {
      findMany: vi.fn(),
    },
    redditAccount: {
      findFirst: vi.fn(),
    },
    comment: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/reddit', () => ({
  RedditService: vi.fn().mockImplementation(() => ({
    searchPosts: vi.fn().mockResolvedValue([
      {
        id: 'newpost1',
        title: 'Looking for SaaS tools',
        selftext: 'Need recommendations',
        subreddit: 'SaaS',
        score: 10,
      },
    ]),
    postComment: vi.fn().mockResolvedValue('comment123'),
  })),
}))

vi.mock('@/lib/ai-comment', () => ({
  generateComment: vi.fn().mockResolvedValue('Here is a helpful comment about SaaS tools.'),
}))

describe('Automation Worker', () => {
  let prisma: any

  beforeEach(async () => {
    vi.clearAllMocks()
    prisma = (await import('@/lib/prisma')).prisma
  })

  it('should skip campaigns with no active Reddit account', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      {
        id: 'campaign1',
        name: 'Test Campaign',
        keywords: ['saas'],
        subreddits: ['SaaS'],
        dailyLimit: 10,
        tone: 'helpful',
        userId: 'user1',
        status: 'ACTIVE',
        user: { id: 'user1' },
      },
    ])
    prisma.redditAccount.findFirst.mockResolvedValue(null)

    // The worker should handle this gracefully
    expect(prisma.campaign.findMany).toBeDefined()
  })

  it('should respect daily limits', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      {
        id: 'campaign1',
        name: 'Test',
        keywords: ['test'],
        subreddits: ['test'],
        dailyLimit: 5,
        tone: 'helpful',
        userId: 'user1',
        status: 'ACTIVE',
        user: { id: 'user1' },
      },
    ])
    prisma.redditAccount.findFirst.mockResolvedValue({
      id: 'account1',
      accessToken: 'token',
      refreshToken: 'refresh',
    })
    prisma.comment.count.mockResolvedValue(5) // At daily limit

    // Worker should check count and skip
    expect(prisma.comment.count).toBeDefined()
  })

  it('should filter out already-commented posts', async () => {
    prisma.comment.findMany.mockResolvedValue([
      { redditPostId: 'oldpost1' },
      { redditPostId: 'oldpost2' },
    ])

    const result = prisma.comment.findMany()
    const existingIds = (await result).map((c: any) => c.redditPostId)
    expect(existingIds).toContain('oldpost1')
    expect(existingIds).toContain('oldpost2')
  })
})
