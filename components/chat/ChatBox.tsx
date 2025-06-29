'use client';
import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { useApi } from '@/lib/useApi';
import Image from 'next/image';

interface Message {
    _id: string;
    clubId: string;
    senderId: string;
    senderNickname: string;
    senderAvatarUrl?: string;
    content: string;
    timestamp: string;
}

export default function ChatBox({ clubId }: { clubId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const { request } = useApi();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const pusher = getPusherClient();
        if (!pusher) return;
        const channel = pusher.subscribe(`club-${clubId}`);
        channel.bind('new-message', (data: Message) => {
            setMessages((prev) => [...prev, data]);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(data.senderNickname, {
                        body: data.content,
                        icon: data.senderAvatarUrl || '/icon-192x192.png',
                    });
                });
            }
        });
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [clubId]);

    const fetchMessages = async () => {
        const data = await request<Message[]>({
            url: `/api/clubs/${clubId}/messages`,
            method: 'get',
        });
        setMessages(data.reverse());
        setTimeout(() => bottomRef.current?.scrollIntoView(), 0);
    };

    const sendMessage = async () => {
        if (!input) return;
        await request({
            url: `/api/clubs/${clubId}/messages`,
            method: 'post',
            data: { content: input },
        });
        setInput('');
    };

    return (
        <div className='flex flex-col h-full'>
            <div className='flex-1 overflow-y-auto p-2 space-y-2'>
                {messages.map((msg) => (
                    <div key={msg._id} className='flex items-start gap-2'>
                        {msg.senderAvatarUrl && (
                            <Image
                                src={msg.senderAvatarUrl}
                                width={32}
                                height={32}
                                alt='avatar'
                                className='rounded-full'
                            />
                        )}
                        <div>
                            <div className='text-sm font-semibold'>{msg.senderNickname}</div>
                            <div className='bg-gray-100 rounded p-2'>{msg.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className='p-2 border-t flex gap-2'>
                <input
                    className='flex-1 border rounded p-2'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type a message'
                />
                <button className='px-4 py-2 bg-blue-500 text-white rounded' onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}
