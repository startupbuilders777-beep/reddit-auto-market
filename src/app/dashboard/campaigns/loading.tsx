import { StatsGridSkeleton, TableSkeleton } from '@/components/LoadingSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-10 w-36 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-5 w-28 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-5 w-28 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      <TableSkeleton rows={5} />
    </div>
  )
}
