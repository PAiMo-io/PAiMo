'use client'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

export interface ClubCardProps {
  club: {
    id: string
    name: string
    description?: string
    location?: string
    createdBy?: string
    createdAt?: string
    logoUrl?: string
    eventsCount?: number
    pendingRequestsCount?: number
  }
  children?: React.ReactNode
  isAdmin?: boolean
}

export default function ClubCard({ club, children, isAdmin = false }: ClubCardProps) {
  const { t } = useTranslation('common')
  const router = useRouter()

  const handlePendingClick = () => {
    if (isAdmin && club.pendingRequestsCount && Number(club.pendingRequestsCount) > 0) {
      router.push(`/clubs/${club.id}/club-requests`)
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="flex space-x-4 items-start justify-between">
        <div className="flex space-x-4 items-start flex-1">
          {club.logoUrl && (
            <img
              src={club.logoUrl}
              alt={club.name}
              className="w-12 h-12 object-cover rounded-full"
            />
          )}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{club.name}</h3>
            {club.description && (
              <p className="text-sm text-muted-foreground">{club.description}</p>
            )}
            {club.location && (
              <p className="text-sm text-muted-foreground">{t('location', { location: club.location })}</p>
            )}
            {club.createdBy && (
              <p className="text-sm text-muted-foreground">{t('createdBy', { createdBy: club.createdBy })}</p>
            )}
            {club.createdAt && (
              <p className="text-sm text-muted-foreground">
                {t('created', { time: dayjs(club.createdAt).format('YYYY-MM-DD HH:mm') })}
              </p>
            )}
            {club.eventsCount !== undefined && (
              <p className="text-sm text-muted-foreground">
                {t('eventsCount', { count: club.eventsCount })}
              </p>
            )}
          </div>
        </div>
        {isAdmin && club.pendingRequestsCount !== undefined && Number(club.pendingRequestsCount) > 0 && (
          <div 
            className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-orange-200 transition-colors"
            onClick={handlePendingClick}
            title={t('clickToViewRequests')}
          >
            {t('pendingRequests', { count: club.pendingRequestsCount })}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
