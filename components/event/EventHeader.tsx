import { Button } from '@/components/ui/button';
import StepIndicator, { EVENT_STEPS, EventStep } from '@/components/StepIndicator';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Props {
    event: any;
    isAdmin: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function EventHeader({ event, isAdmin, onPrev, onNext }: Props) {
    const { t } = useTranslation('common')
    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            <StepIndicator step={event.status} />
            {isAdmin && (
                <div className="flex space-x-2">
                    <Button onClick={onPrev} disabled={event.status === EVENT_STEPS[0]}>{t('previous')}</Button>
                    <Button onClick={onNext} disabled={event.status === EVENT_STEPS[EVENT_STEPS.length - 1]}>{t('next')}</Button>
                </div>
            )}
            {event.clubName && <p>{t('host', { club: event.clubName })}</p>}
            {event.location && <p>{t('location', { location: event.location })}</p>}
            {event.registrationEndTime && (
                <p>{t('registerBy', { time: dayjs(event.registrationEndTime).format('YYYY-MM-DD HH:mm') })}</p>
            )}
        </div>
    );
}