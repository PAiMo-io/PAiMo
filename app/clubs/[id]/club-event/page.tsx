'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import EventCard from '@/components/EventCard';
import PageSkeleton from '@/components/PageSkeleton';
import { useApi } from '@/lib/useApi';

interface Member {
  id: string;
  username: string;
  nickname?: string;
  gender?: string;
  image?: string | null;
  role?: string;
}

interface AdminUser {
  id: string;
  username: string;
  nickname?: string;
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

interface Club {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdBy?: string;
  createdAt?: string;
  logoUrl?: string;
  visibility?: string;
}

interface ClubData {
  club: Club;
  members: Member[];
  events: EventItem[];
  adminList: AdminUser[];
  isMember: boolean;
  isAdmin: boolean;
}

export default function ClubEventPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [clubData, setClubData] = useState<ClubData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchClubData();
  }, [status, session, router, params.id, request]);

  const fetchClubData = async () => {
    try {
      const res = await request<{ club: any; members: Member[]; events: EventItem[]; adminList: AdminUser[] }>({
        url: `/api/clubs/${params.id}`,
        method: 'get',
      });

      const isClubAdmin = res.adminList.some((a: AdminUser) => a.id === session?.user?.id);
      const isSuperAdmin = session?.user?.role === 'super-admin';
      const isAdmin = isClubAdmin || isSuperAdmin;
      const isMember = res.members.some((m: Member) => m.id === session?.user?.id);

      setClubData({
        club: {
          id: params.id,
          name: res.club.name,
          description: res.club.description || '',
          location: res.club.location || '',
          createdBy: res.club.createdBy || '',
          createdAt: res.club.createdAt || '',
          logoUrl: res.club.logoUrl || '',
          visibility: res.club.visibility || 'private',
        },
        members: res.members,
        events: res.events.map(e => ({ ...e, clubName: res.club.name })),
        adminList: res.adminList,
        isMember,
        isAdmin,
      });
    } catch (err) {
      console.error('Failed to fetch club data:', err);
    }
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />;
  }

  if (error || !clubData) {
    return <div className="p-4">Failed to load club data.</div>;
  }

  // Filter events based on user permissions
  const visibleEvents = clubData.events.filter(event => 
    clubData.isMember || event.visibility !== 'private'
  );

  // Group events by status
  const eventsByStatus = {
    preparing: visibleEvents.filter(e => e.status === 'preparing'),
    registration: visibleEvents.filter(e => e.status === 'registration'),
    arrangingMatches: visibleEvents.filter(e => e.status === 'arrangingMatches'),
    matchRunning: visibleEvents.filter(e => e.status === 'matchRunning'),
    ended: visibleEvents.filter(e => e.status === 'ended'),
  };

  const renderEventSection = (title: string, events: typeof visibleEvents, statusKey: string) => {
    if (events.length === 0) return null;

    return (
      <Card key={statusKey}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-sm font-normal text-gray-500">({events.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <EventCard event={event} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!clubData.isAdmin && !clubData.isMember) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>You need to be a member to view club events.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('events')} - {clubData.club.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {visibleEvents.length}
              </div>
              <div className="text-sm text-gray-500">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {eventsByStatus.preparing.length + eventsByStatus.registration.length + 
                 eventsByStatus.arrangingMatches.length + eventsByStatus.matchRunning.length}
              </div>
              <div className="text-sm text-gray-500">Active Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>{t('noEvents')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {renderEventSection(t('preparing'), eventsByStatus.preparing, 'preparing')}
          {renderEventSection(t('registration'), eventsByStatus.registration, 'registration')}
          {renderEventSection(t('arrangingMatches'), eventsByStatus.arrangingMatches, 'arrangingMatches')}
          {renderEventSection(t('matchRunning'), eventsByStatus.matchRunning, 'matchRunning')}
          {renderEventSection(t('ended'), eventsByStatus.ended, 'ended')}
        </div>
      )}
      </div>
    </div>
  );
}