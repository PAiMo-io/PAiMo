'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import EventCard from '../components/EventCard'
import ClubCard from '../components/ClubCard'
import PageSkeleton from '../components/PageSkeleton'
import { useApi } from '../lib/useApi'
import { useRouter } from 'next/navigation';
import { IUser } from '@/models/User'

import { useTranslation } from 'react-i18next'
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

export default function Home() {
  const { data: session, status } = useSession()
  const { request, error } = useApi()
  const [events, setEvents] = useState<EventItem[]>([])
  const [user, setUser] = useState<IUser>({} as IUser)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();

  const fetchEvents = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }
    const evRes = await request<{ events: EventItem[] }>({ url: '/api/user-events', method: 'get' })
    setEvents(evRes.events)
    if (refresh) {
      setRefreshing(false)
    } else {
      setInitialLoading(false)
    }
  }

  const { t } = useTranslation('home')
  useEffect(() => {
    if (status !== 'authenticated') return
    if (session.user?.profileComplete === false) {
      router.push('/create-profile');
    }
    const fetchUser = async () => {
      const userRes = await request<{ user: IUser }>({ url: '/api/profile', method: 'get' })
      setUser(userRes.user)
    }
    fetchEvents()
    fetchUser()
  }, [status, request, router, session])

  if (status === 'loading' || initialLoading) {
    return <PageSkeleton />
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <h1 className="text-3xl font-bold pl-4 pr-4 text-center">{t('welcomeTitle')}</h1>
        <p className="text-center pl-4 pr-4">{t('welcomeSubtitle')}</p>
        <div className="space-x-4 flex">
          <Button>
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button variant="outline">
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
    
      <div className="p-4 space-y-4 w-full h-full">
        <PullToRefreshWrapper onRefresh={() => fetchEvents(true)}>
          <div className="flex space-x-2">
            <span className="text-lg font-semibold flex-1">
              👋 {t('hi', { name: user?.nickname ?? t('defaultName') })}!
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl mb-2">{t('availableEvents')}</h1>
            {events.length === 0 ? (
              <p>{t('noEvents')}</p>
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
        </PullToRefreshWrapper>
      </div>
  )
}
