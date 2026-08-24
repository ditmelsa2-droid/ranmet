'use client'

import { useState, use, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Users, Mic, MicOff, Volume2, 
  Send, Sparkles, MessageSquare, Radio, ShieldCheck, Heart, Smile
} from 'lucide-react'
import AppShell from '../../components/AppShell'

const SAMPLE_ROOM_DATA = {
  'minecraft-builders': {
    name: 'Thế Giới Minecraft & Builders ⛏️',
    desc: 'Cộng đồng chia sẻ công trình, server multiplayer và mẹo sinh tồn backrooms.',
    category: 'Gaming',
    members: 148,
    isVoice: true,
    host: 'Kaito_Gamer',
    speakers: [
      { id: 1, name: 'Kaito_Gamer', isSpeaking: true, role: 'Host' },
      { id: 2, name: 'LinhChi_Dev', isSpeaking: false, role: 'Speaker' },
      { id: 3, name: 'MinhQuan', isSpeaking: false, role: 'Member' },
    ],
    initialMessages: [
      { id: 1, user: 'Kaito_Gamer', text: 'Chào mừng anh em vào phòng Minecraft RanWorld! Ai đang chơi server mới không?', time: '16:20' },
      { id: 2, user: 'LinhChi_Dev', text: 'Mình vừa xây xong elevator redstone 3 tầng nè! 🚀', time: '16:21' },
      { id: 3, user: 'Alex', text: 'Chia sẻ tọa độ với bác ơi!', time: '16:22' },
    ]
  }
}

export default function RoomDetailPage({ params }) {
  const unwrappedParams = use(params)
  const roomId = unwrappedParams.roomId

  const room = SAMPLE_ROOM_DATA[roomId] || {
    name: `Phòng Cộng Đồng: ${roomId}`,
    desc: 'Không gian giao lưu, trò chuyện và kết nối cùng các thành viên RanMet.',
    category: 'Cộng đồng',
    members: 42,
    isVoice: true,
    host: 'RanMet Host',
    speakers: [
      { id: 1, name: 'Host_User', isSpeaking: true, role: 'Host' },
      { id: 2, name: 'Guest_99', isSpeaking: false, role: 'Speaker' },
    ],
    initialMessages: [
      { id: 1, user: 'Host_User', text: 'Chào mừng bạn đã tham gia phòng thảo luận! Hãy cùng trò chuyện nhé.', time: '16:20' }
    ]
  }

  const [messages, setMessages] = useState(room.initialMessages || [])
  const [draft, setDraft] = useState('')
  const [isMicOn, setIsMicOn] = useState(false)
  const [reactionMsg, setReactionMsg] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  function sendMessage(e) {
    e?.preventDefault()
    if (!draft.trim()) return

    const newMsg = {
      id: Date.now(),
      user: 'Bạn',
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, newMsg])
    setDraft('')
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
                {room.name}
              </h2>
              <div className="flex items-center g8 tiny muted">
                <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                  <Radio size={10} /> Live
                </span>
                <span>{room.category}</span> · 
                <span className="flex items-center g4"><Users size={12} /> {room.members} thành viên</span>
              </div>
            </div>
          </div>

          <Link href="/world" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
            Rời phòng
          </Link>
        </div>

        {/* VOICE STAGE (Live Speakers Grid) */}
        {room.isVoice && (
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
              {/* Me / Current user */}
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
                  B
                </div>
                <span className="tiny bold" style={{ color: '#fff' }}>Bạn</span>
                <span className="tiny faint" style={{ fontSize: 10 }}>{isMicOn ? 'Đang nói 🎙️' : 'Muted'}</span>
              </div>

              {/* Speakers list */}
              {room.speakers?.map((s) => (
                <div key={s.id} className="flex col items-center g6">
                  <div 
                    className="avatar" 
                    style={{ 
                      width: 52, 
                      height: 52, 
                      fontSize: 18, 
                      background: 'rgba(255,255,255,0.08)',
                      boxShadow: s.isSpeaking ? '0 0 16px #10b981' : 'none',
                      border: s.isSpeaking ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <span className="tiny bold" style={{ color: '#fff' }}>{s.name}</span>
                  <span className="tiny faint" style={{ fontSize: 10 }}>{s.role}</span>
                </div>
              ))}
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
            {messages.map((m) => {
              const isMe = m.user === 'Bạn'
              return (
                <div key={m.id} className={`flex g10 ${isMe ? 'justify-end' : ''}`}>
                  {!isMe && (
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: 'var(--brand-gradient)' }}>
                      {m.user.charAt(0)}
                    </div>
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    {!isMe && <div className="tiny bold" style={{ color: '#c084fc', marginBottom: 2 }}>{m.user}</div>}
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
                      {m.text}
                    </div>
                    <div className="tiny faint" style={{ fontSize: 10, marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              )
            })}
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
