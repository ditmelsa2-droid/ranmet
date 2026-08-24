'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, Compass, ArrowLeft, MessageCircle, 
  Heart, Zap, RefreshCw, AlertCircle, ShieldCheck, Globe
} from 'lucide-react'
import { findMatchAction } from './actions'

const SEARCHING_TIPS = [
  'Đang quét tần số kết nối...',
  'Phân tích sở thích tương đồng...',
  'Kiểm tra múi giờ và ngôn ngữ phù hợp...',
  'Tính toán chỉ số tương thích bằng AI...'
]

export default function MatchPage() {
  const router = useRouter()
  const [stage, setStage] = useState('searching') // searching | error | reveal
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SEARCHING_TIPS.length)
    }, 1200)
    return () => clearInterval(tipInterval)
  }, [])

  function runMatch() {
    setStage('searching')
    setError(null)
    setResult(null)

    const minDelay = new Promise((resolve) => setTimeout(resolve, 2500))

    Promise.all([findMatchAction(), minDelay]).then(([res]) => {
      if (res.error) {
        setError(res.error)
        setStage('error')
      } else {
        setResult(res)
        setStage('reveal')
      }
    })
  }

  useEffect(() => {
    runMatch()
  }, [])

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between" style={{ minHeight: '100vh', paddingBottom: 32 }}>
        {/* Top Header */}
        <div className="flex items-center justify-between" style={{ paddingTop: 8 }}>
          <button 
            type="button" 
            className="btn-icon"
            onClick={() => router.push('/home')}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="tiny bold flex items-center g6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Sparkles size={14} style={{ color: '#ec4899' }} /> AI Matching Radar
          </div>
          <div style={{ width: 44 }} />
        </div>

        {/* SEARCHING STATE */}
        {stage === 'searching' && (
          <div className="flex col items-center center-text" style={{ padding: '40px 0', animation: 'msgPop 0.3s ease' }}>
            <div className="radar-wrap">
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-core">
                <Compass size={38} style={{ color: '#ffffff' }} />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="bold" style={{ fontSize: 19, marginBottom: 8, color: '#f8fafc' }}>
                Đang tìm người phù hợp
              </div>
              <div className="small muted" style={{ minHeight: 24, transition: 'all 0.3s ease' }}>
                {SEARCHING_TIPS[tipIndex]}
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {stage === 'error' && (
          <div className="card flex col items-center center-text" style={{ padding: 28, animation: 'msgPop 0.3s ease', margin: 'auto 0' }}>
            <div 
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                background: 'rgba(244, 63, 94, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <AlertCircle size={32} style={{ color: '#f43f5e' }} />
            </div>

            <h2 className="rm-title" style={{ fontSize: 20, marginBottom: 8 }}>Chưa tìm thấy người phù hợp</h2>
            <p className="small muted" style={{ marginBottom: 24, lineHeight: 1.45 }}>
              {error || 'Cần có ít nhất 2 tài khoản đã hoàn tất Onboarding trên hệ thống để ghép đôi.'}
            </p>

            <div className="flex col g10" style={{ width: '100%' }}>
              <button className="btn btn-primary" onClick={runMatch}>
                <RefreshCw size={16} /> Thử tìm lại
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/home')}>
                Quay về trang chủ
              </button>
            </div>
          </div>
        )}

        {/* REVEAL MATCH STATE */}
        {stage === 'reveal' && result && (
          <div className="flex col g20" style={{ animation: 'msgPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)', margin: 'auto 0' }}>
            {/* Candidate Card */}
            <div 
              className="card" 
              style={{ 
                padding: 24, 
                background: 'linear-gradient(135deg, rgba(28, 20, 48, 0.95) 0%, rgba(18, 14, 30, 0.98) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                boxShadow: '0 20px 45px -12px rgba(236, 72, 153, 0.35)'
              }}
            >
              <div className="flex items-center g16" style={{ marginBottom: 20 }}>
                <div
                  className="avatar"
                  style={{
                    width: 64,
                    height: 64,
                    fontSize: 26,
                    background: 'var(--brand-gradient)',
                  }}
                >
                  {(result.candidate.name || 'N').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="rm-title" style={{ fontSize: 22, color: '#fff' }}>
                    {result.candidate.name || 'Người dùng bí ẩn'}
                  </div>
                  <div className="tiny muted flex items-center g6" style={{ marginTop: 2 }}>
                    <Globe size={13} style={{ color: '#06b6d4' }} /> {result.candidate.country || 'Toàn cầu'}
                  </div>
                </div>
              </div>

              {/* Compatibility Score Big Display */}
              <div 
                className="flex items-center justify-between" 
                style={{ 
                  padding: '14px 18px', 
                  borderRadius: 16, 
                  background: 'rgba(255, 255, 255, 0.04)',
                  marginBottom: 18
                }}
              >
                <div>
                  <div className="tiny bold" style={{ color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Độ tương thích AI
                  </div>
                  <div className="small faint">Dựa trên phân tích đa chiều</div>
                </div>
                <div className="rm-num bold" style={{ fontSize: 36, background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  {result.compat.total}%
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="flex col g12">
                {result.compat.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between items-center tiny" style={{ marginBottom: 6 }}>
                      <span className="muted">{b.label} ({b.pct}%)</span>
                      <span className="bold rm-num" style={{ color: '#fff' }}>{b.score}%</span>
                    </div>
                    <div className="compat-bar-track">
                      <div className="compat-bar-fill" style={{ width: `${b.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Chat Button */}
            <button
              className="btn btn-primary"
              style={{ padding: '16px 24px', fontSize: 16 }}
              onClick={() => router.push('/chat/' + result.chatId)}
            >
              <MessageCircle size={20} /> Bắt đầu trò chuyện ngay
            </button>
          </div>
        )}

        <div />
      </div>
    </div>
  )
}
