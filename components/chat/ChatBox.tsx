'use client';
import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { useApi } from '@/lib/useApi';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

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
    const [hasLoaded, setHasLoaded] = useState(false);
    const { request } = useApi();
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const [lastSenderId, setLastSenderId] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
        const pusher = getPusherClient();
        if (!pusher) return;
        const channel = pusher.subscribe(`club-${clubId}`);
        channel.bind('new-message', (data: Message) => {
            setMessages((prev) => [...prev, data]);
            // Only scroll if the message is NOT sent by current user
            if (hasLoaded && data.senderId !== session?.user?.id) {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
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
    }, [clubId, hasLoaded, session?.user?.id]);

    const fetchMessages = async () => {
        const data = await request<Message[]>({
            url: `/api/clubs/${clubId}/messages`,
            method: 'get',
        });
        setMessages(data.reverse());
        setHasLoaded(true); // Mark as loaded after fetching
        // Do NOT scroll here
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        await request({
            url: `/api/clubs/${clubId}/messages`,
            method: 'post',
            data: { content: input },
        });
        setLastSenderId(session?.user?.id || null); // Track last sender
        setInput('');
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className='flex flex-col bg-gray-50 rounded-xl shadow-md' style={{ height: '80vh' }}>
            <div className='flex-1 overflow-y-auto p-4 space-y-3 rounded-t-xl'>
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            exit={{ opacity: 0, translateY: -20 }}
                            transition={{ duration: 0.25 }}
                            className='flex items-start gap-3'
                        >
                            {msg.senderAvatarUrl && (
                                <Image
                                    src={msg.senderAvatarUrl}
                                    width={36}
                                    height={36}
                                    alt='avatar'
                                    className='rounded-full border border-gray-200'
                                />
                            )}
                            <div>
                                <div className='text-xs font-semibold text-gray-700 mb-1'>{msg.senderNickname}</div>
                                <div className='bg-white rounded-2xl px-4 py-2 shadow-sm text-gray-900 break-words max-w-xs'>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
            <div className='p-3 border-t bg-white rounded-b-xl flex gap-2'>
                <input
                    className='flex-1 border border-gray-300 rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
                    style={{ fontSize: 16 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder='Type a message…'
                    autoComplete='off'
                />
                <button
                    className='px-5 py-2 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition'
                    onClick={sendMessage}
                    type='button'
                >
                    Send
                </button>
            </div>
        </div>
    );
}
