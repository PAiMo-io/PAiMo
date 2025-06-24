import { Button } from '@/components/ui/button';
import StepIndicator, { EVENT_STEPS, EventStep } from '@/components/StepIndicator';
import dayjs from 'dayjs';

interface Props {
    event: any;
    isAdmin: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function EventHeader({ event, isAdmin, onPrev, onNext }: Props) {
    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            <StepIndicator step={event.status} />
            {isAdmin && (
                <div className="flex space-x-2">
                    <Button onClick={onPrev} disabled={event.status === EVENT_STEPS[0]}>Previous</Button>
                    <Button onClick={onNext} disabled={event.status === EVENT_STEPS[EVENT_STEPS.length - 1]}>Next</Button>
                </div>
            )}
            {event.clubName && <p>Host: {event.clubName}</p>}
            {event.location && <p>Location: {event.location}</p>}
            <p>Status: {event.status}</p>
            {event.registrationEndTime && (
                <p>Register by: {dayjs(event.registrationEndTime).format('YYYY-MM-DD HH:mm')}</p>
            )}
            <p>Created: {dayjs(event.createdAt).format('YYYY-MM-DD HH:mm')}</p>
        </div>
    );
}