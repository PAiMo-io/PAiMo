'use client'
import dayjs from 'dayjs'

export interface EventCardProps {
  event: {
    id: string
    name: string
    status: string
    clubName?: string | null
    registrationEndTime?: string
    createdAt: string
    participantCount?: number
    club?: {
      id: string
      name: string
    } | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="border rounded-md p-4 space-y-1">
      <h3 className="text-lg font-semibold">{event.name}</h3>
      {event.clubName && (
        <p className="text-sm text-muted-foreground">Host: {event.clubName}</p>
      )}
      <p className="text-sm text-muted-foreground">Status: {event.status}</p>
      {event.registrationEndTime && (
        <p className="text-sm text-muted-foreground">
          Register by: {dayjs(event.registrationEndTime).format('YYYY-MM-DD HH:mm')}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Created: {dayjs(event.createdAt).format('YYYY-MM-DD HH:mm')}
      </p>
      <p className="text-sm text-muted-foreground">
        Members: {event.participantCount ?? 0}
      </p>
      {event.club && (
        <p className="text-sm text-muted-foreground">
          Club: {event.club.name}
        </p>
      )}
    </div>
  )
}
