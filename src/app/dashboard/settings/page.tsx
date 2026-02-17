'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { updateSettings } from '@/app/actions/settings'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData(e.currentTarget)
    await updateSettings({
      dailyCommentLimit: parseInt(formData.get('dailyCommentLimit')?.toString() || '50'),
      notificationEmail: formData.get('notificationEmail') === 'on',
      notifyOnFailures: formData.get('notifyOnFailures') === 'on',
      defaultTone: formData.get('defaultTone')?.toString() || 'helpful',
    })
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">Email is managed by your account</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Automation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Daily Comment Limit</label>
              <input
                type="number"
                name="dailyCommentLimit"
                defaultValue={50}
                min={1}
                max={500}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum comments per day across all campaigns
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Tone</label>
              <select
                name="defaultTone"
                defaultValue="helpful"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-reddit"
              >
                <option value="helpful">Helpful</option>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notificationEmail"
                defaultChecked
                className="w-5 h-5 rounded text-reddit focus:ring-reddit"
              />
              <div>
                <span className="font-medium">Email Notifications</span>
                <p className="text-sm text-gray-500">Receive weekly digest of campaign performance</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notifyOnFailures"
                defaultChecked
                className="w-5 h-5 rounded text-reddit focus:ring-reddit"
              />
              <div>
                <span className="font-medium">Failure Alerts</span>
                <p className="text-sm text-gray-500">Get notified when comments fail to post</p>
              </div>
            </label>
          </div>
        </div>

        {/* API Keys (Read Only) */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reddit Client ID</label>
              <input
                type="password"
                placeholder="Configured in environment"
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <input
                type="password"
                placeholder="Configured in environment"
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <p className="text-sm text-gray-500">
              API keys are configured via environment variables. Contact support to change.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-reddit hover:bg-redditDark text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
