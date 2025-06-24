'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import ConfirmLeaveDialog from '../../../components/club/ConfirmLeaveDialog';
import ClubMap from '../../../components/club/ClubMap';
import EventCard from '../../../components/EventCard';
import ClubCard from '../../../components/ClubCard';
import UserCard from '../../../components/UserCard';
import PageSkeleton from '../../../components/PageSkeleton'
import { useApi } from '../../../lib/useApi'

interface Member {
  id: string;
  username: string;
  image?: string | null;
}

interface EventItem {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  participantCount?: number;
  visibility: string;
  registrationEndTime?: string;
  location?: string;
  clubName?: string | null;
}

export default function ClubHome({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubCreatedBy, setClubCreatedBy] = useState('');
  const [clubCreatedAt, setClubCreatedAt] = useState('');
  const [clubLogo, setClubLogo] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    const fetchClub = async () => {
      const res = await request<{ club: any; members: Member[]; events: EventItem[] }>({
        url: `/api/clubs/${params.id}`,
        method: 'get',
      });
      setMembers(res.members);
      setEvents(res.events.map(e => ({ ...e, clubName: res.club.name })));
      setClubName(res.club.name);
      setClubDesc(res.club.description || '');
      setClubLocation(res.club.location || '');
      setClubCreatedBy(res.club.createdBy || '');
      setClubCreatedAt(res.club.createdAt || '');
      setClubLogo(res.club.logoUrl || '');
      setIsMember(res.members.some((m: Member) => m.id === session?.user?.id));
    };
    fetchClub();
  }, [status, session, router, params.id, request]);

  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'super-admin';
  const showEvents = isAdmin || isMember;

  const joinClub = async () => {
    await request({ url: `/api/clubs/${params.id}`, method: 'post' });
    const res = await request<{ club: any; members: Member[]; events: EventItem[] }>({
      url: `/api/clubs/${params.id}`,
      method: 'get',
    });
    setMembers(res.members);
    setEvents(res.events.map(e => ({ ...e, clubName: res.club.name })));
    setClubName(res.club.name);
    setClubDesc(res.club.description || '');
    setClubLocation(res.club.location || '');
    setClubCreatedBy(res.club.createdBy || '');
    setClubCreatedAt(res.club.createdAt || '');
    setClubLogo(res.club.logoUrl || '');
    setIsMember(res.members.some((m: Member) => m.id === session?.user?.id));
  };

  const leaveClub = async () => {
    await request({ url: `/api/clubs/${params.id}/leave`, method: 'delete' });
    const res = await request<{ club: any; members: Member[]; events: EventItem[] }>({
      url: `/api/clubs/${params.id}`,
      method: 'get',
    });
    setMembers(res.members);
    setEvents(res.events.map(e => ({ ...e, clubName: res.club.name })));
    setClubName(res.club.name);
    setClubDesc(res.club.description || '');
    setClubLocation(res.club.location || '');
    setClubCreatedBy(res.club.createdBy || '');
    setClubCreatedAt(res.club.createdAt || '');
    setClubLogo(res.club.logoUrl || '');
    setIsMember(res.members.some((m: Member) => m.id === session?.user?.id));
  };

  const createEvent = async () => {
    if (!newEventName) return;
    await request({
      url: '/api/events',
      method: 'post',
      data: { name: newEventName, clubId: params.id, status: 'preparing', visibility: 'private' },
    });
    setNewEventName('');
    const res = await request<{ club: any; events: EventItem[] }>({
      url: `/api/clubs/${params.id}`,
      method: 'get',
    });
    setEvents(res.events.map(e => ({ ...e, clubName: res.club.name })));
    setClubName(res.club.name);
    setClubDesc(res.club.description || '');
    setClubLocation(res.club.location || '');
    setClubCreatedBy(res.club.createdBy || '');
    setClubCreatedAt(res.club.createdAt || '');
    setClubLogo(res.club.logoUrl || '');
  };

  const updateLocation = async () => {
    setSavingLocation(true);
    await request({
      url: `/api/clubs/${params.id}`,
      method: 'put',
      data: { location: clubLocation },
    });
    setSavingLocation(false);
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />
  }

  if (error) {
    return <div className="p-4">Failed to load.</div>
  }

  return (
    <div className="p-4 space-y-4">
      <ClubCard
        club={{
          id: params.id,
          name: clubName,
          description: clubDesc,
          location: clubLocation,
          createdBy: clubCreatedBy,
          createdAt: clubCreatedAt,
          logoUrl: clubLogo,
        }}
      />
      {clubLocation && (
        <div>
          <h2 className="text-xl mb-2">Location Map</h2>
          <ClubMap location={clubLocation} />
        </div>
      )}
      {isAdmin && (
        <div className="space-x-2 mt-2 flex items-center">
          <Input
            placeholder="Club location"
            value={clubLocation}
            onChange={e => setClubLocation(e.target.value)}
            className="flex-1"
          />
          <Button onClick={updateLocation} disabled={savingLocation}>Save</Button>
        </div>
      )}
      {showEvents && (
        <div>
          <h2 className="text-xl mb-2">Ongoing Events</h2>
          {events.filter(e => isMember || e.visibility !== 'private').length === 0 ? (
            <p>No events.</p>
          ) : (
            <div className="space-y-2">
              {events
                .filter(e => isMember || e.visibility !== 'private')
                .map(e => (
                  <Link key={e.id} href={`/events/${e.id}`}> 
                    <EventCard event={e} />
                  </Link>
                ))}
            </div>
          )}
          {isAdmin && (
            <div className="mt-2 space-x-2 flex items-center">
              <Input
                value={newEventName}
                onChange={e => setNewEventName(e.target.value)}
                placeholder="Event name"
                className="w-48"
              />
              <Button onClick={createEvent}>Create Event</Button>
            </div>
          )}
        </div>
      )}
      <div>
        <h2 className="text-xl mb-2">Members</h2>
        <div className="space-y-1">
          {members?.map(m => (
            <UserCard key={m.id} user={m} />
          ))}
        </div>
      </div>
      {!isMember && <Button onClick={joinClub}>Join us!</Button>}
      {isMember && (
        <>
          <Button variant="destructive" onClick={() => setShowLeave(true)}>
            Leave Club
          </Button>
          <ConfirmLeaveDialog
            open={showLeave}
            onClose={() => setShowLeave(false)}
            onConfirm={leaveClub}
          />
        </>
      )}
    </div>
  );
}
