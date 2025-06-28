'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ClubCard from '../../components/ClubCard'
import PageSkeleton from '../../components/PageSkeleton'
import { useApi } from '../../lib/useApi'
import { useTranslation } from 'react-i18next'
import { Input } from '../../components/ui/input'

interface ClubItem {
  id: string
  name: string
  description?: string
  location?: string
  createdBy?: string
  createdAt?: string
  logoUrl?: string
}

export default function ClubsDirectory() {
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [search, setSearch] = useState('')
  const { t } = useTranslation('common')
  
  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchClubs = async () => {
      const res = await request<{ clubs: any[] }>({ url: '/api/clubs', method: 'get' })
      setClubs(
        res.clubs.map(c => ({
          id: c._id || c.id,
          name: c.name,
          description: c.description,
          location: c.location,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
          logoUrl: c.logoUrl,
        }))
      )
    }
    fetchClubs()
  }, [status, request])

  if (status === 'loading' || loading) {
    return <PageSkeleton />
  }

  if (error) {
    return <div className="p-4">{t('loadFailed')}</div>
  }

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl mb-2">{t('clubsDirectory')}</h1>
      {clubs.length > 0 && (
        <Input
          placeholder={t('searchClubs')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      )}
      {filteredClubs.length === 0 ? (
        <p>{t('noClubsAvailable')}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map(c => (
            <Link key={c.id} href={`/clubs/${c.id}`} className="block">
              <ClubCard club={c} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
