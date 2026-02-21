import { StatsGridSkeleton, TableSkeleton } from '@/components/LoadingSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-lg" />
      </div>

      <StatsGridSkeleton />
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-full mx-auto mb-4" />
          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mx-auto mb-2" />
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}
