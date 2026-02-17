import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, MessageSquare, TrendingUp, Settings, Users } from 'lucide-react'

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-reddit" />
            <span className="text-gray-600">Total Campaigns</span>
          </div>
          <p className="text-3xl font-bold">{campaigns.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Active</span>
          </div>
          <p className="text-3xl font-bold">
            {campaigns.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Total Comments</span>
          </div>
          <p className="text-3xl font-bold">
            {campaigns.reduce((acc, c) => acc + c._count.comments, 0)}
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Create your first campaign to start automating your Reddit marketing.</p>
            <Link
              href="/dashboard/campaigns/new"
              className="inline-flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Keywords</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Subreddits</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Daily Limit</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Comments</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{campaign.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {campaign.keywords.slice(0, 2).map((kw, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{kw}</span>
                      ))}
                      {campaign.keywords.length > 2 && (
                        <span className="text-gray-400 text-xs">+{campaign.keywords.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {campaign.subreddits.slice(0, 2).map((sub, i) => (
                        <span key={i} className="bg-reddit/10 text-reddit px-2 py-1 rounded text-xs">r/{sub}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      campaign.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : campaign.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{campaign.dailyLimit}/day</td>
                  <td className="px-6 py-4 text-gray-600">{campaign._count.comments}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="text-reddit hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
