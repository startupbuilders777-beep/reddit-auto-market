'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign } from '@/app/actions/campaigns'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const keywords = formData.get('keywords')?.toString().split(',').map(k => k.trim()) || []
      const subreddits = formData.get('subreddits')?.toString().split(',').map(s => s.trim()) || []
      
      await createCampaign({
        name: formData.get('name')?.toString() || '',
        keywords,
        subreddits,
        dailyLimit: parseInt(formData.get('dailyLimit')?.toString() || '10'),
        tone: formData.get('tone')?.toString() || 'helpful',
      })
      
      router.push('/dashboard/campaigns')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Create New Campaign</h1>
      
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
            <label className="block text-sm font-medium mb-2">Tone</label>
            <select
              name="tone"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent"
            >
              <option value="helpful">Helpful</option>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
            </select>
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
    </div>
  )
}
