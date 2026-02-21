'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface RedditAccount {
  id: string
  username: string
  karma: number
  isActive: boolean
  createdAt: string
}

interface PricingTier {
  id: string
  name: string
  priceMonthly: number
  commentsPerMonth: number
}

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: string | null
  pricingTier: PricingTier
}

interface UsageStats {
  commentsThisMonth: number
  campaignCount: number
}

interface UserStats {
  redditAccounts: RedditAccount[]
  subscription: Subscription | null
  usage: UsageStats
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/user/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  async function disconnectAccount(accountId: string) {
    if (!confirm('Are you sure you want to disconnect this Reddit account?')) {
      return
    }

    setDisconnecting(accountId)
    setError('')

    try {
      const res = await fetch(`/api/user/accounts?id=${accountId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchStats()
      } else {
        setError('Failed to disconnect account')
      }
    } catch (err) {
      setError('Failed to disconnect account')
    } finally {
      setDisconnecting(null)
    }
  }

  const usagePercent = stats?.subscription 
    ? Math.round((stats.usage.commentsThisMonth / stats.subscription.pricingTier.commentsPerMonth) * 100)
    : 0

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Connected Accounts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Connected Reddit Accounts</h2>
              <a
                href="/api/auth/signin"
                className="text-sm text-reddit hover:underline"
              >
                + Add Account
              </a>
            </div>
            
            {stats?.redditAccounts && stats.redditAccounts.length > 0 ? (
              <div className="space-y-3">
                {stats.redditAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {account.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{account.username}</div>
                        <div className="text-sm text-gray-500">
                          {account.karma.toLocaleString()} karma • Connected {new Date(account.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => disconnectAccount(account.id)}
                        disabled={disconnecting === account.id}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {disconnecting === account.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No Reddit accounts connected</p>
                <a href="/api/auth/signin" className="text-reddit hover:underline mt-2 inline-block">
                  Connect your Reddit account
                </a>
              </div>
            )}
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-gray-500">
                  Switch between light and dark themes
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Usage & Subscription */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Subscription & Usage</h2>
            
            {stats?.subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">{stats.subscription.pricingTier.name} Plan</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${stats.subscription.pricingTier.priceMonthly}/month
                      {stats.subscription.status === 'ACTIVE' && stats.subscription.currentPeriodEnd && (
                        <> • Renews {new Date(stats.subscription.currentPeriodEnd).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${stats.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {stats.subscription.status}
                  </span>
                </div>

                {/* Usage Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>This Month&apos;s Usage</span>
                    <span>{stats.usage.commentsThisMonth} / {stats.subscription.pricingTier.commentsPerMonth} comments</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-reddit'}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    ></div>
                  </div>
                  {usagePercent > 80 && (
                    <p className="text-sm text-orange-600 mt-2">
                      You are approaching your monthly limit. Consider upgrading your plan.
                    </p>
                  )}
                </div>

                <a
                  href="/checkout"
                  className="block text-center bg-reddit hover:bg-redditDark text-white py-2 px-4 rounded-lg font-medium mt-4"
                >
                  Upgrade Plan
                </a>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No active subscription</p>
                <a
                  href="/checkout"
                  className="inline-block bg-reddit hover:bg-redditDark text-white py-2 px-4 rounded-lg font-medium"
                >
                  View Plans
                </a>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={session?.user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={session?.user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
