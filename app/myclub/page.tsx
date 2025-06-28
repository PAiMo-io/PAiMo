'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ClubCard from '../../components/ClubCard'
import ConfirmLeaveDialog from '../../components/club/ConfirmLeaveDialog'
import { Button } from '../../components/ui/button'
import PageSkeleton from '../../components/PageSkeleton'
import { useApi } from '../../lib/useApi'
import { useTranslation } from 'react-i18next'
import VirtualResponsiveGrid from '@/components/VirtualList'

interface Club {
  id: string
  name: string
  description?: string
  location?: string
  createdBy?: string
  createdAt?: string
  logoUrl?: string
}

export default function MyClubPage() {
  const { t } = useTranslation();
  const router = useRouter()
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [clubs, setClubs] = useState<Club[]>([])
  const [leaveId, setLeaveId] = useState<string>('')
  const [showLeave, setShowLeave] = useState(false)

  const fetchClubs = useCallback(async () => {
    const res = await request<{ clubs: Club[] }>({ url: '/api/myclubs', method: 'get' })
    setClubs(res.clubs)
  }, [request])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchClubs()
  }, [status, session, router, fetchClubs])

  const leaveClub = async (id: string) => {
    await request({ url: `/api/clubs/${id}/leave`, method: 'delete' })
    fetchClubs()
  }

  if (status === 'loading' || loading) {
    return <PageSkeleton />
  }

  if (error) {
    return <div className="p-4">Failed to load.</div>
  }

  const emptyComponent = <div className="p-4">{t('noClubs')}</div>

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">{t('myClubs')}</h1>
        <div className="flex items-center space-x-2">
          <Link href="/create-club" className="text-sm underline">{t('createClub')}</Link>
          <Link href="/clubs" className="text-sm underline">{t('clubDirectory')}</Link>
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <div className="flex-1 pb-[10px]">
            <VirtualResponsiveGrid
                data={clubs}
                emptyComponent={emptyComponent}
                renderItem={(item) => (
                    <Link key={item.id} href={`/clubs/${item.id}`} className="block">
                        <ClubCard club={item} />
                    </Link>
                )}
                gap="gap-4"
            />
        </div>
      </div>
    </div>
  )
}
