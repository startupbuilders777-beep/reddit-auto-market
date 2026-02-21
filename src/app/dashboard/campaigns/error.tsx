'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function CampaignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Campaigns page error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Failed to load campaigns</h2>
        <p className="text-gray-500 mb-6">
          We couldn&apos;t load your campaigns. Please try again.
        </p>
        
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
