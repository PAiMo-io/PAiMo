import Pusher from 'pusher-js';

export function getPusherClient() {
    if (typeof window === 'undefined') return null;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';
    return new Pusher(key, { cluster });
}
