'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Wrap Calendar with drag and drop (using any type to avoid type conflicts with addon)
const DnDCalendar = withDragAndDrop(Calendar) as any

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface ScheduledPost {
  id: string
  title: string
  start: Date
  end: Date
  campaignId: string
  campaignName: string
  color: string
  status: string
  content?: string
}

interface CampaignCalendarProps {
  posts: ScheduledPost[]
  onSelectEvent?: (post: ScheduledPost) => void
  onEventDrop?: (postId: string, newStart: Date) => void
  isLoading?: boolean
}

type ViewType = 'month' | 'week' | 'day'

export default function CampaignCalendar({ 
  posts, 
  onSelectEvent, 
  onEventDrop,
  isLoading = false 
}: CampaignCalendarProps) {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('month')
  const [date, setDate] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null)

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const today = new Date()
    if (action === 'PREV') {
      if (view === 'month') {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
      } else if (view === 'week') {
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7))
      } else {
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))
      }
    } else if (action === 'NEXT') {
      if (view === 'month') {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
      } else if (view === 'week') {
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7))
      } else {
        setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))
      }
    } else {
      setDate(today)
    }
  }

  const handleSelectEvent = useCallback((event: ScheduledPost) => {
    setSelectedPost(event)
    onSelectEvent?.(event)
  }, [onSelectEvent])

  const handleEventDrop = useCallback(({ event, start }: { event: ScheduledPost; start: Date }) => {
    onEventDrop?.(event.id, start)
  }, [onEventDrop])

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // Could open a modal to create a new scheduled post
    console.log('Selected slot:', slotInfo)
  }, [])

  const eventStyleGetter = useCallback((event: ScheduledPost) => {
    const isPosted = event.status === 'POSTED'
    const isFailed = event.status === 'FAILED'
    
    let backgroundColor = event.color
    if (isPosted) {
      backgroundColor = '#10B981' // green for posted
    } else if (isFailed) {
      backgroundColor = '#EF4444' // red for failed
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: isPosted ? 0.7 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    }
  }, [])

  const CustomToolbar = () => (
    <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleNavigate('PREV')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleNavigate('TODAY')}
          className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => handleNavigate('NEXT')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold ml-2">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>
      
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setView('month')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'month' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setView('day')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            view === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
          }`}
        >
          Day
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <CustomToolbar />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-reddit" />
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-hidden">
          <DnDCalendar
            localizer={localizer}
            events={posts}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            onView={(v) => setView(v as ViewType)}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventDrop}
            selectable
            resizable
            popup
            eventPropGetter={eventStyleGetter}
            components={{
              event: ({ event }: { event: ScheduledPost }) => (
                <div className="truncate">
                  <span className="font-medium">{event.campaignName}</span>
                </div>
              ),
            }}
          />
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Scheduled Post</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Campaign</label>
                <p className="font-medium" style={{ color: selectedPost.color }}>
                  {selectedPost.campaignName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Scheduled Time</label>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(selectedPost.start, 'PPp')}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className={`font-medium ${
                  selectedPost.status === 'POSTED' ? 'text-green-600' :
                  selectedPost.status === 'FAILED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {selectedPost.status}
                </p>
              </div>
              {selectedPost.content && (
                <div>
                  <label className="text-sm text-gray-500">Content</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedPost.content}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => {
                  // Navigate to edit
                  setSelectedPost(null)
                }}
                className="flex-1 px-4 py-2 bg-reddit text-white rounded-lg hover:bg-redditDark transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Legend component for campaign colors
export function CalendarLegend({ campaigns }: { campaigns: { name: string; color: string; count: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Campaigns</h3>
      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <div key={campaign.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: campaign.color }}
            />
            <span className="text-sm flex-1 truncate">{campaign.name}</span>
            <span className="text-xs text-gray-400">{campaign.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
