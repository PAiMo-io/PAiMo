'use client';
import { useEventPage } from '@/hooks/useEventPage';
import EventHeader from '@/components/event/EventHeader';
import RegistrationControls from '@/components/event/RegistrationControls';
import EventInfoForm from '@/components/event/EventInfoForm';
import RegistrationSection from '@/components/event/RegistrationSection';
import PageSkeleton from '@/components/PageSkeleton';
import { useEffect, useState } from 'react';
import ConfirmRevertDialog from '@/components/event/ConfirmRevertDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ArrangingEventSection from '@/components/ArrangingEventSection';
import MatchesScheduleSection from '@/components/MatchesScheduleSection';
import EventRanking from '@/components/event/EventRanking';

export default function EventPage({ params }: { params: { id: string } }) {
  const {
    session, event,
    groups, matches,
    isAdmin, isParticipant,
    canRegister, canUnregister,
    actions, // joinEvent, leaveEvent, …
  } = useEventPage(params.id);

  const [showRevertModal, setShowRevertModal] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!showRevertModal) return
    if (countdown === 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [showRevertModal, countdown])

  const [tab, setTab] = useState<'event' | 'match' | 'ranking'>('event')

  if (!event) return <PageSkeleton />;

  return (
    <div className="p-4 space-y-6">
      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="event">Event</TabsTrigger>
          <TabsTrigger value="match">Match</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="event">
          <EventHeader
            event={event}
            isAdmin={isAdmin}
            onPrev={() => {
              if (isAdmin && event.status === 'arranging') {
                setCountdown(5)
                setShowRevertModal(true)
              } else {
                actions.prevStep()
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
            <EventInfoForm event={event} isAdmin={isAdmin} onSave={actions.updateInfo} />
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
              await actions.deleteAllMatches()
              await actions.prevStep()
            }}
          />
        </TabsContent>

        <TabsContent value="match">
          {event.status === 'arranging' ? (
            matches.length > 0 ? (
              <MatchesScheduleSection matches={matches} />
            ) : (
              <ArrangingEventSection
                groups={groups}
                onGroupsChange={actions.saveGroups}
                onGenerateGroups={actions.generateGroups}
                onGenerateMatches={actions.generateMatches}
              />
            )
          ) : (
            <MatchesScheduleSection
              matches={matches}
              onScoreUpdated={actions.updateMatchScore}
            />
          )}
        </TabsContent>

        <TabsContent value="ranking">
          <EventRanking matches={matches} />
        </TabsContent>
      </Tabs>
    </div>
  );
}