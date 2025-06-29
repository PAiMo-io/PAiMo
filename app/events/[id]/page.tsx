'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to event-home by default
    router.replace(`/events/${params.id}/event-home`);
  }, [params.id, router]);

  return null;
}