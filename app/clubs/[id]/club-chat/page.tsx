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

  // The surrounding layout already handles full screen height. Here we simply
  // fill the remaining space between the sticky top tabs and the page bottom so
  // that only the message list scrolls.
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ChatBox clubId={clubData.club.id} />
    </div>
  )
}
