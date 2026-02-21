'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import CampaignCalendar, { CalendarLegend } from '@/components/CampaignCalendar'
import { CalendarIcon, Plus, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ScheduledPost {
  id: string
  title: string
  start: Date
  end: Date
  campaignId: string
  campaignName: string
  color: string
  status: string
  content?: string
}

interface Campaign {
  id: string
  name: string
  color: string
  _count: {
    scheduledPosts: number
  }
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [postsRes, campaignsRes] = await Promise.all([
        fetch('/api/scheduled-posts'),
        fetch('/api/campaigns')
      ])
      
      const postsData = await postsRes.json()
      const campaignsData = await campaignsRes.json()

      // Transform posts for calendar
      const transformedPosts: ScheduledPost[] = postsData.posts?.map((post: any) => ({
        id: post.id,
        title: post.content?.substring(0, 30) + '...',
        start: new Date(post.scheduledAt),
        end: new Date(new Date(post.scheduledAt).getTime() + 30 * 60 * 1000), // 30 min default
        campaignId: post.campaignId,
        campaignName: post.campaign?.name || 'Unknown',
        color: post.campaign?.color || '#FF4500',
        status: post.status,
        content: post.content
      })) || []

      setPosts(transformedPosts)
      setCampaigns(campaignsData.campaigns || [])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin')
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  const handleEventDrop = async (postId: string, newStart: Date) => {
    try {
      await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: newStart.toISOString() })
      })
      fetchData()
    } catch (error) {
      console.error('Error rescheduling post:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-reddit" />
      </div>
    )
  }

  const campaignLegend = campaigns.map(c => ({
    name: c.name,
    color: c.color,
    count: c._count?.scheduledPosts || 0
  }))

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-reddit" />
          <h1 className="text-2xl font-bold">Campaign Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/campaigns/new"
            className="flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Schedule Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full">
          <CampaignCalendar
            posts={posts}
            onEventDrop={handleEventDrop}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <CalendarLegend campaigns={campaignLegend} />
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Scheduled</span>
                <span className="font-medium">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-yellow-600">
                  {posts.filter(p => p.status === 'PENDING').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Posted</span>
                <span className="font-medium text-green-600">
                  {posts.filter(p => p.status === 'POSTED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className="font-medium text-red-600">
                  {posts.filter(p => p.status === 'FAILED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
