'use client'
import { useSession } from 'next-auth/react'
import ChatBox from '@/components/club/ChatBox'
import { useClubData } from '../ClubContext'
import PageSkeleton from '@/components/PageSkeleton'

export default function ClubChatPage() {
  const { clubData } = useClubData()
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <PageSkeleton />
  }

  if (!session) {
    return <div className='p-4'>Login required</div>
  }

  if (!clubData) {
    return <div className='p-4'>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <ChatBox clubId={clubData.club.id} />
    </div>
  )
}
