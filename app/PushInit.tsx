'use client'
import { useEffect } from 'react'
import axios from 'axios'

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Data = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64Data)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export default function PushInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const setup = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (!key) return
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key),
          })
        }
        await axios.post('/api/push/subscribe', sub)
      } catch (err) {
        console.error('Push setup failed', err)
      }
    }
    setup()
  }, [])
  return null
}
