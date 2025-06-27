'use client'
import Image from 'next/image'
import Avatar from 'boring-avatars'

export interface UserCardProps {
  user: {
    id: string
    username: string
    nickname?: string
    image?: string | null
  },
  width?: string
}

export default function UserCard({ user, width = '100%' }: UserCardProps) {
  const displayName = user.nickname || user.username;
  return (
    <div 
      className="flex items-center space-x-2 p-2 border rounded-md"
      style={{ maxWidth: width }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={displayName}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      ) : (
        <Avatar size={32} name={displayName} variant="beam" />
      )}
      <span className="truncate">{displayName}</span>
    </div>
  )
}
