'use client';
import { useEventData } from '../EventContext';
import EventHeader from '@/components/event/EventHeader';
import RegistrationControls from '@/components/event/RegistrationControls';
import EventInfoForm from '@/components/event/EventInfoForm';
import RegistrationSection from '@/components/event/RegistrationSection';
import { useEffect, useState } from 'react';
import ConfirmRevertDialog from '@/components/event/ConfirmRevertDialog';
import { useTranslation } from 'react-i18next';

export default function EventHomePage({ params }: { params: { id: string } }) {
  const {
    session, event,
    isAdmin, isParticipant,
    canRegister, canUnregister,
    actions,
  } = useEventData();

  // Check if current user has edit permissions (admin or participant)
  const hasEditPermission = isAdmin || isParticipant;

  const [showRevertModal, setShowRevertModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { t } = useTranslation();

  useEffect(() => {
    if (!showRevertModal) return;
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showRevertModal, countdown]);

  return (
    <div className="space-y-6">
      <EventHeader
        event={event}
        isAdmin={isAdmin}
        onPrev={() => {
          if (isAdmin && event.status === 'arranging') {
            setCountdown(5);
            setShowRevertModal(true);
          } else {
            actions.prevStep();
          }
        }}
        onNext={actions.nextStep}
      />
      
      <RegistrationControls
        canRegister={canRegister}
        canUnregister={canUnregister}
        onRegister={actions.joinEvent}
        onUnregister={actions.leaveEvent}
      />

      <div className="space-y-4">
        <EventInfoForm key={event?.id} event={event} isAdmin={isAdmin} onSave={actions.updateInfo} />
        {(event.status === 'preparing' || event.status === 'registration') && (
          <RegistrationSection
            participants={event.participants}
            currentUserId={session?.user?.id}
            isAdmin={isAdmin}
            onRemoveParticipant={actions.removeParticipant}
          />
        )}
      </div>

      <ConfirmRevertDialog
        open={showRevertModal}
        onClose={() => setShowRevertModal(false)}
        onConfirm={async () => {
          await actions.deleteAllMatches();
          await actions.prevStep();
        }}
      />
    </div>
  );
}