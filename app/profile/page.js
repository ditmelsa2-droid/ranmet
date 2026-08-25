'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, ShieldCheck, Award, Heart, Sparkles, 
  Globe, Languages, Save, Plus, X, Share2, Copy, Check, MessageSquare, 
  Image as ImageIcon, DollarSign, AlertCircle, Palette, Upload, Camera,
  Trash2, Video as VideoIcon, Newspaper, Eye, Flame
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { useLanguage } from '@/lib/LanguageContext'
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
  const { t } = useLanguage()
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
  const [ageVerified, setAgeVerified] = useState(false)
  const [birthday, setBirthday] = useState('')
  
  // My Uploaded Content State
  const [myVideos, setMyVideos] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [activeContentTab, setActiveContentTab] = useState('videos') // 'videos' | 'posts'
  
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

  async function loadMyContent(uid) {
    const [{ data: vids }, { data: posts }] = await Promise.all([
      supabase.from('videos').select('*').eq('creator_id', uid).order('created_at', { ascending: false }),
      supabase.from('rannews_posts').select('*').eq('author_id', uid).order('created_at', { ascending: false })
    ])
    if (vids) setMyVideos(vids)
    if (posts) setMyPosts(posts)
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
        setAgeVerified(!!profile.age_verified)
        setBirthday(profile.birthday || '')
      }
      if (trust) {
        setTrustScore(trust.score)
      }
      if (refCount != null) {
        setReferralCount(refCount)
      }

      await loadMyContent(user.id)
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
      showToast('Đã chọn ảnh đại diện! Bấm "Lưu hồ sơ" để hoàn tất.')
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
      showToast('Đã chọn ảnh nền! Bấm "Lưu hồ sơ" để hoàn tất.')
    } catch (err) {
      showToast(err.message)
    }
  }

  // Delete My Video
  async function handleDeleteVideo(videoId) {
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa video này khỏi hệ thống?')
    if (!confirm) return

    setMyVideos(myVideos.filter((v) => v.id !== videoId))
    const { error } = await supabase.from('videos').delete().eq('id', videoId)
    if (error) {
      showToast('Lỗi khi xóa video: ' + error.message)
    } else {
      showToast('Đã xóa video thành công!')
    }
  }

  // Delete My News Post
  async function handleDeletePost(postId) {
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')
    if (!confirm) return

    setMyPosts(myPosts.filter((p) => p.id !== postId))
    const { error } = await supabase.from('rannews_posts').delete().eq('id', postId)
    if (error) {
      showToast('Lỗi khi xóa bài viết: ' + error.message)
    } else {
      showToast('Đã xóa bài viết thành công!')
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
      age_verified: ageVerified,
      birthday: birthday || null,
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
    showToast(t('copiedInviteLink'))
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const activeTheme = BANNER_THEMES.find(t => t.id === bannerTheme) || BANNER_THEMES[0]
  const bannerBackground = customBannerUrl.trim() ? `url(${customBannerUrl})` : activeTheme.bg

  if (loading) {
    return (
      <AppShell>
        <div className="card center-text" style={{ padding: 40, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny bold muted">Connecting to Profile...</div>
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
              <Upload size={12} /> {t('changeBannerDevice')}
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
                  <h1 className="rm-title" style={{ fontSize: 26, color: '#fff' }}>{displayName || 'User'}</h1>
                  <span className="badge badge-success tiny" style={{ fontSize: 10 }}>{t('verifiedBadge')}</span>
                  {ageVerified && <span className="badge tiny" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f43f5e', border: '1px solid rgba(236, 72, 153, 0.4)', fontSize: 10 }}>🔞 18+</span>}
                </div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {country} · {interests.length} {t('interestsCount')} · <span style={{ color: '#c084fc' }}>{t('styleLabel')}: {style || 'Casual'}</span>
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
                  <Save size={16} /> {saving ? 'Saving...' : t('saveProfileBtn')}
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
              <b style={{ color: '#fff' }}>AI Moderation:</b> {moderationError}
            </div>
          </div>
        )}

        {/* 18+ AGE VERIFICATION CARD (XÁC THỰC ĐỘ TUỔI ĐỂ XEM NỘI DUNG 18+ ĐÃ LÀM MỜ) */}
        <div
          className="card"
          style={{
            background: ageVerified 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: ageVerified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            padding: 22
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div className="flex items-center g8" style={{ marginBottom: 6 }}>
                <ShieldCheck size={18} style={{ color: ageVerified ? '#10b981' : '#f59e0b' }} />
                <h3 className="rm-title" style={{ fontSize: 17, color: '#fff' }}>
                  Xác thực độ tuổi 18+ (Age Verification)
                </h3>
                <span className={`badge tiny ${ageVerified ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                  {ageVerified ? '🔞 ĐÃ XÁC THỰC 18+' : '🔒 CHƯA XÁC THỰC (DƯỚI 18)'}
                </span>
              </div>
              <p className="tiny muted" style={{ maxWidth: 520, lineHeight: 1.5 }}>
                {ageVerified 
                  ? 'Tài khoản của bạn đã được xác thực trên 18 tuổi. Bạn có quyền xem và bỏ làm mờ các nội dung / video 18+ trên bảng tin và RanVideo.'
                  : 'Hệ thống bảo vệ trẻ vị thành niên: Toàn bộ video và bài viết 18+ NSFW sẽ bị khóa hoặc làm mờ 100% cho đến khi bạn xác thực độ tuổi.'}
              </p>
            </div>

            <button
              type="button"
              className={`btn ${ageVerified ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: 'auto', padding: '10px 18px', fontSize: 12, borderRadius: 999 }}
              onClick={() => {
                const nextState = !ageVerified
                setAgeVerified(nextState)
                showToast(nextState ? 'Đã bật xác thực 18+! Hãy bấm "Lưu hồ sơ" để áp dụng.' : 'Đã tắt xác thực 18+ (Kích hoạt chế độ bảo vệ trẻ em)!')
              }}
            >
              {ageVerified ? 'Tắt xác thực 18+' : '🔞 Xác thực tôi trên 18 tuổi'}
            </button>
          </div>
        </div>

        {/* MY UPLOADED CONTENT MANAGER (QUẢN LÝ VIDEO, ẢNH, BÀI VIẾT) */}
        <div className="card" style={{ padding: 26 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
            <div className="flex items-center g10">
              <Sparkles size={18} style={{ color: '#06b6d4' }} />
              <h2 className="rm-title" style={{ fontSize: 18, color: '#fff' }}>
                {t('myContentTitle')} ({myVideos.length + myPosts.length})
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex g8">
              <button
                type="button"
                className={`chip ${activeContentTab === 'videos' ? 'selected' : ''}`}
                onClick={() => setActiveContentTab('videos')}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                <VideoIcon size={13} /> {t('videosTab')} ({myVideos.length})
              </button>
              <button
                type="button"
                className={`chip ${activeContentTab === 'posts' ? 'selected' : ''}`}
                onClick={() => setActiveContentTab('posts')}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                <Newspaper size={13} /> {t('postsTab')} ({myPosts.length})
              </button>
            </div>
          </div>

          {/* Tab Videos */}
          {activeContentTab === 'videos' && (
            <div>
              {myVideos.length === 0 ? (
                <div className="center-text tiny faint" style={{ padding: 24 }}>
                  {t('noMyVideos')}
                </div>
              ) : (
                <div className="flex col g12">
                  {myVideos.map((v) => (
                    <div key={v.id} className="card flex items-center justify-between" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center g12">
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <VideoIcon size={20} style={{ color: '#f43f5e' }} />
                        </div>
                        <div>
                          <div className="semi small" style={{ color: '#fff' }}>{v.caption}</div>
                          <div className="tiny faint">{v.tags?.join(' ')} · {new Date(v.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 34, height: 34, color: '#fb7185' }}
                        onClick={() => handleDeleteVideo(v.id)}
                        title="Delete video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Posts */}
          {activeContentTab === 'posts' && (
            <div>
              {myPosts.length === 0 ? (
                <div className="center-text tiny faint" style={{ padding: 24 }}>
                  {t('noMyPosts')}
                </div>
              ) : (
                <div className="flex col g12">
                  {myPosts.map((p) => (
                    <div key={p.id} className="card flex items-center justify-between" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center g12">
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Newspaper size={20} style={{ color: '#06b6d4' }} />
                        </div>
                        <div>
                          <div className="semi small" style={{ color: '#fff' }}>{p.content?.slice(0, 50)}...</div>
                          <div className="tiny faint">{new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 34, height: 34, color: '#fb7185' }}
                        onClick={() => handleDeletePost(p.id)}
                        title="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
                {t('referralProgramBadge')}
              </div>
              <h3 className="rm-title" style={{ fontSize: 18, color: '#fff' }}>
                {t('referralProgramTitle')}
              </h3>
              <p className="tiny muted" style={{ marginTop: 4 }}>
                {t('referralTiers')}
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '8px 16px', fontSize: 12, borderRadius: 999 }}
              onClick={copyReferralLink}
            >
              {copiedLink ? <><Check size={14} style={{ color: '#10b981' }} /> {t('copiedInviteLink')}</> : <><Copy size={14} /> {t('copyInviteLink')}</>}
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="flex justify-between tiny bold" style={{ marginBottom: 6 }}>
              <span>{t('progressLabel')} <b style={{ color: '#f59e0b' }}>{referralCount} {t('friendsCountSuffix')}</b></span>
              <span className="muted">{t('max10Friends')}</span>
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

        {/* EDIT PROFILE DETAILS & TAGS WITH AI MODERATION */}
        <form onSubmit={handleSaveProfile} className="card flex col g20" style={{ padding: 26 }}>
          <div className="rm-title" style={{ fontSize: 18, color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            {t('profileFormTitle')}
          </div>

          <div className="field-group">
            <label className="field-label"><User size={14} /> {t('displayNameLabel')}</label>
            <input 
              className="input" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Display name..."
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label"><Globe size={14} /> {t('countryLabel')}</label>
            <input 
              className="input" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              placeholder="Country..."
            />
          </div>

          <div className="field-group">
            <label className="field-label"><MessageSquare size={14} /> {t('bioLabel')}</label>
            <textarea 
              className="input" 
              rows={3} 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell something about yourself..."
            />
          </div>

          {/* CUSTOM INTERESTS / HOBBIES */}
          <div className="field-group">
            <div className="flex justify-between items-center">
              <label className="field-label"><Heart size={14} /> {t('interestsLabel')}</label>
              <span className="tiny faint flex items-center g4"><ShieldCheck size={12} style={{ color: '#10b981' }} /> AI Active</span>
            </div>
            
            <div className="flex g8 items-center" style={{ marginBottom: 10 }}>
              <input 
                className="input" 
                placeholder="Enter interest tag..."
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
                <Plus size={16} /> {t('addTagBtn')}
              </button>
            </div>

            {/* Current Selected Tags */}
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {interests.map((tItem) => (
                <span 
                  key={tItem} 
                  className="chip selected" 
                  style={{ padding: '6px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span>{tItem}</span>
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', opacity: 0.8 }} 
                    onClick={() => removeInterest(tItem)}
                  />
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div>
              <div className="tiny faint" style={{ marginBottom: 6 }}>{t('quickSuggestLabel')}</div>
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
            <label className="field-label"><Sparkles size={14} /> {t('personalityLabel')}</label>
            <input 
              className="input" 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              placeholder="e.g. Chill, Friendly, Anime Lover, Tech Geek..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 10, padding: 15 }} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : t('saveAllChangesBtn')}
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
