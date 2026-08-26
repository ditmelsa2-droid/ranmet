'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, Eye, Video, 
  Award, Lock, ArrowLeft, ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

const MIN_TRUST_REQUIRED = 1000

export default function CreatorStudioPage() {
  const { t } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [trustScore, setTrustScore] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [myVideos, setMyVideos] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('100000')
  const [bankInfo, setBankInfo] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  useEffect(() => {
    async function loadStudio() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: trust }, { data: vids }, { data: posts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
        supabase.from('videos').select('*').eq('creator_id', user.id),
        supabase.from('rannews_posts').select('*').eq('author_id', user.id)
      ])

      if (prof) {
        setProfile(prof)
        setEarnings(Number(prof.creator_earnings || 0))
      }
      if (trust) {
        setTrustScore(trust.score || 0)
      }
      if (vids) setMyVideos(vids)
      if (posts) setMyPosts(posts)

      setLoading(false)
    }

    loadStudio()
  }, [supabase])

  function handleWithdraw(e) {
    e.preventDefault()
    if (!bankInfo.trim()) return
    if (earnings < Number(withdrawAmount)) {
      showToast('Số dư thực tế trong ví không đủ để rút số tiền này!')
      return
    }
    showToast('Đã gửi yêu cầu rút tiền thành công! 💸')
    setShowWithdrawModal(false)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="card center-text" style={{ padding: 40, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny muted">Đang kết nối Creator Studio...</div>
        </div>
      </AppShell>
    )
  }

  // REQUIRE AT LEAST 1,000 TRUST POINTS TO UNLOCK
  const isLocked = trustScore < MIN_TRUST_REQUIRED
  const progressPct = Math.min(100, (trustScore / MIN_TRUST_REQUIRED) * 100)

  if (isLocked) {
    return (
      <AppShell trustScore={trustScore} userProfile={profile}>
        <div className="flex col items-center center-text" style={{ maxWidth: 580, margin: '40px auto', width: '100%' }}>
          <div 
            className="card"
            style={{
              padding: '40px 28px',
              width: '100%',
              background: 'var(--raised-lacquer)',
              border: '1px solid var(--gold-hairline-strong)'
            }}
          >
            <div 
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(245, 192, 66, 0.1)',
                border: '1px solid var(--gold-hairline-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--kinpaku-gold)'
              }}
            >
              <Lock size={28} />
            </div>

            <div className="badge badge-gold tiny" style={{ marginBottom: 8 }}>
              {t('creatorLockedBadge')}
            </div>

            <h1 className="rm-title" style={{ fontSize: 20, marginBottom: 6 }}>
              {t('creatorLockedTitle')}
            </h1>
            <p className="small muted" style={{ lineHeight: 1.5, marginBottom: 20 }}>
              {t('creatorLockedDesc')}
            </p>

            {/* TRUST PROGRESS TRACK */}
            <div style={{ background: 'var(--lacquer-deep)', padding: 16, borderRadius: 10, marginBottom: 20, border: '1px solid var(--gold-hairline)' }}>
              <div className="flex justify-between tiny bold" style={{ marginBottom: 6 }}>
                <span>{t('currentTrustLabel')} <b className="gold rm-num">{trustScore} pts</b></span>
                <span className="muted">{t('targetLabel')} ({progressPct.toFixed(0)}%)</span>
              </div>
              <div className="compat-bar-track" style={{ height: 8 }}>
                <div 
                  className="compat-bar-fill" 
                  style={{ width: `${progressPct}%`, background: 'var(--gold-gradient)' }} 
                />
              </div>
              <div className="tiny faint" style={{ marginTop: 8, textAlign: 'left' }}>
                {t('needMoreTrustPart1')} <b className="gold rm-num">{Math.max(0, MIN_TRUST_REQUIRED - trustScore)} pts</b> {t('needMoreTrustPart2')}
              </div>
            </div>

            {/* HOW TO EARN TRUST */}
            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <div className="tiny bold champagne" style={{ marginBottom: 6 }}>{t('howToEarnTitle')}</div>
              <div className="flex col g6 tiny muted">
                <div>{t('earnTip1')}</div>
                <div>{t('earnTip2')}</div>
                <div>{t('earnTip3')}</div>
              </div>
            </div>

            <div className="flex g10">
              <Link href="/profile" className="btn btn-primary grow" style={{ borderRadius: 6 }}>
                {t('viewReferralLinkBtn')}
              </Link>
              <Link href="/home" className="btn btn-secondary" style={{ width: 'auto', borderRadius: 6 }}>
                <ArrowLeft size={14} /> {t('backBtn')}
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // UNLOCKED CREATOR STUDIO (TRUST >= 1000)
  const totalContentCount = myVideos.length + myPosts.length

  return (
    <AppShell userProfile={profile} trustScore={trustScore}>
      <div className="flex col g20" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
        {/* STUDIO TOP HEADER BANNER */}
        <div 
          className="card"
          style={{
            padding: 24,
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--gold-hairline-strong)'
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div className="badge badge-gold tiny" style={{ marginBottom: 8 }}>
                <Award size={12} /> RANMET CREATOR STUDIO
              </div>
              <h1 className="rm-title" style={{ fontSize: 24, marginBottom: 4 }}>
                Creator Studio 🚀
              </h1>
              <p className="small muted" style={{ maxWidth: 600, lineHeight: 1.5 }}>
                RanVideo, RanNews Creator Monetization System
              </p>
            </div>

            <div className="flex items-center g8">
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ width: 'auto', padding: '9px 18px', fontSize: 13, borderRadius: 6 }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <DollarSign size={15} /> {t('withdrawMoneyBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* METRICS STATS CARDS GRID */}
        <div className="desktop-grid-3">
          {/* Card 1: Estimated Revenue */}
          <div className="card" style={{ padding: 18 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <span className="tiny faint flex items-center g4">
                <DollarSign size={13} style={{ color: 'var(--kinpaku-gold)' }} /> {t('walletBalanceTitle')}
              </span>
              <span className="badge badge-success tiny" style={{ fontSize: 9.5 }}>Live</span>
            </div>
            <div className="rm-num bold gold" style={{ fontSize: 26 }}>
              {Number(earnings).toLocaleString()} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>VNĐ</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 4 }}>
              {t('totalInteractionsLabel')}
            </div>
          </div>

          {/* Card 2: Total Content */}
          <div className="card" style={{ padding: 18 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <span className="tiny faint flex items-center g4">
                <Eye size={13} style={{ color: 'var(--verdigris-patina)' }} /> {t('myContentTitle')}
              </span>
              <span className="badge tiny" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--verdigris-patina)', fontSize: 9.5 }}>Active</span>
            </div>
            <div className="rm-num bold champagne" style={{ fontSize: 26 }}>
              {totalContentCount}
            </div>
            <div className="tiny faint rm-num" style={{ marginTop: 4 }}>
              {myVideos.length} videos · {myPosts.length} posts
            </div>
          </div>

          {/* Card 3: Trust Status */}
          <div className="card" style={{ padding: 18 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <span className="tiny faint flex items-center g4">
                <Award size={13} style={{ color: 'var(--emerald-patina)' }} /> {t('trustScore')}
              </span>
              <span className="badge badge-gold tiny" style={{ fontSize: 9.5 }}>Eligible</span>
            </div>
            <div className="rm-num bold gold" style={{ fontSize: 26 }}>
              {trustScore} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>pts</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 4 }}>
              Verified Creator Partner
            </div>
          </div>
        </div>

        {/* CONTENT MANAGEMENT LIST */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
            <h3 className="rm-title" style={{ fontSize: 16, margin: 0 }}>
              {t('myContentTitle')} ({totalContentCount})
            </h3>
            <div className="flex g6">
              <Link href="/videos" className="btn btn-secondary" style={{ width: 'auto', padding: '5px 12px', fontSize: 11.5, borderRadius: 6 }}>
                {t('uploadNewVideo')}
              </Link>
              <Link href="/news" className="btn btn-secondary" style={{ width: 'auto', padding: '5px 12px', fontSize: 11.5, borderRadius: 6 }}>
                {t('postNewsBtn')}
              </Link>
            </div>
          </div>

          {totalContentCount === 0 ? (
            <div className="center-text tiny faint" style={{ padding: 24 }}>
              {t('noMyVideos')}
            </div>
          ) : (
            <div className="flex col g8">
              {myVideos.map((v) => (
                <div key={v.id} className="card flex items-center justify-between" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                  <div className="flex items-center g10">
                    <Video size={16} style={{ color: 'var(--kinpaku-gold)' }} />
                    <div>
                      <div className="semi small champagne">{v.caption}</div>
                      <div className="tiny faint">{v.tags?.join(' ')}</div>
                    </div>
                  </div>
                  <span className="badge badge-success tiny">Active</span>
                </div>
              ))}

              {myPosts.map((p) => (
                <div key={p.id} className="card flex items-center justify-between" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                  <div className="flex items-center g10">
                    <Eye size={16} style={{ color: 'var(--verdigris-patina)' }} />
                    <div>
                      <div className="semi small champagne">{p.content?.slice(0, 40)}...</div>
                      <div className="tiny faint">RanNews Post</div>
                    </div>
                  </div>
                  <span className="badge badge-success tiny">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowWithdrawModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 440, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <h2 className="rm-title" style={{ fontSize: 17 }}>{t('withdrawMoneyBtn')}</h2>
              <button 
                type="button" 
                onClick={() => setShowWithdrawModal(false)}
                className="btn-icon" 
                style={{ width: 28, height: 28 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="flex col g14">
              <div className="field-group">
                <label className="field-label">Amount (VNĐ)</label>
                <select 
                  className="input"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                >
                  <option value="100000" style={{ background: '#120f18' }}>100,000 VNĐ</option>
                  <option value="200000" style={{ background: '#120f18' }}>200,000 VNĐ</option>
                  <option value="500000" style={{ background: '#120f18' }}>500,000 VNĐ</option>
                  <option value="1000000" style={{ background: '#120f18' }}>1,000,000 VNĐ</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Payout Account (Bank / MoMo / Wallet)</label>
                <input 
                  className="input" 
                  placeholder="MB Bank / MoMo / PayPal info..."
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
                <DollarSign size={15} /> {t('withdrawMoneyBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
