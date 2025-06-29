'use client'

import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  senderName: string
  content: string
  timestamp?: string
}

export default function ChatBox({ clubId }: { clubId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/clubs/${clubId}/messages`)
        setMessages(res.data.messages || [])
      } catch (err) {
        console.error('Failed to load messages', err)
      }
    }
    load()
  }, [clubId])

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!pusherKey || !pusherCluster) return

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    })
    const channel = pusher.subscribe(`club-${clubId}`)

    channel.bind('message', (data: Message) => {
      setMessages(prev => [...prev, data])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [clubId])

  useEffect(() => {
    const container = bottomRef.current?.parentElement
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    try {
      await axios.post(`/api/clubs/${clubId}/messages`, { content: input })
      setInput('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="h-64 sm:h-96 max-h-[70vh] overflow-y-auto space-y-1" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((m, idx) => (
          <div key={idx} className="p-1 border-b text-sm">
            <strong>{m.senderName}: </strong>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}
