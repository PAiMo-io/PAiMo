'use client';
import EventRanking from '@/components/event/EventRanking';

export default function RankingPage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full">
      <EventRanking eventId={params.id} />
    </div>
  );
}
