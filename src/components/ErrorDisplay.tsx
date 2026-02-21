'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react'

interface ErrorDisplayProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  isRetrying = false,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-1">{title}</h3>
          <p className="text-sm text-red-600">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try again'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface ApiErrorDisplayProps {
  endpoint: string
  error: Error | null
  isLoading: boolean
  onRetry: () => void
}

export function ApiErrorDisplay({ endpoint, error, isLoading, onRetry }: ApiErrorDisplayProps) {
  const [showHelp, setShowHelp] = useState(false)
  
  // Determine error message based on error type
  let errorMessage = 'An unexpected error occurred. Please try again.'
  
  if (error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.'
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      errorMessage = 'Your session has expired. Please log in again.'
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      errorMessage = 'You do not have permission to perform this action.'
    } else if (error.message.includes('500') || error.message.includes('server')) {
      errorMessage = 'Server error. Our team has been notified. Please try again in a few minutes.'
    } else if (error.message.includes('429') || error.message.includes('rate')) {
      errorMessage = 'Too many requests. Please wait a moment before trying again.'
    }
  }

  return (
    <div className="space-y-4">
      <ErrorDisplay
        title="Failed to load data"
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isLoading}
      />
      
      {process.env.NODE_ENV === 'development' && error && (
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <HelpCircle className="w-4 h-4" />
          {showHelp ? 'Hide' : 'Show'} error details
        </button>
      )}
      
      {showHelp && error && (
        <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
          <p className="font-semibold mb-1">Endpoint: {endpoint}</p>
          <p className="text-gray-600">Error: {error.message}</p>
        </div>
      )}
    </div>
  )
}

interface LoadingErrorWrapperProps {
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  children: React.ReactNode
  loadingFallback?: React.ReactNode
}

export function LoadingErrorWrapper({
  isLoading,
  error,
  onRetry,
  children,
  loadingFallback,
}: LoadingErrorWrapperProps) {
  if (isLoading) {
    return loadingFallback || (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return <ApiErrorDisplay endpoint="" error={error} isLoading={isLoading} onRetry={onRetry} />
  }

  return <>{children}</>
}
