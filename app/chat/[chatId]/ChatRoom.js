'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ChatRoom({ chatId, myId, otherName, compatibility, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const channel = supabase
      .channel('chat:' + chatId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  async function send() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    const { error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: myId, content: text })
    if (error) {
      // Put the text back so the user doesn't lose what they typed.
      setDraft(text)
    }
  }

  return (
    <div className="rm-shell" style={{ height: '100vh' }}>
      <div className="flex items-center g10" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
        <Link href="/home" style={{ fontSize: 20 }}>←</Link>
        <div className="grow">
          <div className="semi small">{otherName}</div>
          {compatibility != null && <div className="tiny faint">{compatibility}% hợp</div>}
        </div>
      </div>

      <div ref={scrollRef} className="grow" style={{ overflowY: 'auto', padding: '16px 20px' }}>
        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.sender_id === myId ? 'me' : ''}`}>
            <div className={`msg-bubble ${m.sender_id === myId ? 'me' : 'them'}`}>{m.content}</div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="tiny faint center-text" style={{ marginTop: 40 }}>Chưa có tin nhắn nào. Nói lời chào đầu tiên nhé!</div>
        )}
      </div>

      <div className="flex g10" style={{ padding: '12px 16px 20px', borderTop: '1px solid var(--border-soft)' }}>
        <input
          className="input"
          placeholder="Nhắn tin..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
        />
        <button className="btn btn-primary" style={{ width: 'auto', padding: '13px 20px' }} onClick={send}>Gửi</button>
      </div>
    </div>
  )
}
