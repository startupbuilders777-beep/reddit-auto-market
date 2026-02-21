import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CommentContext {
  postTitle: string
  postContent: string
  subreddit: string
  tone: 'helpful' | 'casual' | 'professional' | 'humorous'
  maxLength?: number
  blockedKeywords?: string[]
}

const toneInstructions = {
  helpful: 'Be genuinely helpful and supportive. Offer actual value.',
  casual: 'Be friendly and conversational. Use casual language.',
  professional: 'Be professional and concise. Stick to the facts.',
  humorous: 'Be witty and entertaining while still being helpful. Use humor naturally.',
}

export async function generateComment(context: CommentContext, customPrompt?: string): Promise<string> {
  const maxLength = context.maxLength || 200
  const blockedKeywordsText = context.blockedKeywords && context.blockedKeywords.length > 0
    ? `\n- IMPORTANT: Do NOT use these keywords: ${context.blockedKeywords.join(', ')}`
    : ''

  const systemPrompt = `You are writing a Reddit comment to help market a product/app. 
${toneInstructions[context.tone]}
- Do NOT sound like spam or salesy
- Be authentic and helpful first, mention the product naturally if relevant
- Keep comments under ${maxLength} words
- Never be pushy or aggressive
- Focus on providing value${blockedKeywordsText}`

  const userPrompt = customPrompt || `
Post Title: ${context.postTitle}
Post Content: ${context.postContent}
Subreddit: r/${context.subreddit}

Write a helpful comment that could naturally lead to mentioning a relevant tool/product (if appropriate).`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    let comment = completion.choices[0]?.message?.content || ''
    
    // Post-process: truncate if exceeds maxLength
    if (comment.length > maxLength) {
      comment = comment.substring(0, maxLength - 3) + '...'
    }
    
    // Remove blocked keywords if somehow included
    if (context.blockedKeywords && context.blockedKeywords.length > 0) {
      for (const keyword of context.blockedKeywords) {
        const regex = new RegExp(keyword, 'gi')
        comment = comment.replace(regex, '[blocked]')
      }
    }

    return comment
  } catch (error) {
    console.error('Error generating comment:', error)
    return ''
  }
}

export async function generateCommentWithTemplate(
  context: CommentContext,
  template: string,
  variables: Record<string, string>
): Promise<string> {
  let comment = template

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    comment = comment.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }

  // Enhance with AI if needed
  if (comment.includes('{{ai}}')) {
    const aiGenerated = await generateComment(context)
    comment = comment.replace(/{{ai}}/g, aiGenerated)
  }

  return comment
}
