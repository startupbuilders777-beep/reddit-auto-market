import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RedditAccount } from '@prisma/client'
import Link from 'next/link'
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default async function AccountsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const accounts = await prisma.redditAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  }) as RedditAccount[]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Reddit Accounts</h1>
        <Link
          href="/api/auth/signin?callbackUrl=/dashboard/accounts"
          className="flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Connect Account
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Accounts</p>
          <p className="text-3xl font-bold">{accounts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">
            {accounts.filter(a => a.isActive).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Karma</p>
          <p className="text-3xl font-bold">
            {accounts.reduce((acc, a) => acc + a.karma, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {accounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
            <p className="text-gray-500 mb-4">Connect a Reddit account to start posting comments.</p>
            <Link
              href="/api/auth/signin?callbackUrl=/dashboard/accounts"
              className="inline-flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg"
            >
              Connect Reddit Account
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {accounts.map((account) => (
              <div key={account.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    account.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {account.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">u/{account.username}</p>
                    <p className="text-sm text-gray-500">
                      {account.karma.toLocaleString()} karma
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    account.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
