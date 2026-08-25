'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Music, Volume2, 
  VolumeX, Play, Plus, Sparkles, Flame, Eye, Compass, X, Upload, Video as VideoIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

export default function RanVideoPage() {
  const { t } = useLanguage()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [likedMap, setLikedMap] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({})
  
  // Comments modal state
  const [showComments, setShowComments] = useState(false)
  const [activeVideoComments, setActiveVideoComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [activeVideoId, setActiveVideoId] = useState(null)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFileName, setVideoFileName] = useState('')
  const [selectedVideoFile, setSelectedVideoFile] = useState(null)
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'url'
  const [newCaption, setNewCaption] = useState('')
  const [newTags, setNewTags] = useState('#trend, #ranmet')
  const [newSong, setNewSong] = useState('Original Sound - RanMet')
  const [isPosting, setIsPosting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [unblurredMap, setUnblurredMap] = useState({})
  
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const containerRef = useRef(null)
  const videoRefs = useRef([])
  const videoFileInputRef = useRef(null)
  const [supabase] = useState(() => createClient())

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Fetch videos from Supabase
  async function fetchVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      setVideos(data)
    } else {
      setVideos([])
    }
    setLoading(false)
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (prof) setUserProfile(prof)
      }
    }
    loadUser()
    fetchVideos()

    const channel = supabase
      .channel('ranvideo-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'videos' }, (payload) => {
        setVideos((prev) => [payload.new, ...prev.filter(v => v.id !== payload.new.id)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Direct Device Video Pick
  async function handleDeviceVideoPick(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showToast('Đang đọc video từ thiết bị...')
      const res = await readFileAsDataUrl(file, 100)
      setSelectedVideoFile(file)
      setVideoUrl(res.url) // For immediate local preview in modal
      setVideoFileName(res.name)
      showToast('Đã chọn video từ máy! Hãy nhập mô tả và bấm Đăng.')
    } catch (err) {
      showToast(err.message)
    }
  }

  // Handle Post Video with Supabase Storage & AI Safety Check
  async function handlePostVideo(e) {
    e.preventDefault()
    if ((!selectedVideoFile && !videoUrl.trim()) || isPosting) return

    const cleanCaption = newCaption.trim()
    if (!cleanCaption) {
      showToast('Vui lòng nhập mô tả cho video!')
      return
    }

    setIsPosting(true)
    showToast('AI đang kiểm duyệt nội dung video... 🧠')

    // 1. AI & DEEP SLANG MODERATION CHECK ON TEXT
    const captionCheck = await checkContent(cleanCaption)
    let isNsfw = false

    if (!captionCheck.isSafe) {
      if (captionCheck.reason?.includes('18+') || captionCheck.reason?.includes('nhạy cảm') || captionCheck.reason?.includes('thô tục')) {
        isNsfw = true
      } else {
        showToast(`Mô tả video bị từ chối: Vi phạm an toàn cộng đồng! ⚠️`)
        setIsPosting(false)
        return
      }
    }

    const rawTags = newTags.split(/[\s,]+/).map(t => t.startsWith('#') ? t : `#${t}`).filter(t => t.length > 1)
    const tagsCheck = await checkTags(rawTags)
    if (tagsCheck.hasBlocked) {
      isNsfw = true
    }

    // 2. AI MULTIMODAL VISION CHECK (QUÉT TỪNG KHUNG HÌNH VIDEO PHÂN LOẠI 18+ / NSFW)
    showToast('AI Vision đang quét hình ảnh video kiểm tra 18+... 👁️')
    try {
      const { checkVideoVisualSafety } = await import('@/lib/videoInspector')
      const visualCheck = await checkVideoVisualSafety(selectedVideoFile || videoUrl)
      if (!visualCheck.isAllowed) {
        showToast(`Video bị AI từ chối: ${visualCheck.reason || 'Nội dung bạo lực / nguy hiểm!'} ⚠️`)
        setIsPosting(false)
        return
      }
      if (visualCheck.isNsfw) {
        isNsfw = true
        showToast('AI phát hiện nội dung 18+ — Đã gắn nhãn NSFW và kích hoạt làm mờ bảo vệ! 🔞')
      }
    } catch (visErr) {
      console.warn('Vision check warning:', visErr)
    }

    const { data: { user } } = await supabase.auth.getUser()
    const activeUid = currentUserId || user?.id || null

    let finalVideoCdnUrl = videoUrl.trim()

    // If uploading a real binary file, upload to Supabase Storage CDN first!
    if (selectedVideoFile) {
      try {
        showToast('Đang tải video lên Supabase Storage CDN... 🚀')
        const { uploadMediaToSupabase } = await import('@/lib/upload')
        const storageResult = await uploadMediaToSupabase(supabase, selectedVideoFile, 'videos', activeUid || 'guest')
        finalVideoCdnUrl = storageResult.url
      } catch (uploadErr) {
        console.warn('Storage upload error, checking direct url fallback:', uploadErr)
        showToast(uploadErr.message || 'Lỗi tải video lên Supabase Storage')
        setIsPosting(false)
        return
      }
    }

    showToast('Đang lưu bài đăng video vào hệ thống...')

    const newVid = {
      creator_id: activeUid,
      creator_name: userProfile?.display_name || 'RanMet Creator',
      creator_handle: `@${(userProfile?.display_name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
      avatar_letter: (userProfile?.display_name || 'R').charAt(0).toUpperCase(),
      caption: cleanCaption,
      video_url: finalVideoCdnUrl,
      song_title: newSong.trim() || 'Original Sound - RanMet',
      tags: tagsCheck.safeTags,
      is_nsfw: isNsfw
    }

    const { data, error } = await supabase.from('videos').insert(newVid).select().single()

    setIsPosting(false)

    if (error) {
      showToast('Lỗi đăng video: ' + error.message)
    } else {
      setShowUploadModal(false)
      setVideoUrl('')
      setVideoFileName('')
      setSelectedVideoFile(null)
      setNewCaption('')
      showToast('Đã đăng video thành công lên RanVideo! ✨')
      if (data) {
        setVideos((prev) => [data, ...prev.filter(v => v.id !== data.id)])
      }
    }
  }

  // Toggle Like
  async function toggleLike(videoId) {
    const isLiked = likedMap[videoId]
    const currentCount = likesCountMap[videoId] || 0

    setLikedMap((prev) => ({ ...prev, [videoId]: !isLiked }))
    setLikesCountMap((prev) => ({ ...prev, [videoId]: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1 }))

    if (!currentUserId) return

    if (isLiked) {
      await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', currentUserId)
    } else {
      await supabase.from('video_likes').insert({ video_id: videoId, user_id: currentUserId })
    }
  }

  // Open Comments
  async function openComments(videoId) {
    setActiveVideoId(videoId)
    setShowComments(true)
    const { data } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true })
    setActiveVideoComments(data || [])
  }

  // Post Comment with AI Moderation
  async function handleSendComment(e) {
    e.preventDefault()
    if (!newComment.trim() || !activeVideoId) return

    const modCheck = await checkContent(newComment.trim())
    if (!modCheck.isSafe) {
      showToast('Bình luận vi phạm tiêu chuẩn an toàn cộng đồng!')
      return
    }

    const authorName = userProfile?.display_name || 'User'
    const newCommentObj = {
      video_id: activeVideoId,
      user_id: currentUserId,
      user_name: authorName,
      content: newComment.trim()
    }

    setActiveVideoComments((prev) => [...prev, { ...newCommentObj, id: Date.now(), created_at: new Date().toISOString() }])
    setNewComment('')

    await supabase.from('video_comments').insert(newCommentObj)
  }

  return (
    <AppShell>
      <div 
        className="flex justify-between items-center" 
        style={{ 
          maxWidth: 480, 
          margin: '0 auto 12px', 
          padding: '0 8px'
        }}
      >
        <div className="flex items-center g8">
          <Flame size={20} style={{ color: '#f43f5e' }} />
          <h1 className="rm-title" style={{ fontSize: 20, color: '#fff' }}>{t('ranVideoTitle')}</h1>
          <span className="badge badge-glow tiny" style={{ fontSize: 9 }}>REALTIME</span>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: 'auto', padding: '8px 16px', fontSize: 12, borderRadius: 999 }}
          onClick={() => setShowUploadModal(true)}
        >
          <Plus size={15} /> {t('uploadNewVideo')}
        </button>
      </div>

      {/* FEED CONTAINER */}
      <div 
        ref={containerRef}
        className="tiktok-container"
        style={{ 
          maxWidth: 480, 
          margin: '0 auto', 
          height: 'calc(100vh - 150px)', 
          minHeight: 580,
          background: '#000',
          borderRadius: 24,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {loading ? (
          <div className="flex col items-center justify-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
            <div className="tiny bold">Connecting to RanVideo...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex col items-center justify-center center-text" style={{ height: '100%', padding: 24 }}>
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
              <VideoIcon size={30} style={{ color: '#f43f5e' }} />
            </div>
            <h3 className="rm-title" style={{ fontSize: 18, marginBottom: 6 }}>{t('noVideosYet')}</h3>
            <p className="tiny muted" style={{ maxWidth: 300, marginBottom: 20, lineHeight: 1.5 }}>
              {t('firstVideoPrompt')}
            </p>
            <button 
              type="button" 
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={16} /> {t('uploadFirstVideoBtn')}
            </button>
          </div>
        ) : (
          videos.map((vid, idx) => {
            const isLiked = !!likedMap[vid.id]
            const likesCount = (likesCountMap[vid.id] || 0)
            const isVideoNsfw = !!vid.is_nsfw || (vid.tags && vid.tags.some(t => /18|nsfw|sex|porn|hentai/i.test(t)))
            const isUserAdult = !!userProfile?.age_verified
            const isUnblurred = !!unblurredMap[vid.id]
            const shouldBlur = isVideoNsfw && (!isUserAdult || !isUnblurred)

            return (
              <div 
                key={vid.id}
                className="tiktok-card"
                style={{
                  height: '100%',
                  width: '100%',
                  scrollSnapAlign: 'start',
                  position: 'relative',
                  background: '#0a0a0c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {/* VIDEO ELEMENT WITH 18+ BLUR */}
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={vid.video_url}
                  className="tiktok-video"
                  loop
                  muted={muted}
                  playsInline
                  autoPlay={idx === 0 && !shouldBlur}
                  controls={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: shouldBlur ? 'blur(45px) brightness(0.6)' : 'none',
                    transform: shouldBlur ? 'scale(1.15)' : 'none',
                    transition: 'filter 0.4s ease, transform 0.4s ease'
                  }}
                  onClick={() => {
                    if (shouldBlur) return
                    const el = videoRefs.current[idx]
                    if (el) {
                      if (el.paused) el.play()
                      else el.pause()
                    }
                  }}
                />

                {/* 18+ NSFW AGE GATE OVERLAY */}
                {shouldBlur && (
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10, 10, 16, 0.8)',
                      backdropFilter: 'blur(16px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                      textAlign: 'center',
                      zIndex: 8,
                      animation: 'msgPop 0.3s ease'
                    }}
                  >
                    <div 
                      style={{ 
                        width: 58, 
                        height: 58, 
                        borderRadius: '50%', 
                        background: 'rgba(236, 72, 153, 0.2)', 
                        border: '2px solid rgba(236, 72, 153, 0.6)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: 26,
                        marginBottom: 12,
                        boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)'
                      }}
                    >
                      🔞
                    </div>
                    <div className="rm-title" style={{ fontSize: 18, color: '#f43f5e', marginBottom: 6 }}>
                      NỘI DUNG 18+ NHẠY CẢM (NSFW)
                    </div>
                    <p className="tiny muted" style={{ maxWidth: 280, lineHeight: 1.5, marginBottom: 16 }}>
                      {!isUserAdult 
                        ? 'Video này chứa hình ảnh 18+ và đã được AI tự động làm mờ bảo vệ. Bạn cần xác thực trên 18 tuổi trong Hồ Sơ để mở khóa xem.'
                        : 'Video chứa hình ảnh 18+. Bạn đã xác thực đủ 18 tuổi.'}
                    </p>

                    {!isUserAdult ? (
                      <Link 
                        href="/profile" 
                        className="btn btn-secondary" 
                        style={{ width: 'auto', padding: '10px 20px', fontSize: 12, borderRadius: 999, borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f43f5e' }}
                      >
                        🛡️ Xác thực 18+ trong Hồ Sơ
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '10px 22px', fontSize: 13, borderRadius: 999 }}
                        onClick={() => {
                          setUnblurredMap((prev) => ({ ...prev, [vid.id]: true }))
                          const el = videoRefs.current[idx]
                          if (el) el.play()
                        }}
                      >
                        👁️ Mở khóa xem video
                      </button>
                    )}
                  </div>
                )}

                {/* OVERLAY GRADIENT */}
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* 18+ Re-blur Toggle for Adult Users */}
                {isVideoNsfw && isUserAdult && isUnblurred && (
                  <button
                    type="button"
                    onClick={() => setUnblurredMap((prev) => ({ ...prev, [vid.id]: false }))}
                    style={{
                      position: 'absolute',
                      top: 18,
                      right: 18,
                      background: 'rgba(236, 72, 153, 0.25)',
                      border: '1px solid rgba(236, 72, 153, 0.5)',
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    🔞 Làm mờ lại
                  </button>
                )}

                {/* SOUND TOGGLE */}
                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: 18,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* RIGHT ACTION BAR */}
                <div 
                  className="tiktok-actions"
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    zIndex: 10
                  }}
                >
                  {/* Creator Avatar */}
                  <div style={{ position: 'relative', marginBottom: 4 }}>
                    <div 
                      className="avatar" 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        fontSize: 16, 
                        border: '2px solid #fff',
                        background: 'var(--brand-gradient)'
                      }}
                    >
                      {vid.avatar_letter}
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => toggleLike(vid.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLiked ? '#f43f5e' : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: 4
                    }}
                  >
                    <div 
                      style={{ 
                        width: 42, 
                        height: 42, 
                        borderRadius: '50%', 
                        background: 'rgba(0,0,0,0.4)', 
                        backdropFilter: 'blur(8px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <Heart size={22} fill={isLiked ? '#f43f5e' : 'none'} />
                    </div>
                    <span className="tiny bold" style={{ color: '#fff' }}>{likesCount}</span>
                  </button>

                  {/* Comments Button */}
                  <button
                    type="button"
                    onClick={() => openComments(vid.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: 4
                    }}
                  >
                    <div 
                      style={{ 
                        width: 42, 
                        height: 42, 
                        borderRadius: '50%', 
                        background: 'rgba(0,0,0,0.4)', 
                        backdropFilter: 'blur(8px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <MessageCircle size={22} />
                    </div>
                    <span className="tiny bold" style={{ color: '#fff' }}>{t('commentsLabel')}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: vid.caption, url: window.location.href })
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                        showToast('Link copied!')
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: 4
                    }}
                  >
                    <div 
                      style={{ 
                        width: 42, 
                        height: 42, 
                        borderRadius: '50%', 
                        background: 'rgba(0,0,0,0.4)', 
                        backdropFilter: 'blur(8px)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <Share2 size={20} />
                    </div>
                    <span className="tiny bold" style={{ color: '#fff' }}>{t('shareLabel')}</span>
                  </button>
                </div>

                {/* BOTTOM INFO */}
                <div 
                  className="tiktok-meta"
                  style={{
                    position: 'absolute',
                    left: 18,
                    bottom: 24,
                    right: 76,
                    color: '#fff',
                    zIndex: 10
                  }}
                >
                  <div className="semi" style={{ fontSize: 16, marginBottom: 4, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {vid.creator_name} <span className="tiny faint" style={{ color: 'rgba(255,255,255,0.7)' }}>{vid.creator_handle}</span>
                  </div>
                  <div className="small" style={{ lineHeight: 1.4, marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {vid.caption}
                  </div>
                  
                  {vid.tags && (
                    <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {vid.tags.map((t, i) => (
                        <span key={i} className="tiny bold" style={{ color: '#ec4899' }}>{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="tiny faint flex items-center g6" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    <Music size={13} /> {vid.song_title}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* UPLOAD VIDEO MODAL */}
      {showUploadModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 460, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="flex items-center g8">
                <Sparkles size={20} style={{ color: '#f43f5e' }} />
                <h2 className="rm-title" style={{ fontSize: 18 }}>{t('uploadNewVideo')}</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="btn-icon" 
                style={{ width: 32, height: 32 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload Method Switcher */}
            <div className="flex g8" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 999 }}
                onClick={() => setUploadMode('file')}
              >
                <Upload size={14} /> Tải từ máy
              </button>
              <button
                type="button"
                className={`btn ${uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 999 }}
                onClick={() => setUploadMode('url')}
              >
                <VideoIcon size={14} /> Dán link Video
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div style={{ marginBottom: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '18px', borderStyle: 'dashed', width: '100%', borderRadius: 16 }}
                  onClick={() => videoFileInputRef.current?.click()}
                >
                  <Upload size={22} style={{ color: '#f43f5e' }} /> 
                  {videoFileName ? `✓ ${videoFileName}` : 'Chọn video từ máy (MP4/WebM)'}
                </button>
                <input 
                  type="file" 
                  ref={videoFileInputRef} 
                  accept="video/mp4,video/webm,video/quicktime,video/*" 
                  style={{ display: 'none' }} 
                  onChange={handleDeviceVideoPick} 
                />
              </div>
            ) : (
              <div className="field-group" style={{ marginBottom: 14 }}>
                <label className="field-label">Đường dẫn Video Trực Tiếp (Direct MP4 URL) *</label>
                <input
                  className="input"
                  placeholder="https://assets.mixkit.co/.../video.mp4"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value)
                    setSelectedVideoFile(null)
                    setVideoFileName('')
                  }}
                  required
                />
              </div>
            )}

            {videoUrl && (
              <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', maxHeight: 180, background: '#000' }}>
                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 180 }} />
              </div>
            )}

            <form onSubmit={handlePostVideo} className="flex col g14">
              <div className="field-group">
                <label className="field-label">{t('captionLabel')}</label>
                <textarea 
                  className="input" 
                  rows={2} 
                  placeholder={t('captionPlaceholder')}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">{t('hashtagsLabel')}</label>
                <input 
                  className="input" 
                  placeholder="#gaming, #vlog, #music"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: 6 }}
                disabled={(!videoUrl.trim() && !selectedVideoFile) || isPosting}
              >
                {isPosting ? 'Đang tải lên & Đăng bài...' : t('postVideoBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {showComments && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setShowComments(false)}
        >
          <div 
            className="card" 
            style={{ 
              width: '100%', 
              maxWidth: 480, 
              height: '65vh', 
              padding: 0, 
              borderBottomLeftRadius: 0, 
              borderBottomRightRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              animation: 'msgPop 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="semi" style={{ fontSize: 16 }}>{t('commentsLabel')} ({activeVideoComments.length})</div>
              <button type="button" onClick={() => setShowComments(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                <X size={16} />
              </button>
            </div>

            <div className="grow" style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeVideoComments.length === 0 ? (
                <div className="center-text tiny faint" style={{ margin: 'auto 0' }}>
                  No comments yet.
                </div>
              ) : (
                activeVideoComments.map((c) => (
                  <div key={c.id} className="flex g10 items-start">
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: 'var(--brand-gradient)', flexShrink: 0 }}>
                      {c.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="semi tiny" style={{ color: '#fff' }}>{c.user_name}</div>
                      <div className="small" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{c.content}</div>
                      <div className="tiny faint" style={{ marginTop: 4 }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendComment} className="flex g10" style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
              <input
                className="input"
                placeholder={t('writeCommentPlaceholder')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ borderRadius: 999 }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 999 }}>
                Send
              </button>
            </form>
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
