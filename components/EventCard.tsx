'use client';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export interface EventCardProps {
    event: {
        id: string;
        name: string;
        status: string;
        clubName?: string | null;
        registrationEndTime?: string;
        createdAt: string;
        participantCount?: number;
        club?: {
            id: string;
            name: string;
        } | null;
    };
}

export default function EventCard({ event }: EventCardProps) {
    const { t } = useTranslation('common');
    return (
        <div className='border rounded-md p-4 space-y-1 bg-white shadow min-h-[206px]'>
            <h3 className='text-lg font-semibold'>{event.name}</h3>
            {event.clubName && <p className='text-sm text-muted-foreground'>{t('host', { club: event.clubName })}</p>}
            <p className='text-sm text-muted-foreground'>{t('status', { status: event.status })}</p>
            {event.registrationEndTime && (
                <p className='text-sm text-muted-foreground'>
                    {t('registerBy', { time: dayjs(event.registrationEndTime).format('YYYY-MM-DD HH:mm') })}
                </p>
            )}
            <p className='text-sm text-muted-foreground'>
                {t('created', { time: dayjs(event.createdAt).format('YYYY-MM-DD HH:mm') })}
            </p>
            <p className='text-sm text-muted-foreground'>{t('members', { count: event.participantCount ?? 0 })}</p>
            {event.club && <p className='text-sm text-muted-foreground'>{t('club', { club: event.name })}</p>}
        </div>
    );
}
