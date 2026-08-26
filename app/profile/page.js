'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, ShieldCheck, Award, Heart, Sparkles, 
  Globe, Save, Plus, X, Copy, Check, MessageSquare, 
  DollarSign, AlertCircle, Upload, Camera,
  Trash2, Video as VideoIcon, Newspaper, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

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

    // AI & SLANG MODERATION CHECK
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

  const bannerBackground = customBannerUrl.trim() ? `url(${customBannerUrl})` : 'linear-gradient(135deg, #181424 0%, #0d0a14 50%, #201710 100%)'

  if (loading) {
    return (
      <AppShell>
        <div className="card center-text" style={{ padding: 40, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny muted">Đang kết nối hồ sơ...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell trustScore={trustScore} userProfile={{ display_name: displayName }}>
      <div className="flex col g20" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        {/* NEO KINPAKU PROFILE CARD */}
        <div 
          className="card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            border: '1px solid var(--gold-hairline-strong)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)'
          }}
        >
          {/* Top Banner */}
          <div 
            style={{ 
              height: 140,
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
                top: 12,
                right: 12,
                width: 'auto',
                padding: '5px 10px',
                fontSize: 11,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)'
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
            <div style={{ position: 'absolute', bottom: -36, left: 24 }}>
              <div
                className="avatar"
                style={{
                  width: 72,
                  height: 72,
                  fontSize: 28,
                  border: '3px solid var(--lacquer-black)',
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
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Camera size={18} style={{ color: '#fff' }} />
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
          <div style={{ padding: '48px 24px 20px' }}>
            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div className="flex items-center g8">
                  <h1 className="rm-title" style={{ fontSize: 22, margin: 0 }}>{displayName || 'User'}</h1>
                  <span className="badge badge-success tiny" style={{ fontSize: 9.5 }}>{t('verifiedBadge')}</span>
                  {ageVerified && <span className="badge tiny" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)', fontSize: 9.5 }}>🔞 18+</span>}
                </div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {country} · {interests.length} {t('interestsCount')} · <span className="gold">{t('styleLabel')}: {style || 'Casual'}</span>
                </div>
                {bio && (
                  <p className="small champagne" style={{ marginTop: 8, maxWidth: 540, lineHeight: 1.5 }}>
                    {bio}
                  </p>
                )}
              </div>

              <div className="flex g8 items-center">
                <Link href="/creator" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12, borderRadius: 6, borderColor: 'var(--gold-hairline)', color: 'var(--kinpaku-gold)' }}>
                  <DollarSign size={14} /> Creator Studio {trustScore < 1000 ? '🔒' : '✨'}
                </Link>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '8px 16px', fontSize: 12, borderRadius: 6 }}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <Save size={14} /> {saving ? 'Saving...' : t('saveProfileBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI MODERATION ALERT */}
        {moderationError && (
          <div className="err-text" style={{ padding: '12px 16px', borderRadius: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>
              <b className="champagne">AI Moderation:</b> {moderationError}
            </div>
          </div>
        )}

        {/* 18+ AGE VERIFICATION CARD */}
        <div
          className="card"
          style={{
            background: 'var(--raised-lacquer)',
            border: ageVerified ? '1px solid var(--emerald-patina)' : '1px solid var(--gold-hairline)',
            padding: 18
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="flex items-center g8" style={{ marginBottom: 4 }}>
                <ShieldCheck size={16} style={{ color: ageVerified ? 'var(--emerald-patina)' : 'var(--kinpaku-gold)' }} />
                <h3 className="rm-title" style={{ fontSize: 15, margin: 0 }}>
                  Xác thực độ tuổi 18+ (Age Verification)
                </h3>
                <span className={`badge tiny ${ageVerified ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 9.5 }}>
                  {ageVerified ? '🔞 ĐÃ XÁC THỰC 18+' : '🔒 CHƯA XÁC THỰC (DƯỚI 18)'}
                </span>
              </div>
              <p className="tiny muted" style={{ maxWidth: 520, lineHeight: 1.5 }}>
                {ageVerified 
                  ? 'Tài khoản của bạn đã được xác thực trên 18 tuổi. Bạn có quyền xem và bỏ làm mờ các nội dung / video 18+ trên bảng tin và RanVideo.'
                  : 'Hệ thống bảo vệ trẻ vị thành niên: Toàn bộ video và bài viết 18+ NSFW sẽ bị làm mờ bảo vệ cho đến khi bạn xác thực độ tuổi.'}
              </p>
            </div>

            <button
              type="button"
              className={`btn ${ageVerified ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: 'auto', padding: '7px 14px', fontSize: 11.5, borderRadius: 6 }}
              onClick={() => {
                const nextState = !ageVerified
                setAgeVerified(nextState)
                showToast(nextState ? 'Đã bật xác thực 18+! Hãy bấm "Lưu hồ sơ" để áp dụng.' : 'Đã tắt xác thực 18+!')
              }}
            >
              {ageVerified ? 'Tắt xác thực 18+' : '🔞 Xác thực tôi trên 18 tuổi'}
            </button>
          </div>
        </div>

        {/* MY UPLOADED CONTENT MANAGER */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 14, borderBottom: '1px solid var(--gold-hairline)', paddingBottom: 12 }}>
            <div className="flex items-center g8">
              <Sparkles size={16} style={{ color: 'var(--kinpaku-gold)' }} />
              <h2 className="rm-title" style={{ fontSize: 16, margin: 0 }}>
                {t('myContentTitle')} ({myVideos.length + myPosts.length})
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex g6">
              <button
                type="button"
                className={`chip ${activeContentTab === 'videos' ? 'selected' : ''}`}
                onClick={() => setActiveContentTab('videos')}
                style={{ padding: '5px 12px', fontSize: 11.5 }}
              >
                <VideoIcon size={12} /> {t('videosTab')} ({myVideos.length})
              </button>
              <button
                type="button"
                className={`chip ${activeContentTab === 'posts' ? 'selected' : ''}`}
                onClick={() => setActiveContentTab('posts')}
                style={{ padding: '5px 12px', fontSize: 11.5 }}
              >
                <Newspaper size={12} /> {t('postsTab')} ({myPosts.length})
              </button>
            </div>
          </div>

          {/* Tab Videos */}
          {activeContentTab === 'videos' && (
            <div>
              {myVideos.length === 0 ? (
                <div className="center-text tiny faint" style={{ padding: 20 }}>
                  {t('noMyVideos')}
                </div>
              ) : (
                <div className="flex col g8">
                  {myVideos.map((v) => (
                    <div key={v.id} className="card flex items-center justify-between" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                      <div className="flex items-center g10">
                        <div style={{ width: 38, height: 38, borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <VideoIcon size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                        </div>
                        <div>
                          <div className="semi small champagne">{v.caption}</div>
                          <div className="tiny faint rm-num">{v.tags?.join(' ')} · {new Date(v.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 30, height: 30, color: '#fb7185' }}
                        onClick={() => handleDeleteVideo(v.id)}
                        title="Delete video"
                      >
                        <Trash2 size={14} />
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
                <div className="center-text tiny faint" style={{ padding: 20 }}>
                  {t('noMyPosts')}
                </div>
              ) : (
                <div className="flex col g8">
                  {myPosts.map((p) => (
                    <div key={p.id} className="card flex items-center justify-between" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                      <div className="flex items-center g10">
                        <div style={{ width: 38, height: 38, borderRadius: 6, background: 'rgba(245,192,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Newspaper size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                        </div>
                        <div>
                          <div className="semi small champagne">{p.content?.slice(0, 50)}...</div>
                          <div className="tiny faint rm-num">{new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 30, height: 30, color: '#fb7185' }}
                        onClick={() => handleDeletePost(p.id)}
                        title="Delete post"
                      >
                        <Trash2 size={14} />
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
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--gold-hairline-strong)',
            padding: 18
          }}
        >
          <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
            <div>
              <div className="badge badge-gold tiny" style={{ marginBottom: 6 }}>
                {t('referralProgramBadge')}
              </div>
              <h3 className="rm-title" style={{ fontSize: 16, margin: 0 }}>
                {t('referralProgramTitle')}
              </h3>
              <p className="tiny muted" style={{ marginTop: 4 }}>
                {t('referralTiers')}
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: 'auto', padding: '6px 14px', fontSize: 11.5, borderRadius: 6 }}
              onClick={copyReferralLink}
            >
              {copiedLink ? <><Check size={13} style={{ color: 'var(--emerald-patina)' }} /> {t('copiedInviteLink')}</> : <><Copy size={13} /> {t('copyInviteLink')}</>}
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="flex justify-between tiny bold" style={{ marginBottom: 6 }}>
              <span>{t('progressLabel')} <b className="gold rm-num">{referralCount} {t('friendsCountSuffix')}</b></span>
              <span className="muted">{t('max10Friends')}</span>
            </div>
            <div className="compat-bar-track" style={{ height: 6 }}>
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

        {/* EDIT PROFILE DETAILS & TAGS */}
        <form onSubmit={handleSaveProfile} className="card flex col g16" style={{ padding: 22 }}>
          <div className="rm-title" style={{ fontSize: 16, borderBottom: '1px solid var(--gold-hairline)', paddingBottom: 10 }}>
            {t('profileFormTitle')}
          </div>

          <div className="field-group">
            <label className="field-label"><User size={13} /> {t('displayNameLabel')}</label>
            <input 
              className="input" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Display name..."
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label"><Globe size={13} /> {t('countryLabel')}</label>
            <input 
              className="input" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              placeholder="Country..."
            />
          </div>

          <div className="field-group">
            <label className="field-label"><MessageSquare size={13} /> {t('bioLabel')}</label>
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
              <label className="field-label"><Heart size={13} /> {t('interestsLabel')}</label>
              <span className="tiny faint flex items-center g4"><ShieldCheck size={11} style={{ color: 'var(--emerald-patina)' }} /> AI Active</span>
            </div>
            
            <div className="flex g6 items-center" style={{ marginBottom: 8 }}>
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
                style={{ width: 'auto', padding: '10px 14px', flexShrink: 0, borderRadius: 6 }}
                onClick={() => addInterest(customInterest)}
              >
                <Plus size={14} /> {t('addTagBtn')}
              </button>
            </div>

            {/* Current Selected Tags */}
            <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {interests.map((tItem) => (
                <span 
                  key={tItem} 
                  className="chip selected" 
                  style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{tItem}</span>
                  <X 
                    size={12} 
                    style={{ cursor: 'pointer', opacity: 0.8 }} 
                    onClick={() => removeInterest(tItem)}
                  />
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div>
              <div className="tiny faint" style={{ marginBottom: 4 }}>{t('quickSuggestLabel')}</div>
              <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                {SUGGESTED_INTERESTS.filter(s => !interests.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    style={{ padding: '3px 8px', fontSize: 11 }}
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
            <label className="field-label"><Sparkles size={13} /> {t('personalityLabel')}</label>
            <input 
              className="input" 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              placeholder="e.g. Chill, Friendly, Anime Lover, Tech Geek..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 6, padding: 12 }} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : t('saveAllChangesBtn')}
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
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--gold-hairline-strong)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65)',
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
