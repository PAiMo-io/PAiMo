'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import EventCard from '@/components/EventCard'
import PageSkeleton from '@/components/PageSkeleton'
import { useApi } from '@/lib/useApi'

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

    useEffect(() => {
        if (status !== 'authenticated') return
        const fetchData = async () => {
            const evRes = await request<{ events: EventItem[] }>({ url: '/api/events', method: 'get' })
            setEvents(evRes.events)
        }
        fetchData()
    }, [status, request])

    if (status === 'loading' || loading) {
        return <PageSkeleton />
    }

    if (error) {
        return <div className="p-4">Failed to load.</div>
    }

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-4">
                <h1 className="text-2xl mb-2">Available Events</h1>
                {events.length === 0 ? (
                    <p>No events.</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {events.map(e => (
                            <Link key={e.id} href={`/events/${e.id}`} className="block">
                                <EventCard event={e} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
