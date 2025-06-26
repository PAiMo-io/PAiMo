'use client'
import Image from 'next/image'
import Avatar from 'boring-avatars'

export interface UserCardProps {
  user: {
    id: string
    username: string
    image?: string | null
  },
  width?: string
}

export default function UserCard({ user, width = '100%' }: UserCardProps) {
  return (
    <div 
      className="flex items-center space-x-2 p-2 border rounded-md"
      style={{ maxWidth: width }}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.username}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      ) : (
        <Avatar size={32} name={user.username} variant="beam" />
      )}
      <span className="truncate">{user.username}</span>
    </div>
  )
}
