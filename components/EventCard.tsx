'use client'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

export interface EventCardProps {
  event: {
    id: string
    name: string
    status: string
    clubName?: string | null
    registrationEndTime?: string
    createdAt: string
    participantCount?: number
  }
}

export default function EventCard({ event }: EventCardProps) {
  const { t } = useTranslation('common')
  return (
    <div className="border rounded-md p-4 space-y-1">
      <h3 className="text-lg font-semibold">{event.name}</h3>
      {event.clubName && (
        <p className="text-sm text-muted-foreground">{t('host', { club: event.clubName })}</p>
      )}
      <p className="text-sm text-muted-foreground">{t('status', { status: event.status })}</p>
      {event.registrationEndTime && (
        <p className="text-sm text-muted-foreground">
          {t('registerBy', { time: dayjs(event.registrationEndTime).format('YYYY-MM-DD HH:mm') })}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {t('created', { time: dayjs(event.createdAt).format('YYYY-MM-DD HH:mm') })}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('members', { count: event.participantCount ?? 0 })}
      </p>
    </div>
  )
}
