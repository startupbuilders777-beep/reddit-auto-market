import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Comment, Campaign } from '@prisma/client'
import { TrendingUp, MessageSquare, ThumbsUp, Reply, Calendar } from 'lucide-react'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  // Get stats
  const [
    totalComments,
    postedComments,
    failedComments,
    totalEngagement,
    upvotes,
    replies,
  ] = await Promise.all([
    prisma.comment.count({ where: { campaign: { userId: session.user.id } } }),
    prisma.comment.count({ where: { campaign: { userId: session.user.id }, status: 'POSTED' } }),
    prisma.comment.count({ where: { campaign: { userId: session.user.id }, status: 'FAILED' } }),
    prisma.comment.aggregate({ where: { campaign: { userId: session.user.id }, status: 'POSTED' }, _sum: { engagement: true } }),
    prisma.comment.aggregate({ where: { campaign: { userId: session.user.id }, status: 'POSTED' }, _sum: { upvotes: true } }),
    prisma.comment.aggregate({ where: { campaign: { userId: session.user.id }, status: 'POSTED' }, _sum: { replies: true } }),
  ])

  // Get recent comments
  const recentComments = await prisma.comment.findMany({
    where: { campaign: { userId: session.user.id } },
    include: {
      campaign: { select: { name: true } },
      redditAccount: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Get daily stats for last 7 days
  const last7Days = await prisma.comment.groupBy({
    by: ['createdAt'],
    where: { 
      campaign: { userId: session.user.id },
      status: 'POSTED',
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    _count: true,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Comments"
          value={totalComments}
          icon={<MessageSquare className="w-6 h-6" />}
        />
        <StatCard
          title="Posted"
          value={postedComments}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Total Upvotes"
          value={upvotes._sum.upvotes || 0}
          icon={<ThumbsUp className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Total Replies"
          value={replies._sum.replies || 0}
          icon={<Reply className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* Success Rate */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${totalComments > 0 ? (postedComments / totalComments) * 100 : 0}%` }}
            />
          </div>
          <span className="text-lg font-medium">
            {totalComments > 0 ? Math.round((postedComments / totalComments) * 100) : 0}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Posted</p>
            <p className="font-medium text-green-600">{postedComments}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Failed</p>
            <p className="font-medium text-red-600">{failedComments}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Pending</p>
            <p className="font-medium text-yellow-600">{totalComments - postedComments - failedComments}</p>
          </div>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="bg-white rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold p-6 border-b">Recent Comments</h2>
        {recentComments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No comments yet. Create a campaign to get started.
          </div>
        ) : (
          <div className="divide-y">
            {recentComments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{comment.content.slice(0, 50)}...</span>
                    <span className="text-gray-400 mx-2">on</span>
                    <span className="text-reddit">{comment.redditPostId}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    comment.status === 'POSTED' ? 'bg-green-100 text-green-700' :
                    comment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {comment.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>u/{comment.redditAccount.username}</span>
                  <span>{comment.campaign.name}</span>
                  {comment.postedAt && (
                    <span>{new Date(comment.postedAt).toLocaleDateString()}</span>
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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  )
}
