import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  // Get user stats
  const [campaigns, comments, accounts] = await Promise.all([
    prisma.campaign.count({ where: { userId: session.user.id } }),
    prisma.comment.count({ 
      where: { campaign: { userId: session.user.id } }
    }),
    prisma.redditAccount.count({ where: { userId: session.user.id, isActive: true } }),
  ])

  const postedComments = await prisma.comment.count({
    where: { campaign: { userId: session.user.id }, status: 'POSTED' },
  })

  const totalEngagement = await prisma.comment.aggregate({
    where: { campaign: { userId: session.user.id }, status: 'POSTED' },
    _sum: { engagement: true },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Campaigns"
          value={campaigns}
          icon={<MessageSquare className="w-6 h-6" />}
        />
        <StatCard
          title="Reddit Accounts"
          value={accounts}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatCard
          title="Comments Posted"
          value={postedComments}
          icon={<MessageSquare className="w-6 h-6" />}
        />
        <StatCard
          title="Total Engagement"
          value={totalEngagement._sum.engagement || 0}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/campaigns/new"
              className="block p-4 border border-gray-200 rounded-lg hover:border-reddit transition"
            >
              <span className="font-medium">Create New Campaign</span>
              <p className="text-sm text-gray-500">Set up automated Reddit marketing</p>
            </Link>
            <Link
              href="/dashboard/accounts/add"
              className="block p-4 border border-gray-200 rounded-lg hover:border-reddit transition"
            >
              <span className="font-medium">Connect Reddit Account</span>
              <p className="text-sm text-gray-500">Add another account for posting</p>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tips</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">Start with 2-3 subreddits to avoid spreading too thin</p>
            </div>
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">Use a helpful tone - it gets 3x more engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  )
}
