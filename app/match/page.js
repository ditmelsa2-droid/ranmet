'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Compass, ArrowLeft, MessageCircle, 
  Zap, RefreshCw, AlertCircle, ShieldCheck, Globe, ArrowRight
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
    }, 1400)
    return () => clearInterval(tipInterval)
  }, [SEARCHING_TIPS.length])

  function runMatch() {
    setStage('searching')
    setError(null)
    setResult(null)

    const minDelay = new Promise((resolve) => setTimeout(resolve, 2400))

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
      <div className="flex col items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)', maxWidth: 580, margin: '0 auto', width: '100%' }}>
        {/* Top Navigation */}
        <div className="flex items-center justify-between" style={{ width: '100%', marginBottom: 24 }}>
          <button 
            type="button" 
            className="btn-icon"
            onClick={() => router.push('/home')}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="tiny bold flex items-center g6 gold" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Zap size={13} /> {t('matchingTitle')}
          </div>
          <div style={{ width: 38 }} />
        </div>

        {/* SEARCHING STATE */}
        {stage === 'searching' && (
          <div className="flex col items-center center-text" style={{ padding: '24px 0', animation: 'msgPop 0.3s ease', width: '100%' }}>
            <div className="radar-wrap">
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-core">
                <Compass size={36} />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h2 className="rm-title" style={{ fontSize: 20, marginBottom: 8 }}>
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
                width: 56, 
                height: 56, 
                borderRadius: '50%', 
                background: 'rgba(244, 63, 94, 0.1)', 
                border: '1px solid rgba(244, 63, 94, 0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <AlertCircle size={28} style={{ color: '#f43f5e' }} />
            </div>

            <h2 className="rm-title" style={{ fontSize: 20, marginBottom: 8 }}>{t('noMatchTitle')}</h2>
            <p className="small muted" style={{ marginBottom: 24, lineHeight: 1.6, maxWidth: 420 }}>
              {t('noMatchDesc')}
            </p>

            <div className="flex g12" style={{ width: '100%', maxWidth: 340 }}>
              <button className="btn btn-primary grow" onClick={runMatch}>
                <RefreshCw size={15} /> {t('rescanBtn')}
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/home')}>
                {t('backHomeBtn')}
              </button>
            </div>
          </div>
        )}

        {/* REVEAL MATCH STATE */}
        {stage === 'reveal' && result && (
          <div className="flex col g16" style={{ animation: 'msgPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)', width: '100%' }}>
            {/* Candidate Card */}
            <div 
              className="card" 
              style={{ 
                padding: 24, 
                border: '1px solid var(--gold-hairline-strong)',
                background: 'var(--raised-lacquer)'
              }}
            >
              <div className="flex items-center g14" style={{ marginBottom: 20 }}>
                <div
                  className="avatar"
                  style={{
                    width: 64,
                    height: 64,
                    fontSize: 24,
                  }}
                >
                  {(result.candidate.name || 'N').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="rm-title" style={{ fontSize: 22 }}>
                    {result.candidate.name || 'Người dùng bí ẩn'}
                  </div>
                  <div className="tiny faint flex items-center g6" style={{ marginTop: 4 }}>
                    <Globe size={13} style={{ color: 'var(--verdigris-patina)' }} /> {result.candidate.country || 'Global'}
                  </div>
                </div>
              </div>

              {/* Compatibility Score Big Display */}
              <div 
                className="flex items-center justify-between" 
                style={{ 
                  padding: '14px 18px', 
                  borderRadius: 12, 
                  background: 'var(--lacquer-deep)',
                  border: '1px solid var(--gold-hairline)',
                  marginBottom: 18
                }}
              >
                <div>
                  <div className="tiny bold gold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AI COMPATIBILITY
                  </div>
                  <div className="tiny faint">Độ tương thích sở thích & phong cách</div>
                </div>
                <div className="rm-num bold gold" style={{ fontSize: 36, lineHeight: 1 }}>
                  {result.compat.total}%
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="flex col g12">
                {result.compat.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between items-center tiny" style={{ marginBottom: 5 }}>
                      <span className="muted">{b.label} ({b.pct}%)</span>
                      <span className="bold rm-num champagne">{b.score}%</span>
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
              style={{ padding: '15px 24px', fontSize: 15 }}
              onClick={() => router.push('/chat/' + result.chatId)}
            >
              <MessageCircle size={18} /> {t('startChatBtn')} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
