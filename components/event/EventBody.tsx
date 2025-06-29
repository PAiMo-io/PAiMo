import ArrangingEventSection from '@/components/ArrangingEventSection';
import MatchesScheduleSection from '@/components/MatchesScheduleSection';
import RegistrationSection from './RegistrationSection'; // if needed
import { EventStep } from '../StepIndicator';
// import other step sections…

export interface EventBodyProps {
    status: EventStep;
    participants: any[];
    groups: any[][];
    matches: any[];
    actions: any;
    isAdmin: boolean;
    user: any;
    eventId: string;
}

export default function EventBody(props: EventBodyProps) {
    const { status, participants, actions, isAdmin, user } = props;

    switch (status) {
        case 'preparing':
        case 'registration':
            return <RegistrationSection
                participants={participants}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onRemoveParticipant={actions.removeParticipant}
            />;
        case 'arranging':
            return (
                <>
                    {props.matches.length > 0
                        ? <MatchesScheduleSection eventId={props.eventId} currentUserId={user?.id} matches={props.matches} />
                        : <ArrangingEventSection
                            groups={props.groups}
                            onGroupsChange={actions.saveGroups}
                            onGenerateGroups={actions.generateGroups}
                            onGenerateMatches={actions.generateMatches}
                        />}
                </>
            );
        case 'running':
            return (
                <MatchesScheduleSection eventId={props.eventId} currentUserId={user?.id} matches={props.matches} onScoreUpdated={actions.updateMatchScore} />
            );
        case 'ended':
            return <MatchesScheduleSection eventId={props.eventId} currentUserId={user?.id} matches={props.matches} />;
        default:
            return null;
    }
}