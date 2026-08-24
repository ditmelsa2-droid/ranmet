'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Send, Sparkles, ShieldCheck, 
  Smile, MoreVertical, MessageCircle, Heart, Flame
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ICE_BREAKERS = [
  'Chào bạn! Rất vui được ghép đôi với bạn ✨',
  'Bạn có sở thích nào đang mê nhất hiện tại?',
  'Gu âm nhạc hoặc bộ phim gần đây bạn thích là gì? 🎵'
]

export default function ChatRoom({ chatId, myId, otherName, compatibility, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
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
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  async function sendText(textToSend) {
    const text = (textToSend || draft).trim()
    if (!text || isSending) return

    setDraft('')
    setIsSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: myId, content: text })

    setIsSending(false)

    if (error) {
      setDraft(text)
    }
  }

  const initial = (otherName || 'N').charAt(0).toUpperCase()

  return (
    <div className="rm-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sleek Top Chat Header */}
      <div 
        className="flex items-center justify-between" 
        style={{ 
          padding: '14px 18px', 
          background: 'rgba(18, 14, 28, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        <div className="flex items-center g12">
          <Link href="/home" className="btn-icon" style={{ width: 38, height: 38 }}>
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center g10">
            <div style={{ position: 'relative' }}>
              <div
                className="avatar"
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 16,
                  background: 'var(--brand-gradient)',
                }}
              >
                {initial}
              </div>
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  width: 11, 
                  height: 11, 
                  borderRadius: '50%', 
                  background: '#10b981', 
                  border: '2px solid #161320' 
                }} 
              />
            </div>

            <div>
              <div className="semi small flex items-center g6">
                <span>{otherName || 'Người bạn mới'}</span>
              </div>
              {compatibility != null && (
                <div className="tiny bold flex items-center g4" style={{ color: '#ec4899' }}>
                  <Sparkles size={11} /> {compatibility}% tương thích
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center g6">
          <span className="badge badge-glow tiny" style={{ padding: '3px 8px' }}>
            <ShieldCheck size={11} /> Realtime
          </span>
        </div>
      </div>

      {/* Message History Feed */}
      <div 
        ref={scrollRef} 
        className="grow" 
        style={{ 
          overflowY: 'auto', 
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        {messages.length === 0 && (
          <div className="flex col items-center center-text" style={{ margin: 'auto 0', padding: '30px 16px' }}>
            <div 
              style={{ 
                width: 58, 
                height: 58, 
                borderRadius: '50%', 
                background: 'rgba(236, 72, 153, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <MessageCircle size={28} style={{ color: '#ec4899' }} />
            </div>

            <div className="bold" style={{ fontSize: 17, marginBottom: 4 }}>
              Hãy bắt đầu cuộc trò chuyện!
            </div>
            <div className="tiny faint" style={{ marginBottom: 20, maxWidth: 280 }}>
              Hai bạn đã được kết nối với nhau nhờ độ tương thích cao. Hãy gửi lời chào mở đầu:
            </div>

            <div className="flex col g8" style={{ width: '100%', maxWidth: 360 }}>
              {ICE_BREAKERS.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendText(text)}
                  className="card card-interactive"
                  style={{
                    padding: '10px 14px',
                    fontSize: 13,
                    textAlign: 'left',
                    color: 'var(--text-dim)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 14,
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  💬 {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.sender_id === myId
          const time = new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={m.id} className={`msg-row ${isMe ? 'me' : ''}`}>
              <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                <div>{m.content}</div>
                <div 
                  className="tiny" 
                  style={{ 
                    fontSize: 10, 
                    opacity: 0.65, 
                    textAlign: 'right', 
                    marginTop: 4,
                    fontWeight: 500
                  }}
                >
                  {time}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sleek Bottom Input Bar */}
      <div 
        style={{ 
          padding: '12px 16px 20px', 
          background: 'rgba(18, 14, 28, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="flex items-center g10">
          <input
            className="input"
            style={{ 
              borderRadius: 999, 
              padding: '13px 20px',
              fontSize: 14.5,
              background: 'rgba(255, 255, 255, 0.05)'
            }}
            placeholder="Nhập tin nhắn..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendText()
              } 
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              padding: 0, 
              flexShrink: 0 
            }}
            onClick={() => sendText()}
            disabled={!draft.trim() || isSending}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
