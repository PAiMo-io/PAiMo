import webpush from 'web-push'
import { getDb } from './db'

webpush.setVapidDetails(
  'mailto:no-reply@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  icon?: string
}

export async function sendPushNotification(payload: PushPayload, excludeUserId?: string) {
  const db = await getDb()
  const query = excludeUserId ? { userId: { $ne: excludeUserId } } : {}
  const subs = await db.collection('push_subscriptions').find(query).toArray()
  await Promise.all(
    subs.map(sub =>
      webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
        console.error('Push error', err)
      })
    )
  )
}
