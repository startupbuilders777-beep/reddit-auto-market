import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CommentContext {
  postTitle: string
  postContent: string
  subreddit: string
  tone: 'helpful' | 'casual' | 'professional'
}

const toneInstructions = {
  helpful: 'Be genuinely helpful and supportive. Offer actual value.',
  casual: 'Be friendly and conversational. Use casual language.',
  professional: 'Be professional and concise. Stick to the facts.',
}

export async function generateComment(context: CommentContext, customPrompt?: string): Promise<string> {
  const systemPrompt = `You are writing a Reddit comment to help market a product/app. 
${toneInstructions[context.tone]}
- Do NOT sound like spam or salesy
- Be authentic and helpful first, mention the product naturally if relevant
- Keep comments under 200 words
- Never be pushy or aggressive
- Focus on providing value`

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
      max_tokens: 300,
    })

    return completion.choices[0]?.message?.content || ''
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
