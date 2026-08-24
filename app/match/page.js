'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, Compass, ArrowLeft, MessageCircle, 
  Heart, Zap, RefreshCw, AlertCircle, ShieldCheck, Globe, ArrowRight
} from 'lucide-react'
import { findMatchAction } from './actions'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

export default function MatchPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [stage, setStage] = useState('searching') // searching | error | reveal
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [tipIndex, setTipIndex] = useState(0)

  const SEARCHING_TIPS = [
    t('scanning1'),
    t('scanning2'),
    t('scanning3')
  ]

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SEARCHING_TIPS.length)
    }, 1200)
    return () => clearInterval(tipInterval)
  }, [SEARCHING_TIPS.length])

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
    <AppShell>
      <div className="flex col items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {/* Top Header */}
        <div className="flex items-center justify-between" style={{ width: '100%', marginBottom: 20 }}>
          <button 
            type="button" 
            className="btn-icon"
            onClick={() => router.push('/home')}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="tiny bold flex items-center g6" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Sparkles size={14} style={{ color: '#ec4899' }} /> {t('matchingTitle')}
          </div>
          <div style={{ width: 42 }} />
        </div>

        {/* SEARCHING STATE */}
        {stage === 'searching' && (
          <div className="flex col items-center center-text" style={{ padding: '30px 0', animation: 'msgPop 0.3s ease', width: '100%' }}>
            <div className="radar-wrap">
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-beam" />
              <div className="radar-core">
                <Compass size={38} style={{ color: '#ffffff' }} />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h2 className="rm-title" style={{ fontSize: 22, marginBottom: 8, color: '#f8fafc' }}>
                {t('matchingTitle')}
              </h2>
              <div className="small muted" style={{ minHeight: 24, transition: 'all 0.3s ease' }}>
                {SEARCHING_TIPS[tipIndex] || t('scanning1')}
              </div>
            </div>
          </div>
        )}

        {/* ERROR / NO MATCH STATE */}
        {stage === 'error' && (
          <div className="card flex col items-center center-text" style={{ padding: 32, animation: 'msgPop 0.3s ease', width: '100%' }}>
            <div 
              style={{ 
                width: 64, 
                height: 64, 
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

            <h2 className="rm-title" style={{ fontSize: 22, marginBottom: 8 }}>{t('noMatchTitle')}</h2>
            <p className="small muted" style={{ marginBottom: 24, lineHeight: 1.5, maxWidth: 440 }}>
              {t('noMatchDesc')}
            </p>

            <div className="flex g12" style={{ width: '100%', maxWidth: 360 }}>
              <button className="btn btn-primary grow" onClick={runMatch}>
                <RefreshCw size={16} /> {t('rescanBtn')}
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/home')}>
                {t('backHomeBtn')}
              </button>
            </div>
          </div>
        )}

        {/* REVEAL MATCH STATE */}
        {stage === 'reveal' && result && (
          <div className="flex col g20" style={{ animation: 'msgPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)', width: '100%' }}>
            {/* Candidate Card */}
            <div 
              className="card" 
              style={{ 
                padding: 28, 
                background: 'linear-gradient(135deg, rgba(28, 20, 48, 0.95) 0%, rgba(18, 14, 30, 0.98) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.45)',
                boxShadow: '0 20px 45px -12px rgba(236, 72, 153, 0.4)'
              }}
            >
              <div className="flex items-center g16" style={{ marginBottom: 22 }}>
                <div
                  className="avatar"
                  style={{
                    width: 70,
                    height: 70,
                    fontSize: 28,
                    background: 'var(--brand-gradient)',
                  }}
                >
                  {(result.candidate.name || 'N').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="rm-title" style={{ fontSize: 24, color: '#fff' }}>
                    {result.candidate.name || 'Người dùng bí ẩn'}
                  </div>
                  <div className="tiny muted flex items-center g6" style={{ marginTop: 4 }}>
                    <Globe size={14} style={{ color: '#06b6d4' }} /> {result.candidate.country || 'Global'}
                  </div>
                </div>
              </div>

              {/* Compatibility Score Big Display */}
              <div 
                className="flex items-center justify-between" 
                style={{ 
                  padding: '16px 20px', 
                  borderRadius: 18, 
                  background: 'rgba(255, 255, 255, 0.04)',
                  marginBottom: 20
                }}
              >
                <div>
                  <div className="tiny bold" style={{ color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('matchingTitle')}
                  </div>
                  <div className="small faint">AI Compatibility Match</div>
                </div>
                <div className="rm-num bold" style={{ fontSize: 42, background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  {result.compat.total}%
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="flex col g14">
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
              <MessageCircle size={20} /> {t('startChatBtn')} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
