'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, ShieldCheck, Award, Heart, Sparkles, 
  Globe, Languages, Save, Plus, X, Share2, Copy, Check, MessageSquare, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trustTier, nextTierInfo } from '@/lib/trust'
import AppShell from '../components/AppShell'

const SUGGESTED_INTERESTS = [
  'Minecraft', 'Anime', 'Lập trình', 'Bóng đá', 'AI', 'Du lịch',
  'Cafe', 'Nghe nhạc', 'Nhiếp ảnh', 'Gaming', 'Gym', 'Đọc sách'
]

export default function ProfilePage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  
  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [country, setCountry] = useState('Việt Nam')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [style, setStyle] = useState('')
  const [trustScore, setTrustScore] = useState(100)
  
  // Referral State
  const [referralCount, setReferralCount] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const [{ data: profile }, { data: trust }, { count: refCount }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
        supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
      ])

      if (profile) {
        setDisplayName(profile.display_name || '')
        setCountry(profile.country || 'Việt Nam')
        setBio(profile.bio || '')
        setInterests(profile.interests || [])
        setStyle(profile.conversation_style || '')
      }
      if (trust) {
        setTrustScore(trust.score)
      }
      if (refCount != null) {
        setReferralCount(refCount)
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  function addInterest(tag) {
    const clean = tag.trim()
    if (!clean) return
    if (!interests.includes(clean)) {
      setInterests([...interests, clean])
    }
    setCustomInterest('')
  }

  function removeInterest(tag) {
    setInterests(interests.filter((t) => t !== tag))
  }

  async function handleSaveProfile(e) {
    e?.preventDefault()
    if (!userId || saving) return
    setSaving(true)

    const updates = {
      display_name: displayName.trim() || 'Người dùng',
      country,
      bio: bio.trim(),
      interests,
      conversation_style: style.trim(),
      onboarding_complete: true
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    setSaving(false)

    if (error) {
      showToast('Lỗi cập nhật hồ sơ: ' + error.message)
    } else {
      showToast('Đã lưu hồ sơ thành công! ✨')
    }
  }

  function copyReferralLink() {
    if (typeof window === 'undefined') return
    const link = `${window.location.origin}/register?ref=${userId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    showToast('Đã sao chép link mời bạn bè nhận Trust! 🎁')
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const tier = trustTier(trustScore)
  const next = nextTierInfo(trustScore)

  if (loading) {
    return (
      <AppShell>
        <div className="card center-text" style={{ padding: 40, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny bold muted">Đang tải thông tin hồ sơ...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell trustScore={trustScore} userProfile={{ display_name: displayName }}>
      <div className="flex col g24" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        {/* TOP PROFILE BANNER */}
        <div 
          className="card"
          style={{
            padding: 28,
            background: 'linear-gradient(135deg, rgba(28, 20, 48, 0.95) 0%, rgba(14, 10, 24, 0.98) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 16px 40px -10px rgba(168, 85, 247, 0.25)'
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div className="flex items-center g18">
              <div
                className="avatar"
                style={{
                  width: 72,
                  height: 72,
                  fontSize: 28,
                  background: 'var(--brand-gradient)',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)'
                }}
              >
                {(displayName || 'U').charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center g8">
                  <h1 className="rm-title" style={{ fontSize: 24, color: '#fff' }}>{displayName || 'Chưa đặt tên'}</h1>
                  <span className="badge badge-success tiny" style={{ fontSize: 10 }}>Đã xác thực</span>
                </div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {country} · {interests.length} sở thích cá nhân
                </div>
              </div>
            </div>

            <div className="flex items-center g10">
              <button 
                type="button"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 20px', fontSize: 13 }}
                onClick={handleSaveProfile}
                disabled={saving}
              >
                <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>
        </div>

        {/* REFERRAL / ADS TRUST MILESTONES CARD */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: 24
          }}
        >
          <div className="flex justify-between items-start" style={{ marginBottom: 14 }}>
            <div>
              <div className="badge tiny" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b50', marginBottom: 6 }}>
                🎁 CHƯƠNG TRÌNH MỜI BẠN BÈ TÍCH ĐIỂM TRUST
              </div>
              <h3 className="rm-title" style={{ fontSize: 19, color: '#fff' }}>
                Mời bạn bè đăng ký RanMet nhận đến +100 Trust!
              </h3>
              <p className="small muted" style={{ marginTop: 4, lineHeight: 1.45 }}>
                • Mốc 3 bạn: <b>+25 Trust</b> · Mốc 5 bạn: <b>+50 Trust</b> · Mốc 10 bạn (Max): <b>+100 Trust</b>
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '8px 16px', fontSize: 12, borderRadius: 999 }}
              onClick={copyReferralLink}
            >
              {copiedLink ? <><Check size={14} style={{ color: '#10b981' }} /> Đã chép link</> : <><Copy size={14} /> Sao chép link mời</>}
            </button>
          </div>

          {/* Referral Milestones Track */}
          <div style={{ marginTop: 16 }}>
            <div className="flex justify-between tiny bold" style={{ marginBottom: 6 }}>
              <span>Tiến độ giới thiệu: <b style={{ color: '#f59e0b' }}>{referralCount} người</b></span>
              <span className="muted">Tối đa 10 bạn</span>
            </div>
            <div className="compat-bar-track" style={{ height: 8 }}>
              <div 
                className="compat-bar-fill" 
                style={{ 
                  width: `${Math.min(100, (referralCount / 10) * 100)}%`,
                  background: 'var(--gold-gradient)'
                }} 
              />
            </div>
          </div>
        </div>

        {/* EDIT PROFILE FORM */}
        <form onSubmit={handleSaveProfile} className="card flex col g20" style={{ padding: 28 }}>
          <div className="rm-title" style={{ fontSize: 20, color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Chỉnh sửa thông tin cá nhân
          </div>

          <div className="field-group">
            <label className="field-label"><User size={14} /> Tên hiển thị</label>
            <input 
              className="input" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Nhập tên hoặc biệt danh..."
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label"><Globe size={14} /> Quốc gia / Khu vực</label>
            <input 
              className="input" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              placeholder="Việt Nam"
            />
          </div>

          <div className="field-group">
            <label className="field-label"><MessageSquare size={14} /> Giới thiệu bản thân (Bio)</label>
            <textarea 
              className="input" 
              rows={3} 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Chia sẻ đôi điều về bạn..."
            />
          </div>

          {/* CUSTOM INTERESTS / HOBBIES (FREE INPUT + SUGGESTIONS) */}
          <div className="field-group">
            <label className="field-label"><Heart size={14} /> Sở thích & Chủ đề quan tâm (Tùy chỉnh tự do)</label>
            
            {/* Input custom interest */}
            <div className="flex g8 items-center" style={{ marginBottom: 12 }}>
              <input 
                className="input" 
                placeholder="Nhập sở thích bất kỳ (Ví dụ: Thích ngắm mưa, Nuôi mèo, Đạp xe...) rồi bấm Thêm"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addInterest(customInterest)
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '12px 18px', flexShrink: 0 }}
                onClick={() => addInterest(customInterest)}
              >
                <Plus size={16} /> Thêm tag
              </button>
            </div>

            {/* Current Selected Tags */}
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {interests.map((t) => (
                <span 
                  key={t} 
                  className="chip selected" 
                  style={{ padding: '6px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span>{t}</span>
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', opacity: 0.8 }} 
                    onClick={() => removeInterest(t)}
                  />
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div>
              <div className="tiny faint" style={{ marginBottom: 6 }}>Gợi ý nhanh (Bấm để thêm):</div>
              <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                {SUGGESTED_INTERESTS.filter(s => !interests.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => addInterest(s)}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CUSTOM CONVERSATION STYLE / PERSONALITY */}
          <div className="field-group">
            <label className="field-label"><Sparkles size={14} /> Phong cách trò chuyện & Tính cách (Tự do mô tả)</label>
            <input 
              className="input" 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              placeholder="Ví dụ: Vui vẻ hài hước, Hướng nội thích lắng nghe, Đam mê công nghệ..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 10, padding: 15 }} disabled={saving}>
            <Save size={18} /> {saving ? 'Đang lưu cập nhật...' : 'Lưu và cập nhật hồ sơ'}
          </button>
        </form>
      </div>

      {/* TOAST */}
      {toastMsg && (
        <div 
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(18, 14, 28, 0.95)',
            border: '1px solid rgba(236, 72, 153, 0.5)',
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
            padding: '10px 20px',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13.5,
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
