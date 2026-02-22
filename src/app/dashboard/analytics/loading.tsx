import { StatsGridSkeleton } from '@/components/LoadingSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mb-8" />
      
      <StatsGridSkeleton />
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
        <div className="flex gap-4 mt-4">
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm">
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-4 p-6" />
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
