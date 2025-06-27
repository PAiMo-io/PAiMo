'use client'
import Image from 'next/image'
import Avatar from 'boring-avatars'

export interface UserMiniCardProps {
  user: {
    id: string
    username: string
    nickname?: string
    image?: string | null
  },
  className?: string
}

export default function UserMiniCard({ user, className }: UserMiniCardProps) {
  const displayName = user.nickname || user.username;
  return (
    <div
      className={`flex flex-col items-center py-2 border rounded-md ${className || ''}`}
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
      <span
        className="truncate text-xs mt-1 text-center"
        style={{ maxWidth: '100px' }}
      >
        {displayName}
      </span>
    </div>
  )
}