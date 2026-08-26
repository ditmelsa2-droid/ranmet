'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Radar, Sparkles, Heart, RefreshCw, MessageSquare, 
  MapPin, Shield, Zap, Sliders, CheckCircle, ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

const MOCK_RADAR_USERS = [
  {
    id: 'u-1',
    name: 'Aoi Sakura',
    age: 22,
    location: 'Tokyo, Japan',
    bio: 'Anime enthusiast, piano player & lo-fi beat maker. Looking for global friends!',
    avatar: 'A',
    compatibility: 96,
    distance: '1.2 km',
    interests: ['Anime', 'Music', 'Gaming', 'Lo-Fi'],
    icebreaker: 'Này! Mình thấy cậu cũng mê anime và sáng tác nhạc lo-fi, bài hát yêu thích gần đây của cậu là gì thế?'
  },
  {
    id: 'u-2',
    name: 'Lucas Silva',
    age: 24,
    location: 'São Paulo, Brazil',
    bio: 'Fullstack dev & indie game designer. Coffee addict and cyberpunk aesthetics.',
    avatar: 'L',
    compatibility: 91,
    distance: '3.8 km',
    interests: ['Coding', 'Indie Games', 'Cyberpunk', 'Coffee'],
    icebreaker: 'Chào Lucas! Bạn đang phát triển game bằng engine nào vậy, Unity hay Unreal?'
  },
  {
    id: 'u-3',
    name: 'Minh Trí',
    age: 21,
    location: 'Hà Nội, Việt Nam',
    bio: 'Nhiếp ảnh đường phố, thiết kế đồ họa & du lịch khám phá văn hóa các nước.',
    avatar: 'M',
    compatibility: 88,
    distance: '500 m',
    interests: ['Photography', 'Travel', 'Art', 'Design'],
    icebreaker: 'Chào Trí! Bộ ảnh chụp gần đây nhất của bạn là ở đâu vậy?'
  }
]

export default function MatchRadarPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  
  const [activeRadarTab, setActiveRadarTab] = useState('radar')
  const [isScanning, setIsScanning] = useState(true)
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)
  const [interestFilter, setInterestFilter] = useState('All')
  const [compatibilityThreshold, setCompatibilityThreshold] = useState(85)
  const [icebreaker, setIcebreaker] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const activeUser = MOCK_RADAR_USERS[activeMatchIndex] || MOCK_RADAR_USERS[0]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false)
      setIcebreaker(activeUser.icebreaker)
    }, 1800)
    return () => clearTimeout(timer)
  }, [activeMatchIndex])

  function handleRescan() {
    setIsScanning(true)
    const nextIdx = (activeMatchIndex + 1) % MOCK_RADAR_USERS.length
    setTimeout(() => {
      setActiveMatchIndex(nextIdx)
      setIsScanning(false)
      setIcebreaker(MOCK_RADAR_USERS[nextIdx].icebreaker)
    }, 1600)
  }

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  async function handleStartChat() {
    setIsConnecting(true)
    showToast('AI đang thiết lập phòng chat mã hóa an toàn...')
    setTimeout(() => {
      router.push(`/chat/c-${activeUser.id}`)
    }, 1000)
  }

  return (
    <AppShell>
      {/* HEADER */}
      <div className="flex justify-between items-center" style={{ maxWidth: 1040, margin: '0 auto 20px' }}>
        <div className="flex items-center g10">
          <Radar size={22} style={{ color: 'var(--kinpaku-gold)' }} />
          <div>
            <h1 className="rm-title" style={{ fontSize: 21, margin: 0 }}>Radar Ghép Đôi AI</h1>
            <div className="tiny faint">Thuật toán đối sánh ngữ nghĩa và tần số sở thích thời gian thực</div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary flex items-center g6"
          onClick={handleRescan}
          disabled={isScanning}
          style={{ width: 'auto', padding: '7px 16px', fontSize: 12.5 }}
        >
          <RefreshCw size={14} className={isScanning ? 'spin' : ''} /> Quét lại Radar
        </button>
      </div>

      {/* RADAR SUB-TABS */}
      <div className="subtab-bar" style={{ maxWidth: 1040, margin: '0 auto 20px' }}>
        <button 
          type="button" 
          className={`subtab-btn ${activeRadarTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveRadarTab('radar')}
        >
          <Radar size={14} /> Radar Quét Trực Tiếp
        </button>
        <button 
          type="button" 
          className={`subtab-btn ${activeRadarTab === 'top_matches' ? 'active' : ''}`}
          onClick={() => setActiveRadarTab('top_matches')}
        >
          <Sparkles size={14} /> Top Phù Hợp (90%+)
        </button>
        <button 
          type="button" 
          className={`subtab-btn ${activeRadarTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveRadarTab('requests')}
        >
          <Heart size={14} /> Yêu Cầu Kết Nối (2)
        </button>
      </div>

      {/* VIEW 1: RADAR HUD */}
      {activeRadarTab === 'radar' && (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 420px',
            gap: 24,
            maxWidth: 1040,
            margin: '0 auto'
          }}
        >
          {/* LEFT: INTERACTIVE CIRCULAR RADAR HUD */}
          <div 
            className="card flex col items-center justify-center" 
            style={{ 
              minHeight: 460, 
              background: 'var(--lacquer-deep)', 
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--gold-hairline-strong)'
            }}
          >
            {/* Concentric Radar Rings */}
            <div 
              style={{
                position: 'relative',
                width: 320,
                height: 320,
                borderRadius: '50%',
                border: '1px solid rgba(245, 192, 66, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Middle ring */}
              <div 
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  border: '1px dashed rgba(245, 192, 66, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Inner ring */}
                <div 
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '1px solid rgba(245, 192, 66, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Center user blip */}
                  <div 
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: 'var(--dark-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      boxShadow: '0 0 20px rgba(245, 192, 66, 0.4)',
                      zIndex: 2
                    }}
                  >
                    YOU
                  </div>
                </div>
              </div>

              {/* Rotating Sweep Line */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245, 192, 66, 0.25) 60deg, transparent 60deg)',
                  animation: 'radarSweep 4s linear infinite',
                  pointerEvents: 'none'
                }} 
              />

              {/* Surrounding Blips */}
              {MOCK_RADAR_USERS.map((user, idx) => {
                const isTarget = idx === activeMatchIndex
                const angles = [45, 160, 290]
                const angle = angles[idx]
                const rad = (angle * Math.PI) / 180
                const radius = idx === 0 ? 110 : idx === 1 ? 135 : 120
                const x = Math.cos(rad) * radius
                const y = Math.sin(rad) * radius

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setActiveMatchIndex(idx)
                      setIcebreaker(user.icebreaker)
                    }}
                    style={{
                      position: 'absolute',
                      transform: `translate(${x}px, ${y}px)`,
                      width: isTarget ? 46 : 36,
                      height: isTarget ? 46 : 36,
                      borderRadius: '50%',
                      background: isTarget ? 'var(--lacquer-deep)' : 'rgba(255, 255, 255, 0.08)',
                      border: isTarget ? '2px solid var(--kinpaku-gold)' : '1px solid var(--gold-hairline)',
                      color: isTarget ? 'var(--kinpaku-gold)' : 'var(--text-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isTarget ? 15 : 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: isTarget ? '0 0 16px rgba(245, 192, 66, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                      zIndex: 3
                    }}
                  >
                    {user.avatar}
                  </button>
                )
              })}
            </div>

            {/* Radar status footer */}
            <div className="flex items-center g8 tiny faint" style={{ marginTop: 24, zIndex: 2 }}>
              <span className="telemetry-dot" />
              <span>Đang quét mục tiêu trong bán kính 5 km · 3 người dùng trực tuyến</span>
            </div>
          </div>

          {/* RIGHT: TARGET MATCH PROFILE HUD */}
          <div className="card flex col justify-between" style={{ padding: 24 }}>
            <div>
              {/* Profile Header */}
              <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
                <div className="flex items-center g12">
                  <div 
                    className="avatar" 
                    style={{ 
                      width: 52, 
                      height: 52, 
                      fontSize: 20,
                      border: '1.5px solid var(--gold-hairline-strong)' 
                    }}
                  >
                    {activeUser.avatar}
                  </div>
                  <div>
                    <div className="flex items-center g6">
                      <span className="semi champagne" style={{ fontSize: 17 }}>{activeUser.name}</span>
                      <span className="tiny faint rm-num">, {activeUser.age}</span>
                    </div>
                    <div className="tiny faint flex items-center g4" style={{ marginTop: 2 }}>
                      <MapPin size={11} style={{ color: 'var(--emerald-patina)' }} /> {activeUser.location} · {activeUser.distance}
                    </div>
                  </div>
                </div>

                {/* Compatibility Badge */}
                <div 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 8, 
                    background: 'rgba(245, 192, 66, 0.12)', 
                    border: '1px solid var(--gold-hairline-strong)',
                    textAlign: 'right'
                  }}
                >
                  <div className="tiny gold bold">TƯƠNG THÍCH</div>
                  <div className="rm-num bold gold" style={{ fontSize: 18, lineHeight: 1.1 }}>
                    {activeUser.compatibility}%
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 16 }}>
                {activeUser.bio}
              </p>

              {/* Interests Tags */}
              <div style={{ marginBottom: 18 }}>
                <div className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Sở Thích Phù Hợp
                </div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {activeUser.interests.map((tag, idx) => (
                    <span key={idx} className="chip selected" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Icebreaker Card */}
              <div 
                style={{ 
                  background: 'var(--lacquer-deep)', 
                  padding: '12px 14px', 
                  borderRadius: 8, 
                  border: '1px solid var(--gold-hairline)',
                  marginBottom: 20
                }}
              >
                <div className="flex items-center g6" style={{ marginBottom: 4 }}>
                  <Sparkles size={13} style={{ color: 'var(--kinpaku-gold)' }} />
                  <span className="tiny bold gold">Gợi ý mở lời AI (1-Tap Icebreaker)</span>
                </div>
                <p className="tiny champagne" style={{ fontStyle: 'italic', lineHeight: 1.45 }}>
                  &ldquo;{icebreaker || activeUser.icebreaker}&rdquo;
                </p>
              </div>
            </div>

            {/* Connect Action Button */}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}
              onClick={handleStartChat}
              disabled={isConnecting}
            >
              <MessageSquare size={16} /> Bắt đầu trò chuyện ngay
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TOP MATCHES */}
      {activeRadarTab === 'top_matches' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18, maxWidth: 1040, margin: '0 auto' }}>
          {MOCK_RADAR_USERS.map((u) => (
            <div key={u.id} className="card card-interactive flex col justify-between" style={{ padding: 20 }}>
              <div>
                <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                  <div className="flex items-center g10">
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{u.avatar}</div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 16 }}>{u.name}, {u.age}</div>
                      <div className="tiny faint">{u.location}</div>
                    </div>
                  </div>
                  <span className="badge badge-gold tiny bold rm-num">{u.compatibility}% HỢP</span>
                </div>
                <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 14 }}>{u.bio}</p>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                  {u.interests.map((it, i) => (
                    <span key={i} className="tiny" style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--lacquer-deep)', border: '1px solid var(--gold-hairline)' }}>
                      #{it}
                    </span>
                  ))}
                </div>
              </div>

              <Link href={`/chat/c-${u.id}`} className="btn btn-primary" style={{ width: '100%', padding: '8px 14px', fontSize: 13 }}>
                <MessageSquare size={14} /> Gửi tin nhắn
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: REQUESTS */}
      {activeRadarTab === 'requests' && (
        <div className="card" style={{ maxWidth: 1040, margin: '0 auto', padding: 24 }}>
          <h3 className="rm-title" style={{ fontSize: 18, marginBottom: 14 }}>Yêu Cầu Kết Nối Đang Chờ</h3>
          <div className="flex col g10">
            <div className="flex justify-between items-center" style={{ padding: 14, background: 'var(--lacquer-deep)', borderRadius: 10, border: '1px solid var(--gold-hairline)' }}>
              <div className="flex items-center g12">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>S</div>
                <div>
                  <div className="semi champagne">Sakura Chan · 20 tuổi</div>
                  <div className="tiny faint">&ldquo;Chào bạn! Mình thấy bạn có cùng sở thích Anime Lo-Fi!&rdquo;</div>
                </div>
              </div>
              <div className="flex items-center g8">
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Từ chối</button>
                <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 12 }}>Đồng ý</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div 
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--gold-hairline-strong)',
            padding: '9px 18px',
            borderRadius: 8,
            color: 'var(--champagne)',
            fontSize: 13,
            fontWeight: 600,
            zIndex: 1000,
            animation: 'msgPop 0.25s ease'
          }}
        >
          {toastMsg}
        </div>
      )}
    </AppShell>
  )
}
