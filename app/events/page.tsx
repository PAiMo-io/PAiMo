'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import EventCard from '@/components/EventCard'
import PageSkeleton from '@/components/PageSkeleton'
import { useApi } from '@/lib/useApi'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { PullToRefreshWrapper } from '@/components/PullToRefreshWrapper'

interface EventItem {
    id: string
    name: string
    status: string
    clubName?: string | null
    registrationEndTime?: string
    createdAt: string
    participantCount?: number
}

export default function EventsPage() {
    const { data: session, status } = useSession()
    const { request, error } = useApi()
    const [events, setEvents] = useState<EventItem[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')
    const { t } = useTranslation('home')

    const fetchData = async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      const evRes = await request<{ events: EventItem[] }>({
        url: "/api/events",
        method: "get",
      });
      setEvents(evRes.events);
      if (refresh) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    };

    useEffect(() => {
        if (status !== 'authenticated') return
        fetchData()
    }, [status, request])

    if (status === 'loading' || initialLoading) {
        return <PageSkeleton />
    }

    if (error) {
        return <div className="p-4">{t('loadError')}</div>
    }

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-4 space-y-4">
            <PullToRefreshWrapper onRefresh={() => fetchData(true)}>
                <div className="space-y-4">
                    <h1 className="text-2xl mb-2">{t('availableEvents')}</h1>
                    {events.length > 0 && (
                        <Input
                            placeholder={t('searchEvents')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                    )}
                    {filteredEvents.length === 0 ? (
                        <p>{t('noEvents')}</p>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEvents.map(e => (
                                <Link key={e.id} href={`/events/${e.id}`} className="block">
                                    <EventCard event={e} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {/* <TopLoader /> */}
            </PullToRefreshWrapper>
        </div>
    )
}
