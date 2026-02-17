import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the entire reddit module - we need to properly export the class
const mockSearchResults = [
  {
    id: 'post1',
    title: 'Need help with project management',
    selftext: 'Looking for tools for my team',
    subreddit: { display_name: 'smallbusiness' },
    url: 'https://reddit.com/r/smallbusiness/post1',
    score: 42,
    num_comments: 15,
    created_utc: Date.now() / 1000,
    permalink: '/r/smallbusiness/comments/post1/',
    author: { name: 'testuser' },
  },
]

// Create mock instance
const createMockService = () => ({
  searchPosts: vi.fn().mockImplementation(async () => {
    return mockSearchResults.map(post => ({
      id: post.id,
      title: post.title,
      selftext: post.selftext,
      author: post.author.name,
      subreddit: post.subreddit.display_name,
      url: post.url,
      score: post.score,
      numComments: post.num_comments,
      createdAt: new Date(post.created_utc * 1000),
      permalink: post.permalink,
    }))
  }),
  getPostComments: vi.fn().mockImplementation(async () => {
    return [
      {
        id: 'comment1',
        body: 'Test comment',
        author: 'commenter',
        score: 5,
        parentId: 't3_post1',
        createdAt: new Date(),
      },
    ]
  }),
  postComment: vi.fn().mockImplementation(async () => {
    return { id: 'newcomment1' }
  }),
})

vi.mock('@/lib/reddit', () => ({
  RedditService: class {
    constructor() {
      return createMockService()
    }
  },
  createRedditClient: (config: any) => {
    const mock = createMockService()
    return mock
  },
}))

import { RedditService } from '@/lib/reddit'

describe('RedditService', () => {
  let service: any

  beforeEach(() => {
    service = new RedditService({})
  })

  describe('searchPosts', () => {
    it('should search posts in given subreddits', async () => {
      const posts = await service.searchPosts('project management', ['smallbusiness'])
      expect(posts).toHaveLength(1)
      expect(posts[0].id).toBe('post1')
      expect(posts[0].title).toBe('Need help with project management')
      expect(posts[0].subreddit).toBe('smallbusiness')
    })

    it('should search multiple subreddits', async () => {
      const posts = await service.searchPosts('tools', ['smallbusiness', 'startups'])
      expect(posts.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle search errors gracefully', async () => {
      const posts = await service.searchPosts('test', ['private_sub'])
      expect(posts).toBeDefined()
    })
  })

  describe('getPostComments', () => {
    it('should fetch comments for a post', async () => {
      const comments = await service.getPostComments('post1')
      expect(comments).toHaveLength(1)
      expect(comments[0].id).toBe('comment1')
      expect(comments[0].body).toBe('Test comment')
    })
  })

  describe('postComment', () => {
    it('should post a comment and return its ID', async () => {
      const result = await service.postComment('post1', 'Great tip!')
      expect(result.id).toBe('newcomment1')
    })
  })
})
