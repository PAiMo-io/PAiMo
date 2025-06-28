'use client'

import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  user: string
  text: string
  timestamp?: number
}

export default function ChatBox({ clubId }: { clubId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    await axios.post(`/api/clubs/${clubId}/messages`, { text: input })
    setInput('')
  }

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="h-64 overflow-y-auto space-y-1">
        {messages.map((m, idx) => (
          <div key={idx} className="p-1 border-b text-sm">
            <strong>{m.user}: </strong>
            {m.text}
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
