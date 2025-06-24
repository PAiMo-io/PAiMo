'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import EventCard from '../components/EventCard'
import PageSkeleton from '../components/PageSkeleton'
import { useApi } from '../lib/useApi'
import { useTranslation } from 'react-i18next'
interface EventItem {
  id: string
  name: string
  status: string
  clubName?: string | null
  registrationEndTime?: string
  createdAt: string
  participantCount?: number
}

export default function Home() {
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [events, setEvents] = useState<EventItem[]>([])
  const { t } = useTranslation('home')
  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchEvents = async () => {
      const res = await request<{ events: EventItem[] }>({ url: '/api/events', method: 'get' })
      setEvents(res.events)
    }
    fetchEvents()
  }, [status, request])

  if (status === 'loading' || loading) {
    return <PageSkeleton />
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <h1 className="text-3xl font-bold pl-4 pr-4">{t('welcomeTitle')}</h1>
        <p className="text-center pl-4 pr-4">{t('welcomeSubtitle')}</p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">{t('signup')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4">{t('loadError')}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl mb-2">{t('availableEvents')}</h1>
      {events.length === 0 ? (
        <p>{t('noEvents')}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(e => (
            <Link key={e.id} href={`/events/${e.id}`}
              className="block">
              <EventCard event={e} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
