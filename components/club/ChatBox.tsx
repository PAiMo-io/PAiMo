'use client'

import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import axios from 'axios'
import Image from 'next/image'
import Avatar from 'boring-avatars'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Message {
  senderId: string
  senderName: string
  senderNickname?: string
  senderAvatarUrl?: string | null
  content: string
  timestamp?: string
}

export default function ChatBox({ clubId }: { clubId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const load = async () => {
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

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster })
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
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      await axios.post(`/api/clubs/${clubId}/messages`, { content: trimmed })
      setInput('')
      textareaRef.current?.focus()
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Scrollable message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {m.senderAvatarUrl ? (
              <Image
                src={m.senderAvatarUrl}
                alt={m.senderNickname || m.senderName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Avatar size={32} name={m.senderNickname || m.senderName} variant="beam" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {m.senderNickname || m.senderName}
                </span>
                {m.timestamp && (
                  <span className="text-xs text-gray-500">
                    {dayjs(m.timestamp).format('HH:mm')}
                  </span>
                )}
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 mt-1 text-sm whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-2 border-t bg-white flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Type a message (Shift+Enter for newline)"
          className="flex-1 resize-none text-base" // Add text-base for 16px font
          rows={1}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}