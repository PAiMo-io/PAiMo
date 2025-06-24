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

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">My Clubs</h1>
        <Link href="/clubs" className="text-sm underline">Club Directory</Link>
      </div>
      {clubs.length === 0 ? (
        <p>You are not a member of any clubs.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(c => (
            <div key={c.id} className="space-y-1">
              <Link href={`/clubs/${c.id}`} className="block">
                <ClubCard club={c} />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLeaveId(c.id)
                  setShowLeave(true)
                }}
              >
                Leave
              </Button>
            </div>
          ))}
        </div>
      )}
      <ConfirmLeaveDialog
        open={showLeave}
        onClose={() => setShowLeave(false)}
        onConfirm={async () => leaveClub(leaveId)}
      />
    </div>
  )
}
