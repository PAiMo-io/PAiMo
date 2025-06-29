import webpush from 'web-push';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@paimo.io',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendPush(subscription: webpush.PushSubscription, payload: Record<string, any>) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err) {
        console.error('Push error', err);
    }
}
