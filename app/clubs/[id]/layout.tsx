'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import PageSkeleton from '@/components/PageSkeleton';
import { useApi } from '@/lib/useApi';
import ClubDataContext, { ClubData } from './ClubContext';
import { PullToRefreshWrapper } from '@/components/PullToRefreshWrapper';

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
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (pathname.endsWith('/club-event')) {
      setActiveTab('event');
    } else if (pathname.endsWith('/club-members')) {
      setActiveTab('members');
    } else if (pathname.endsWith('/club-chat')) {
      setActiveTab('chat');
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

  const fetchClubData = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }
    try {
      const res = await request<{
        club: any;
        members: Member[];
        events: EventItem[];
        adminList: AdminUser[];
      }>({
        url: `/api/clubs/${params.id}`,
        method: 'get',
      });

      const isClubAdmin = res.adminList.some(
        (admin: AdminUser) => admin.id === session?.user?.id
      );
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
    if (refresh) {
      setRefreshing(false);
    } else {
      setInitialLoading(false);
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
      case 'chat':
        router.push(`/clubs/${params.id}/club-chat`);
        break;
    }
  };

  if (status === 'loading' || initialLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <div className="p-4">Failed to load club data.</div>;
  }

  return (
    <ClubDataContext.Provider value={{ clubData, fetchClubData, loading }}>
      {/*
        The chat page should not allow the overall document to scroll.
        When on the chat tab we make the wrapper a full height flex container
        so the inner ChatBox can occupy the remaining space below the sticky
        tab bar. Other tabs retain min-h-screen for natural page height.
      */}
      <div
        className={
          activeTab === 'chat'
            ? 'h-screen flex flex-col overflow-hidden'
            : 'min-h-screen flex flex-col'
        }
      >
        {activeTab === 'chat' ? (
          // No PullToRefresh on chat tab
          <>
            {/* Sticky Tabs */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="home">{t('home')}</TabsTrigger>
                  <TabsTrigger value="event">{t('events')}</TabsTrigger>
                  <TabsTrigger value="members">{t('members')}</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* Page Content */}
            {children}
          </>
        ) : (
          <PullToRefreshWrapper className='mt-4' onRefresh={() => fetchClubData(true)}>
            {/* Sticky Tabs */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="home">{t('home')}</TabsTrigger>
                  <TabsTrigger value="event">{t('events')}</TabsTrigger>
                  <TabsTrigger value="members">{t('members')}</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* Page Content */}
            {children}
          </PullToRefreshWrapper>
        )}
      </div>
    </ClubDataContext.Provider>
  );
}