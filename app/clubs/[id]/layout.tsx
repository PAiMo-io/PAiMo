'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import PageSkeleton from '@/components/PageSkeleton';
import { useApi } from '@/lib/useApi';

interface Member {
  id: string;
  username: string;
  nickname?: string;
  gender?: string;
  image?: string | null;
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

import ClubDataContext, { ClubData } from './ClubContext';

export default function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { t } = useTranslation('club');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  // Determine active tab from pathname
  useEffect(() => {
    if (pathname.endsWith('/club-event')) {
      setActiveTab('event');
    } else if (pathname.endsWith('/club-members')) {
      setActiveTab('members');
    } else {
      setActiveTab('home');
    }
  }, [pathname]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchClubData();
  }, [status, session, router, params.id]);

  const fetchClubData = async () => {
    try {
      const res = await request<{ club: any; members: Member[]; events: EventItem[]; adminList: AdminUser[] }>({
        url: `/api/clubs/${params.id}`,
        method: 'get',
      });

      const isClubAdmin = res.adminList.some((admin: AdminUser) => admin.id === session?.user?.id);
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'home':
        router.push(`/clubs/${params.id}`);
        break;
      case 'event':
        router.push(`/clubs/${params.id}/club-event`);
        break;
      case 'members':
        router.push(`/clubs/${params.id}/club-members`);
        break;
    }
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <div className="p-4">Failed to load club data.</div>;
  }

  return (
    <ClubDataContext.Provider value={{ clubData, fetchClubData, loading }}>
      <div className="min-h-screen">
        {/* Sticky Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="home">{t('home')}</TabsTrigger>
              <TabsTrigger value="event">{t('events')}</TabsTrigger>
              <TabsTrigger value="members">{t('members')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </ClubDataContext.Provider>
  );
}