'use server'

import { generateComment as generateAIComment } from '@/lib/ai-comment'

const toneInstructions = {
  helpful: 'Be genuinely helpful and supportive. Offer actual value.',
  casual: 'Be friendly and conversational. Use casual language.',
  professional: 'Be professional and concise. Stick to the facts.',
  humorous: 'Be witty and entertaining while still being helpful. Use humor naturally.',
}

export async function generateCommentPreview(data: {
  postTitle: string
  postContent: string
  subreddit: string
  tone: 'helpful' | 'casual' | 'professional' | 'humorous'
  maxLength: number
  blockedKeywords: string[]
}) {
  const blockedKeywordsText = data.blockedKeywords.length > 0 
    ? `\n- AVOID these keywords: ${data.blockedKeywords.join(', ')}`
    : ''

  const systemPrompt = `You are writing a Reddit comment to help market a product/app. 
${toneInstructions[data.tone]}
- Do NOT sound like spam or salesy
- Be authentic and helpful first, mention the product naturally if relevant
- Keep comments under ${data.maxLength} words
- Never be pushy or aggressive
- Focus on providing value${blockedKeywordsText}`

  const userPrompt = `
Post Title: ${data.postTitle}
Post Content: ${data.postContent}
Subreddit: r/${data.subreddit}

Write a helpful comment that could naturally lead to mentioning a relevant tool/product (if appropriate).`

  try {
    const comment = await generateAIComment(
      {
        postTitle: data.postTitle,
        postContent: data.postContent,
        subreddit: data.subreddit,
        tone: data.tone,
        maxLength: data.maxLength,
        blockedKeywords: data.blockedKeywords,
      },
      userPrompt
    )
    return comment
  } catch (error) {
    console.error('Error generating preview:', error)
    throw new Error('Failed to generate comment preview')
  }
}

// For the form component - this is a wrapper
export async function generateComment(data: {
  postTitle: string
  postContent: string
  subreddit: string
  tone: 'helpful' | 'casual' | 'professional' | 'humorous'
  blockedKeywords: string[]
  maxLength: number
}) {
  return generateCommentPreview(data)
}
