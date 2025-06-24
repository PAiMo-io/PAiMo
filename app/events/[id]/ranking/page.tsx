'use client'

import { useEventPage } from '@/hooks/useEventPage'
import PageSkeleton from '@/components/PageSkeleton'
import EventRanking from '@/components/event/EventRanking'

export default function EventRankingPage({ params }: { params: { id: string } }) {
  const { event, matches } = useEventPage(params.id)

  if (!event) {
    return <PageSkeleton />
  }

  return (
    <div className="p-4">
      <EventRanking matches={matches} />
    </div>
  )
}
