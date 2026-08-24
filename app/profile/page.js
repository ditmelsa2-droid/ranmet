'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, ShieldCheck, Award, Heart, Sparkles, 
  Globe, Languages, Save, Plus, X, Share2, Copy, Check, MessageSquare, 
  Image as ImageIcon, DollarSign, AlertCircle, Palette, Upload, Camera
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import AppShell from '../components/AppShell'

const BANNER_THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'var(--discord-cyber)' },
  { id: 'galaxy', name: 'Galaxy Cosmic', bg: 'var(--discord-galaxy)' },
  { id: 'sunset', name: 'Sunset Vibe', bg: 'var(--discord-sunset)' },
  { id: 'matrix', name: 'Matrix Emerald', bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)' }
]

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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerTheme, setBannerTheme] = useState('cyberpunk')
  const [customBannerUrl, setCustomBannerUrl] = useState('')
  const [interests, setInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [style, setStyle] = useState('')
  const [trustScore, setTrustScore] = useState(100)
  
  // Referral State
  const [referralCount, setReferralCount] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [moderationError, setModerationError] = useState('')

  const avatarFileRef = useRef(null)
  const bannerFileRef = useRef(null)

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
        setAvatarUrl(profile.avatar_url || '')
        setBannerTheme(profile.banner_theme || 'cyberpunk')
        setCustomBannerUrl(profile.banner_url || '')
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

  // Direct Device Avatar Upload
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Đang tải ảnh đại diện lên...')
      const res = await readFileAsDataUrl(file, 20)
      setAvatarUrl(res.url)
      showToast('Đã tải ảnh đại diện thành công! Bấm "Lưu hồ sơ" để hoàn tất.')
    } catch (err) {
      showToast(err.message)
    }
  }

  // Direct Device Banner Upload
  async function handleBannerUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Đang tải ảnh nền lên...')
      const res = await readFileAsDataUrl(file, 30)
      setCustomBannerUrl(res.url)
      showToast('Đã tải ảnh nền thành công! Bấm "Lưu hồ sơ" để hoàn tất.')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function addInterest(tag) {
    const clean = tag.trim()
    if (!clean) return

    // GEMINI & DEEP VIETNAMESE SLANG MODERATION CHECK
    const modCheck = await checkContent(clean)
    if (!modCheck.isSafe) {
      setModerationError(`Từ khóa "${clean}" bị từ chối: Vi phạm tiêu chuẩn an toàn cộng đồng! ⚠️`)
      showToast(`Từ khóa "${clean}" vi phạm tiêu chuẩn cộng đồng!`)
      return
    }

    setModerationError('')
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

    // AI MODERATION CHECK ON ENTIRE FORM
    const bioCheck = await checkContent(bio)
    if (!bioCheck.isSafe) {
      setModerationError(`Phần giới thiệu chứa từ khóa không phù hợp (${bioCheck.flaggedWord}). Vui lòng chỉnh sửa!`)
      showToast('Nội dung Bio vi phạm tiêu chuẩn an toàn!')
      return
    }

    const nameCheck = await checkContent(displayName)
    if (!nameCheck.isSafe) {
      setModerationError(`Tên hiển thị chứa từ ngữ vi phạm tiêu chuẩn cộng đồng!`)
      showToast('Tên hiển thị vi phạm tiêu chuẩn!')
      return
    }

    const tagsCheck = await checkTags(interests)
    if (tagsCheck.hasBlocked) {
      setModerationError(`Các tag [${tagsCheck.blockedWords.join(', ')}] bị hệ thống AI kiểm duyệt từ chối!`)
      showToast('Có tag sở thích vi phạm tiêu chuẩn!')
      return
    }

    setModerationError('')
    setSaving(true)

    const updates = {
      display_name: displayName.trim() || 'Người dùng',
      country,
      bio: bio.trim(),
      avatar_url: avatarUrl.trim() || null,
      banner_theme: bannerTheme,
      banner_url: customBannerUrl.trim() || null,
      interests: tagsCheck.safeTags,
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

  const activeTheme = BANNER_THEMES.find(t => t.id === bannerTheme) || BANNER_THEMES[0]
  const bannerBackground = customBannerUrl.trim() ? `url(${customBannerUrl})` : activeTheme.bg

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
      <div className="flex col g24" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
        {/* DISCORD-STYLE PROFILE CARD WITH FLOATING BANNER */}
        <div 
          className="card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Top Banner */}
          <div 
            className="discord-banner" 
            style={{ 
              background: bannerBackground,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            {/* Quick Banner Upload Button */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 'auto',
                padding: '6px 12px',
                fontSize: 11,
                borderRadius: 999,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => bannerFileRef.current?.click()}
            >
              <Upload size={12} /> Đổi ảnh nền từ máy
            </button>
            <input 
              type="file" 
              ref={bannerFileRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleBannerUpload} 
            />

            {/* Avatar Wrap */}
            <div className="discord-avatar-wrap" style={{ position: 'absolute', bottom: -40, left: 28 }}>
              <div
                className="avatar"
                style={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  background: 'var(--brand-gradient)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => avatarFileRef.current?.click()}
                title="Bấm để đổi ảnh đại diện từ thiết bị"
              >
                {avatarUrl.trim() ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  (displayName || 'U').charAt(0).toUpperCase()
                )}

                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Camera size={20} style={{ color: '#fff' }} />
                </div>
              </div>

              <input 
                type="file" 
                ref={avatarFileRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarUpload} 
              />
            </div>
          </div>

          {/* Profile Header Content */}
          <div style={{ padding: '52px 28px 24px' }}>
            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="flex items-center g10">
                  <h1 className="rm-title" style={{ fontSize: 26, color: '#fff' }}>{displayName || 'Chưa đặt tên'}</h1>
                  <span className="badge badge-success tiny" style={{ fontSize: 10 }}>Đã xác thực</span>
                </div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {country} · {interests.length} sở thích · <span style={{ color: '#c084fc' }}>Phong cách: {style || 'Tự do'}</span>
                </div>
                {bio && (
                  <p className="small" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, maxWidth: 540 }}>
                    {bio}
                  </p>
                )}
              </div>

              <div className="flex g10 items-center">
                <Link href="/creator" className="btn btn-secondary" style={{ width: 'auto', padding: '10px 18px', fontSize: 13, background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
                  <DollarSign size={16} /> Creator Studio {trustScore < 1000 ? '🔒' : '✨'}
                </Link>
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
        </div>

        {/* AI MODERATION ALERT IF ANY */}
        {moderationError && (
          <div className="err-text" style={{ padding: '14px 18px', borderRadius: 14 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <b style={{ color: '#fff' }}>Hệ thống AI Kiểm duyệt:</b> {moderationError}
            </div>
          </div>
        )}

        {/* REFERRAL / TRUST REWARDS CARD */}
        <div 
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: 22
          }}
        >
          <div className="flex justify-between items-start" style={{ marginBottom: 14 }}>
            <div>
              <div className="badge tiny" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b50', marginBottom: 6 }}>
                🎁 CHƯƠNG TRÌNH MỜI BẠN BÈ TÍCH ĐIỂM TRUST
              </div>
              <h3 className="rm-title" style={{ fontSize: 18, color: '#fff' }}>
                Mời bạn bè đăng ký RanMet nhận đến +100 Trust!
              </h3>
              <p className="tiny muted" style={{ marginTop: 4 }}>
                • 3 bạn: <b>+25 Trust</b> · 5 bạn: <b>+50 Trust</b> · 10 bạn (Max): <b>+100 Trust</b>
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

          <div style={{ marginTop: 12 }}>
            <div className="flex justify-between tiny bold" style={{ marginBottom: 6 }}>
              <span>Tiến độ: <b style={{ color: '#f59e0b' }}>{referralCount} người</b></span>
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

        {/* CUSTOMIZE BANNER & AVATAR UPLOAD (DISCORD STYLE) */}
        <div className="card flex col g18" style={{ padding: 26 }}>
          <div className="rm-title flex items-center g8" style={{ fontSize: 18, color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <Palette size={18} style={{ color: '#ec4899' }} /> Tải Lên Ảnh Đại Diện & Ảnh Bìa (Từ Thiết Bị)
          </div>

          <div className="flex g16" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary grow"
              style={{ padding: '14px', fontSize: 13 }}
              onClick={() => avatarFileRef.current?.click()}
            >
              <Camera size={16} style={{ color: '#ec4899' }} /> Tải ảnh đại diện từ điện thoại / máy tính
            </button>

            <button
              type="button"
              className="btn btn-secondary grow"
              style={{ padding: '14px', fontSize: 13 }}
              onClick={() => bannerFileRef.current?.click()}
            >
              <Upload size={16} style={{ color: '#06b6d4' }} /> Tải ảnh bìa Discord từ thiết bị
            </button>
          </div>

          <div className="field-group">
            <label className="field-label">Hoặc chọn Theme màu ảnh bìa có sẵn:</label>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 10 }}>
              {BANNER_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => { setBannerTheme(theme.id); setCustomBannerUrl(''); }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 14,
                    background: theme.bg,
                    border: (bannerTheme === theme.id && !customBannerUrl) ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: (bannerTheme === theme.id && !customBannerUrl) ? '0 0 16px rgba(255,255,255,0.5)' : 'none'
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EDIT PROFILE DETAILS & TAGS WITH AI MODERATION */}
        <form onSubmit={handleSaveProfile} className="card flex col g20" style={{ padding: 26 }}>
          <div className="rm-title" style={{ fontSize: 18, color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Thông tin chi tiết & Sở thích tự do
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

          {/* CUSTOM INTERESTS / HOBBIES */}
          <div className="field-group">
            <div className="flex justify-between items-center">
              <label className="field-label"><Heart size={14} /> Sở thích & Chủ đề (Gemini AI & Slang Guard)</label>
              <span className="tiny faint flex items-center g4"><ShieldCheck size={12} style={{ color: '#10b981' }} /> AI Active</span>
            </div>
            
            <div className="flex g8 items-center" style={{ marginBottom: 10 }}>
              <input 
                className="input" 
                placeholder="Nhập sở thích (Ví dụ: Thích ngắm mưa, Nuôi mèo, Code dạo...) rồi bấm Thêm tag"
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
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
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
