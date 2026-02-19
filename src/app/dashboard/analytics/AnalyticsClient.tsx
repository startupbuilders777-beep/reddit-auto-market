'use client'

import { useState } from 'react'
import { TrendingUp, MessageSquare, ThumbsUp, Reply, Calendar, Target } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Comment {
  id: string
  content: string
  redditPostId: string
  status: string
  upvotes: number
  replies: number
  engagement: number
  createdAt: string
  postedAt: string | null
  campaign: { name: string }
  redditAccount: { username: string }
}

interface AnalyticsData {
  totalComments: number
  postedComments: number
  failedComments: number
  pendingComments: number
  totalUpvotes: number
  totalReplies: number
  totalEngagement: number
  leadsGenerated: number
  commentsByDay: { date: string; count: number; upvotes: number; replies: number }[]
  commentsByCampaign: { name: string; count: number }[]
  commentsByStatus: { name: string; value: number }[]
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B']

export default function AnalyticsClient({ 
  initialData,
  recentComments 
}: { 
  initialData: AnalyticsData
  recentComments: Comment[]
}) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d')

  const data = initialData

  const getDateRange = () => {
    switch (timeRange) {
      case '7d':
        return 7
      case '30d':
        return 30
      default:
        return Infinity
    }
  }

  const filteredComments = recentComments.filter(comment => {
    if (timeRange === 'all') return true
    const commentDate = new Date(comment.createdAt)
    const daysAgo = Math.floor((new Date().getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysAgo <= getDateRange()
  })

  // Calculate filtered stats
  const filteredStats = filteredComments.reduce((acc, comment) => ({
    total: acc.total + 1,
    posted: acc.posted + (comment.status === 'POSTED' ? 1 : 0),
    upvotes: acc.upvotes + comment.upvotes,
    replies: acc.replies + comment.replies,
    engagement: acc.engagement + comment.engagement
  }), { total: 0, posted: 0, upvotes: 0, replies: 0, engagement: 0 })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
        
        {/* Time Range Filter */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === '7d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === '30d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Comments"
          value={filteredStats.total}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <StatCard
          title="Posted"
          value={filteredStats.posted}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Total Upvotes"
          value={filteredStats.upvotes}
          icon={<ThumbsUp className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Total Replies"
          value={filteredStats.replies}
          icon={<Reply className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Leads Generated"
          value={filteredStats.engagement}
          icon={<Target className="w-5 h-5 text-orange-600" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Comments Over Time Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Comments Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.commentsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  name="Comments"
                />
                <Line 
                  type="monotone" 
                  dataKey="upvotes" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  name="Upvotes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Comments by Campaign</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.commentsByCampaign} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Comment Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.commentsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.commentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {data.commentsByStatus.map((status, index) => (
              <div key={status.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-gray-600">{status.name}: {status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${data.totalComments > 0 ? (data.postedComments / data.totalComments) * 352 : 0} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {data.totalComments > 0 ? Math.round((data.postedComments / data.totalComments) * 100) : 0}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Posted successfully</p>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Upvotes</span>
                <span className="font-medium">{filteredStats.upvotes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${filteredStats.total > 0 ? Math.min((filteredStats.upvotes / filteredStats.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Replies</span>
                <span className="font-medium">{filteredStats.replies}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${filteredStats.total > 0 ? Math.min((filteredStats.replies / filteredStats.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Engagement</span>
                <span className="font-medium">{filteredStats.engagement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${filteredStats.total > 0 ? Math.min((filteredStats.engagement / (filteredStats.total * 10)) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="bg-white rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold p-6 border-b">Recent Comments</h2>
        {filteredComments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No comments found for the selected time range.
          </div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredComments.slice(0, 10).map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{comment.content.slice(0, 60)}...</p>
                    <span className="text-gray-400 mx-2">on</span>
                    <span className="text-orange-600">{comment.redditPostId}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-4 ${
                    comment.status === 'POSTED' ? 'bg-green-100 text-green-700' :
                    comment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {comment.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                  <span>u/{comment.redditAccount.username}</span>
                  <span>{comment.campaign.name}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {comment.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Reply className="w-3 h-3" /> {comment.replies}
                  </span>
                  {comment.postedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 
                      {new Date(comment.postedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}
