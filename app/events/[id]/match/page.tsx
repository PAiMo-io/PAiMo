'use client';
import { useEventData } from '../EventContext';
import ArrangingEventSection from '@/components/ArrangingEventSection';
import MatchesScheduleSection from '@/components/MatchesScheduleSection';
import MatchLobby from '@/components/event/MatchLobby';
import { useTranslation } from 'react-i18next';
import { GameStyle } from '@/types/gameStyle';

export default function MatchPage({ params }: { params: { id: string } }) {
    const { session, event, groups, matches, quickMatches, isAdmin, isParticipant, actions } = useEventData();

    const { t } = useTranslation();

    // Check if current user has interaction permissions (admin or participant)
    const hasInteractionPermission = isAdmin || isParticipant;
    return (
        <div className='w-full'>
            {(() => {
                switch (event.gameStyle) {
                    case GameStyle.FREE_STYLE:
                        // Free Style: Show MatchLobby for quick matches
                        return (
                            <>
                                {event.status === 'running' && (
                                    <MatchLobby
                                        eventId={params.id}
                                        currentUserId={session?.user?.id}
                                        quickMatches={quickMatches}
                                        onRefresh={actions.fetchQuickMatches}
                                        disabled={!hasInteractionPermission}
                                    />
                                )}
                            </>
                        );
                    case GameStyle.RANDOM_MATCHING:
                        // Random Matching: Show original match system
                        return (
                            <>
                                {event.status === 'arranging' ? (
                                    matches.length > 0 ? (
                                        <MatchesScheduleSection
                                            eventId={params.id}
                                            matches={matches}
                                            disabled={!hasInteractionPermission}
                                        />
                                    ) : (
                                        <ArrangingEventSection
                                            groups={groups}
                                            onGroupsChange={actions.saveGroups}
                                            onGenerateGroups={actions.generateGroups}
                                            onGenerateMatches={actions.generateMatches}
                                            disabled={!hasInteractionPermission}
                                        />
                                    )
                                ) : (
                                    <MatchesScheduleSection
                                        eventId={params.id}
                                        matches={matches}
                                        onScoreUpdated={actions.updateMatchScore}
                                        disabled={!hasInteractionPermission}
                                    />
                                )}
                            </>
                        );
                    // Add more cases for other game styles here
                    default:
                        return <div>{t('unsupported_game_style')}</div>;
                }
            })()}
        </div>
    );
}
