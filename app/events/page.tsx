'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import EventCard from '@/components/EventCard'
import PageSkeleton from '@/components/PageSkeleton'
import { useApi } from '@/lib/useApi'
import { useTranslation } from 'react-i18next'
import VirtualResponsiveGrid from '@/components/VirtualList'

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
    const { request, loading, error } = useApi()
    const [events, setEvents] = useState<EventItem[]>([])
    const { t } = useTranslation('home')

    useEffect(() => {
        if (status !== 'authenticated') return
        const fetchData = async () => {
            const evRes = await request<{ events: EventItem[] }>({ url: '/api/events', method: 'get' })
            setEvents(evRes.events)
        }
        fetchData()
    }, [status, request])

    useEffect(() => {
        const mainEl = document.querySelector('main')
        if (mainEl) {
          mainEl.classList.add('scrollbar-hide')
        }
        
        return () => {
          if (mainEl) {
            mainEl.classList.remove('scrollbar-hide')
          }
        }
      }, [])

    if (status === 'loading' || loading) {
        return <PageSkeleton />
    }

    if (error) {
        return <div className="p-4">{t('loadError')}</div>
    }

    const emptyComponent = <div className="p-4">{t('noEvents')}</div>

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-4">
                <h1 className="text-2xl mb-2">{t('availableEvents')}</h1>
                <div className="flex flex-col h-screen">
                    <div className="flex-1 pb-[10px]">
                        <VirtualResponsiveGrid
                            data={events}
                            emptyComponent={emptyComponent}
                            renderItem={(item) => (
                                <Link key={item.id} href={`/events/${item.id}`} className="block">
                                    <EventCard event={item} />
                                </Link>
                            )}
                            gap="gap-4"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
