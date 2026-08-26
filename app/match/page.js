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

      {/* 2-COLUMN RADAR CONSOLE */}
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

            {/* Rotating Radar Sweep Beam */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 160,
                height: 160,
                background: 'conic-gradient(from 0deg, rgba(245, 192, 66, 0.35) 0deg, transparent 60deg)',
                transformOrigin: '0 0',
                borderRadius: '100% 0 0 0',
                animation: 'radarSweep 3s linear infinite',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* Found User Blip 1 */}
            <div 
              style={{
                position: 'absolute',
                top: 50,
                right: 60,
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--raised-lacquer)',
                border: '1.5px solid var(--kinpaku-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--kinpaku-gold)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                animation: 'radarPulse 2s ease infinite',
                boxShadow: '0 0 14px rgba(245, 192, 66, 0.3)',
                zIndex: 3
              }}
              onClick={() => setActiveMatchIndex(0)}
            >
              A
            </div>

            {/* Found User Blip 2 */}
            <div 
              style={{
                position: 'absolute',
                bottom: 60,
                left: 50,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--raised-lacquer)',
                border: '1px solid var(--gold-hairline-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--champagne)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                zIndex: 3
              }}
              onClick={() => setActiveMatchIndex(1)}
            >
              L
            </div>

            {/* Found User Blip 3 */}
            <div 
              style={{
                position: 'absolute',
                top: 80,
                left: 70,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--raised-lacquer)',
                border: '1px solid var(--gold-hairline-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--champagne)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                zIndex: 3
              }}
              onClick={() => setActiveMatchIndex(2)}
            >
              M
            </div>
          </div>

          {/* Status readout */}
          <div className="flex items-center g8" style={{ marginTop: 24, zIndex: 2 }}>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>
              {isScanning ? 'Đang dò sóng tương thích...' : 'Đã khóa 3 mục tiêu phù hợp'}
            </span>
            <span className="tiny faint rm-num">Bán kính quét: 15 km</span>
          </div>
        </div>

        {/* RIGHT: MATCH PROFILE SHOWCASE */}
        <div className="card flex col justify-between" style={{ padding: 22 }}>
          <div>
            {/* Target Header */}
            <div className="flex justify-between items-start" style={{ marginBottom: 14 }}>
              <div className="flex items-center g12">
                <div 
                  className="avatar" 
                  style={{ 
                    width: 52, 
                    height: 52, 
                    fontSize: 20, 
                    border: '1.5px solid var(--gold-hairline-strong)',
                    background: 'var(--lacquer-deep)'
                  }}
                >
                  {activeUser.avatar}
                </div>
                <div>
                  <div className="semi champagne" style={{ fontSize: 17 }}>
                    {activeUser.name}, <span className="rm-num">{activeUser.age}</span>
                  </div>
                  <div className="tiny faint flex items-center g4">
                    <MapPin size={11} style={{ color: 'var(--kinpaku-gold)' }} /> {activeUser.location} · {activeUser.distance}
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="flex col items-end">
                <div className="rm-title gold rm-num" style={{ fontSize: 22 }}>
                  {activeUser.compatibility}%
                </div>
                <div className="tiny faint">Tương thích AI</div>
              </div>
            </div>

            {/* Compatibility Progress Bar */}
            <div className="compat-bar-track" style={{ height: 6, marginBottom: 16 }}>
              <div 
                className="compat-bar-fill" 
                style={{ transform: `scaleX(${activeUser.compatibility / 100})` }} 
              />
            </div>

            {/* Bio */}
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 14 }}>
              {activeUser.bio}
            </p>

            {/* Shared Interests */}
            <div style={{ marginBottom: 16 }}>
              <div className="tiny bold faint" style={{ letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                Sở thích tương đồng
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
