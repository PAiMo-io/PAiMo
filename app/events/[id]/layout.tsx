'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import PageSkeleton from '@/components/PageSkeleton';
import { useEventPage } from '@/hooks/useEventPage';
import EventContext, { EventContextData } from './EventContext';
import { PullToRefreshWrapper } from '@/components/PullToRefreshWrapper';

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('event');

  // Get all event data using the existing hook
  const eventPageData = useEventPage(params.id);

  // Determine active tab from pathname
  useEffect(() => {
    if (pathname.endsWith('/match')) {
      setActiveTab('match');
    } else if (pathname.endsWith('/ranking')) {
      setActiveTab('ranking');
    } else if (pathname.endsWith('/event-home')) {
      setActiveTab('event');
    } else {
      setActiveTab('event');
    }
  }, [pathname, eventPageData.isParticipant, eventPageData.isAdmin, eventPageData.event?.id, router, params.id]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'event':
        router.push(`/events/${params.id}/event-home`);
        break;
      case 'match':
        router.push(`/events/${params.id}/match`);
        break;
      case 'ranking':
        router.push(`/events/${params.id}/ranking`);
        break;
    }
  };

  if (!eventPageData.event) {
    return <PageSkeleton />;
  }

  return (
    <EventContext.Provider value={eventPageData}>
      <PullToRefreshWrapper className='mt-2' onRefresh={() => eventPageData.actions.fetchEvent()}>
        <div className="w-full max-w-lg">
          {/* Sticky Tabs */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="event" > {t('event')} </TabsTrigger>
                <TabsTrigger value="match">{t('match')}</TabsTrigger>
                <TabsTrigger value="ranking">{t('ranking')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Page Content */}
          <div className="p-4 space-y-6">
            {children}
          </div>
        </div>
      </PullToRefreshWrapper>
    </EventContext.Provider>
  );
}