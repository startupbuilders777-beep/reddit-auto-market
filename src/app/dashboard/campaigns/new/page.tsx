'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign } from '@/app/actions/campaigns'
import { generateComment } from '@/app/actions/ai-preview'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const [samplePost, setSamplePost] = useState({
    title: '',
    content: '',
    subreddit: ''
  })

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const keywords = formData.get('keywords')?.toString().split(',').map(k => k.trim()) || []
      const subreddits = formData.get('subreddits')?.toString().split(',').map(s => s.trim()) || []
      const blockedKeywords = formData.get('blockedKeywords')?.toString().split(',').map(k => k.trim()).filter(k => k) || []
      
      await createCampaign({
        name: formData.get('name')?.toString() || '',
        keywords,
        subreddits,
        dailyLimit: parseInt(formData.get('dailyLimit')?.toString() || '10'),
        maxLength: parseInt(formData.get('maxLength')?.toString() || '200'),
        blockedKeywords,
        tone: formData.get('tone')?.toString() || 'helpful',
      })
      
      router.push('/dashboard/campaigns')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePreview() {
    if (!samplePost.title || !samplePost.subreddit) {
      alert('Please enter a sample post title and subreddit')
      return
    }
    setPreviewLoading(true)
    try {
      const tone = (document.querySelector('select[name="tone"]') as HTMLSelectElement)?.value || 'helpful'
      const blockedKeywords = (document.querySelector('input[name="blockedKeywords"]') as HTMLInputElement)?.value || ''
      const result = await generateComment({
        postTitle: samplePost.title,
        postContent: samplePost.content,
        subreddit: samplePost.subreddit,
        tone: tone as 'helpful' | 'casual' | 'professional' | 'humorous',
        blockedKeywords: blockedKeywords.split(',').map(k => k.trim()).filter(k => k),
        maxLength: parseInt((document.querySelector('input[name="maxLength"]') as HTMLInputElement)?.value || '200')
      })
      setPreview(result)
    } catch (error) {
      console.error(error)
      alert('Failed to generate preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Create New Campaign</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form action={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              placeholder="My Reddit Marketing Campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              name="keywords"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              placeholder="saas, startup, indie hacker"
            />
            <p className="text-sm text-gray-500 mt-1">
              Posts containing these keywords will be targeted
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subreddits (comma separated)
            </label>
            <input
              type="text"
              name="subreddits"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              placeholder="SaaS, startups, indiehackers"
            />
            <p className="text-sm text-gray-500 mt-1">
              Add subreddit names without r/
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Daily Comment Limit</label>
              <input
                type="number"
                name="dailyLimit"
                defaultValue={10}
                min={1}
                max={100}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment Tone</label>
              <select
                name="tone"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              >
                <option value="helpful">Helpful</option>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Max Comment Length</label>
              <input
                type="number"
                name="maxLength"
                defaultValue={200}
                min={50}
                max={500}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum characters per comment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Blocked Keywords
              </label>
              <input
                type="text"
                name="blockedKeywords"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
                placeholder="scam, fake, spam"
              />
              <p className="text-sm text-gray-500 mt-1">
                AI will avoid these words
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-reddit hover:bg-redditDark text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">AI Comment Preview</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test how your AI comments will look before creating the campaign.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sample Post Title</label>
              <input
                type="text"
                value={samplePost.title}
                onChange={(e) => setSamplePost({ ...samplePost, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
                placeholder="Looking for SaaS pricing advice"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sample Post Content (optional)</label>
              <textarea
                value={samplePost.content}
                onChange={(e) => setSamplePost({ ...samplePost, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
                placeholder="I'm building a new product and unsure how to price it..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subreddit</label>
              <input
                type="text"
                value={samplePost.subreddit}
                onChange={(e) => setSamplePost({ ...samplePost, subreddit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
                placeholder="SaaS"
              />
            </div>

            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {previewLoading ? 'Generating...' : 'Preview Comment'}
            </button>

            {preview && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <p className="text-sm font-medium text-gray-500 mb-2">Generated Comment:</p>
                <p className="text-sm">{preview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
