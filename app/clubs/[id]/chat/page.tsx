'use client';
import { useEffect } from 'react';
import ChatBox from '@/components/chat/ChatBox';
import { registerPush } from '@/lib/registerPush';

export default function ClubChatPage({ params }: { params: { id: string } }) {
    useEffect(() => {
        registerPush();
    }, []);

    return (
        <div className='h-screen'>
            <ChatBox clubId={params.id} />
        </div>
    );
}
