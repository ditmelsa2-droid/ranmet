'use client'

import { useState, use, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Users, Mic, MicOff, Volume2, 
  Send, Sparkles, MessageSquare, Radio, ShieldCheck, Heart, Smile
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../../components/AppShell'

export default function RoomDetailPage({ params }) {
  const unwrappedParams = use(params)
  const roomId = unwrappedParams.roomId

  const [supabase] = useState(() => createClient())
  const [roomInfo, setRoomInfo] = useState({
    name: 'Phòng Thảo Luận RanWorld',
    description: 'Không gian giao lưu cộng đồng',
    category: 'Cộng đồng',
    is_voice: true,
    host_name: 'Host'
  })
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isMicOn, setIsMicOn] = useState(false)
  const [reactionMsg, setReactionMsg] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('Bạn')
  const scrollRef = useRef(null)

  useEffect(() => {
    async function loadRoomAndMessages() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        if (profile?.display_name) setCurrentUserName(profile.display_name)
      }

      // Fetch room metadata
      const { data: room } = await supabase.from('world_rooms').select('*').eq('id', roomId).single()
      if (room) {
        setRoomInfo(room)
      } else {
        setRoomInfo({
          name: roomId === 'minecraft-builders' ? 'Thế Giới Minecraft & Builders ⛏️' : `Phòng: ${roomId}`,
          category: 'Cộng đồng',
          is_voice: true,
          host_name: 'RanMet'
        })
      }

      // Fetch existing room messages
      const { data: msgs } = await supabase
        .from('world_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (msgs && msgs.length > 0) {
        setMessages(msgs)
      }
    }

    loadRoomAndMessages()

    // Realtime channel for this specific room
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'world_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e?.preventDefault()
    if (!draft.trim() || !currentUserId) return

    const text = draft.trim()
    setDraft('')

    const newMsg = {
      room_id: roomId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content: text
    }

    const { error } = await supabase.from('world_messages').insert(newMsg)
    if (error) {
      console.error('Error inserting message:', error)
      // optimistic
      setMessages((prev) => [...prev, { id: Date.now(), ...newMsg, created_at: new Date().toISOString() }])
    }
  }

  function triggerReaction(emoji) {
    setReactionMsg(emoji)
    setTimeout(() => setReactionMsg(''), 1800)
  }

  return (
    <AppShell>
      <div className="flex col g20" style={{ height: 'calc(100vh - 80px)', minHeight: 600 }}>
        {/* ROOM TOP HEADER */}
        <div 
          className="card flex items-center justify-between" 
          style={{ 
            padding: '16px 20px', 
            background: 'rgba(20, 16, 32, 0.9)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
          }}
        >
          <div className="flex items-center g14">
            <Link href="/world" className="btn-icon" style={{ width: 38, height: 38 }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h2 className="rm-title" style={{ fontSize: 19, color: '#fff' }}>
                {roomInfo.name}
              </h2>
              <div className="flex items-center g8 tiny muted">
                <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                  <Radio size={10} /> Live
                </span>
                <span>{roomInfo.category}</span> · 
                <span className="flex items-center g4"><Users size={12} /> Host: {roomInfo.host_name}</span>
              </div>
            </div>
          </div>

          <Link href="/world" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
            Rời phòng
          </Link>
        </div>

        {/* VOICE STAGE */}
        {roomInfo.is_voice && (
          <div 
            className="card" 
            style={{ 
              padding: 20, 
              background: 'linear-gradient(135deg, rgba(26, 20, 48, 0.8) 0%, rgba(16, 12, 28, 0.9) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)' 
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <span className="tiny bold flex items-center g6" style={{ color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Volume2 size={14} /> Sân Khấu Voice Trực Tiếp
              </span>
              <button
                type="button"
                className={`btn ${isMicOn ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 999 }}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <><Mic size={14} /> Mic đang bật</> : <><MicOff size={14} /> Bật Micro</>}
              </button>
            </div>

            <div className="flex g16" style={{ flexWrap: 'wrap' }}>
              <div className="flex col items-center g6">
                <div 
                  className="avatar" 
                  style={{ 
                    width: 52, 
                    height: 52, 
                    fontSize: 18, 
                    background: 'var(--brand-gradient)',
                    boxShadow: isMicOn ? '0 0 20px #ec4899' : 'none',
                    border: isMicOn ? '2px solid #ec4899' : '2px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <span className="tiny bold" style={{ color: '#fff' }}>{currentUserName}</span>
                <span className="tiny faint" style={{ fontSize: 10 }}>{isMicOn ? 'Đang nói 🎙️' : 'Muted'}</span>
              </div>
            </div>
          </div>
        )}

        {/* LIVE CHAT FEED */}
        <div 
          className="card grow flex col justify-between" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            background: 'rgba(14, 10, 24, 0.85)'
          }}
        >
          {/* Messages list */}
          <div 
            ref={scrollRef} 
            className="grow" 
            style={{ 
              overflowY: 'auto', 
              padding: '16px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 12 
            }}
          >
            {messages.length === 0 ? (
              <div className="tiny faint center-text" style={{ padding: 30 }}>
                Chào mừng bạn vào phòng! Hãy gửi tin nhắn đầu tiên để cùng thảo luận nhé ✨
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_id === currentUserId
                const time = new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={m.id} className={`flex g10 ${isMe ? 'justify-end' : ''}`}>
                    {!isMe && (
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: 'var(--brand-gradient)' }}>
                        {(m.sender_name || 'U').charAt(0)}
                      </div>
                    )}
                    <div style={{ maxWidth: '75%' }}>
                      {!isMe && <div className="tiny bold" style={{ color: '#c084fc', marginBottom: 2 }}>{m.sender_name}</div>}
                      <div 
                        style={{ 
                          padding: '10px 14px', 
                          borderRadius: 16, 
                          background: isMe ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          fontSize: 14,
                          lineHeight: 1.4
                        }}
                      >
                        {m.content}
                      </div>
                      <div className="tiny faint" style={{ fontSize: 10, marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                        {time}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Emoji Reactions */}
          <div className="flex g8 items-center" style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)' }}>
            <span className="tiny faint">Cảm xúc nhanh:</span>
            {['🔥', '✨', '❤️', '👏', '😂', '⛏️'].map((emoji) => (
              <button 
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '2px 4px' }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Message Input Dock */}
          <form onSubmit={sendMessage} className="flex g10 items-center" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <input
              className="input"
              style={{ padding: '12px 18px', borderRadius: 999 }}
              placeholder="Nhập tin nhắn vào phòng..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* FLOATING REACTION BURST */}
        {reactionMsg && (
          <div 
            style={{
              position: 'fixed',
              bottom: 120,
              right: 60,
              fontSize: 48,
              zIndex: 1000,
              animation: 'msgPop 0.3s ease, coreGlow 1s ease infinite'
            }}
          >
            {reactionMsg}
          </div>
        )}
      </div>
    </AppShell>
  )
}
