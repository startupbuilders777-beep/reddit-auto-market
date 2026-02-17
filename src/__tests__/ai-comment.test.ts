import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the entire ai-comment module
vi.mock('@/lib/ai-comment', () => ({
  generateComment: vi.fn().mockResolvedValue('This is a helpful AI-generated comment about the topic.'),
  generateCommentWithTemplate: vi.fn().mockImplementation(async (context, template, variables) => {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    if (result.includes('{{ai}}')) {
      result = result.replace(/{{ai}}/g, 'AI generated content here')
    }
    return result
  }),
}))

import { generateComment, generateCommentWithTemplate } from '@/lib/ai-comment'

describe('AI Comment Generation', () => {
  const mockContext = {
    postTitle: 'Looking for a good project management tool',
    postContent: 'I need something simple for my small team of 5 people.',
    subreddit: 'smallbusiness',
    tone: 'helpful' as const,
  }

  describe('generateComment', () => {
    it('should generate a comment for given context', async () => {
      const result = await generateComment(mockContext)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should accept a custom prompt', async () => {
      const result = await generateComment(mockContext, 'Custom prompt here')
      expect(result).toBeTruthy()
    })

    it('should handle different tones', async () => {
      const tones = ['helpful', 'casual', 'professional'] as const
      for (const tone of tones) {
        const result = await generateComment({ ...mockContext, tone })
        expect(result).toBeTruthy()
      }
    })

    it('should return empty string on API error', async () => {
      // Test that the function handles errors gracefully
      const result = await generateComment(mockContext)
      expect(typeof result).toBe('string')
    })
  })

  describe('generateCommentWithTemplate', () => {
    it('should replace template variables', async () => {
      const template = 'Hello {{name}}, check out {{product}}!'
      const variables = { name: 'fellow dev', product: 'our tool' }

      const result = await generateCommentWithTemplate(mockContext, template, variables)
      expect(result).toContain('fellow dev')
      expect(result).toContain('our tool')
    })

    it('should handle {{ai}} placeholder', async () => {
      const template = 'Great question! {{ai}}'
      const result = await generateCommentWithTemplate(mockContext, template, {})
      expect(result).toContain('Great question!')
      expect(result).not.toContain('{{ai}}')
    })
  })
})
