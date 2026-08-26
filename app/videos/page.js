'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Music, Volume2, 
  VolumeX, Play, Pause, Plus, Flame, X, Upload, Video as VideoIcon,
  ChevronUp, ChevronDown, CheckCircle, ShieldCheck, Sparkles, Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

export default function RanVideoPage() {
  const { t } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  
  // Likes & Comments
  const [likedMap, setLikedMap] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({})
  const [commentsMap, setCommentsMap] = useState({})
  const [newCommentText, setNewCommentText] = useState('')
  const [showMobileComments, setShowMobileComments] = useState(false)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFileName, setVideoFileName] = useState('')
  const [selectedVideoFile, setSelectedVideoFile] = useState(null)
  const [uploadMode, setUploadMode] = useState('file')
  const [newCaption, setNewCaption] = useState('')
  const [newTags, setNewTags] = useState('#trend, #ranmet')
  const [newSong, setNewSong] = useState('Original Sound - RanMet')
  const [isPosting, setIsPosting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [unblurredMap, setUnblurredMap] = useState({})
  
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const videoRef = useRef(null)
  const videoFileInputRef = useRef(null)
  const commentsScrollRef = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Fetch videos from Supabase
  async function fetchVideos() {
    const { data } = await supabase
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

  // Fetch comments for current active video
  async function fetchCurrentComments(vidId) {
    if (!vidId) return
    const { data } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', vidId)
      .order('created_at', { ascending: true })

    setCommentsMap((prev) => ({ ...prev, [vidId]: data || [] }))
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'video_comments' }, (payload) => {
        setCommentsMap((prev) => ({
          ...prev,
          [payload.new.video_id]: [...(prev[payload.new.video_id] || []), payload.new]
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const currentVideo = videos[currentIndex] || null

  useEffect(() => {
    if (currentVideo?.id) {
      fetchCurrentComments(currentVideo.id)
    }
    setProgress(0)
    setIsPlaying(true)
  }, [currentIndex, currentVideo?.id])

  // Keyboard navigation (Up/Down arrow, Space, M)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        handleNextVideo()
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        handlePrevVideo()
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlayPause()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setMuted((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, videos.length])

  function handleNextVideo() {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      showToast('Đã đến video cuối cùng!')
    }
  }

  function handlePrevVideo() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  function togglePlayPause() {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || 1
    setProgress((cur / dur) * 100)
  }

  // Direct Device Video Pick
  async function handleDeviceVideoPick(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showToast('Đang đọc video từ thiết bị...')
      const res = await readFileAsDataUrl(file, 100)
      setSelectedVideoFile(file)
      setVideoUrl(res.url)
      setVideoFileName(res.name)
      showToast('Đã chọn video từ máy! Hãy nhập mô tả và bấm Đăng.')
    } catch (err) {
      showToast(err.message)
    }
  }

  // Post Video
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

    // AI Vision check
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

    if (selectedVideoFile) {
      try {
        showToast('Đang tải video lên CDN... 🚀')
        const { uploadMediaToSupabase } = await import('@/lib/upload')
        const storageResult = await uploadMediaToSupabase(supabase, selectedVideoFile, 'videos', activeUid || 'guest')
        finalVideoCdnUrl = storageResult.url
      } catch (uploadErr) {
        showToast(uploadErr.message || 'Lỗi tải video lên storage')
        setIsPosting(false)
        return
      }
    }

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

  // Post Comment
  async function handleSendComment(e) {
    e.preventDefault()
    if (!newCommentText.trim() || !currentVideo?.id) return

    const modCheck = await checkContent(newCommentText.trim())
    if (!modCheck.isSafe) {
      showToast('Bình luận vi phạm tiêu chuẩn an toàn cộng đồng!')
      return
    }

    const authorName = userProfile?.display_name || 'User'
    const newCommentObj = {
      video_id: currentVideo.id,
      user_id: currentUserId,
      user_name: authorName,
      content: newCommentText.trim()
    }

    setCommentsMap((prev) => ({
      ...prev,
      [currentVideo.id]: [...(prev[currentVideo.id] || []), { ...newCommentObj, id: Date.now(), created_at: new Date().toISOString() }]
    }))
    setNewCommentText('')

    await supabase.from('video_comments').insert(newCommentObj)
  }

  const isVideoNsfw = !!currentVideo?.is_nsfw || (currentVideo?.tags && currentVideo?.tags.some(t => /18|nsfw|sex|porn|hentai/i.test(t)))
  const isUserAdult = !!userProfile?.age_verified
  const isUnblurred = currentVideo ? !!unblurredMap[currentVideo.id] : false
  const shouldBlur = isVideoNsfw && (!isUserAdult || !isUnblurred)

  const activeComments = currentVideo ? (commentsMap[currentVideo.id] || []) : []
  const isLiked = currentVideo ? !!likedMap[currentVideo.id] : false
  const likesCount = currentVideo ? (likesCountMap[currentVideo.id] || 0) : 0

  return (
    <AppShell>
      {/* TOP HEADER BAR */}
      <div className="flex justify-between items-center" style={{ maxWidth: 1100, margin: '0 auto 16px' }}>
        <div className="flex items-center g10">
          <Flame size={20} style={{ color: 'var(--kinpaku-gold)' }} />
          <div>
            <h1 className="rm-title" style={{ fontSize: 20, margin: 0 }}>RanVideo Cinema</h1>
            <div className="tiny faint rm-num">
              Video {videos.length > 0 ? currentIndex + 1 : 0} / {videos.length} · Dùng phím ↑ ↓ hoặc Space để điều khiển
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: 'auto', padding: '7px 16px', fontSize: 12.5 }}
          onClick={() => setShowUploadModal(true)}
        >
          <Plus size={15} /> {t('uploadNewVideo')}
        </button>
      </div>

      {loading ? (
        <div className="card center-text" style={{ padding: 60, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny muted">Đang kết nối kho RanVideo...</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="card flex col items-center center-text" style={{ padding: 60, maxWidth: 500, margin: '40px auto' }}>
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
              marginBottom: 16,
              color: 'var(--kinpaku-gold)'
            }} 
          >
            <VideoIcon size={28} />
          </div>
          <h3 className="rm-title" style={{ fontSize: 18, marginBottom: 6 }}>{t('noVideosYet')}</h3>
          <p className="small muted" style={{ marginBottom: 20, lineHeight: 1.5 }}>
            {t('firstVideoPrompt')}
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={15} /> {t('uploadFirstVideoBtn')}
          </button>
        </div>
      ) : (
        /* THEATER SPLIT VIEW DESKTOP CONTAINER */
        <div className="theater-container">
          {/* LEFT: CINEMA VIDEO PLAYER STAGE */}
          <div className="theater-stage">
            <video
              ref={videoRef}
              src={currentVideo?.video_url}
              loop
              muted={muted}
              playsInline
              autoPlay={!shouldBlur}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlayPause}
              style={{
                filter: shouldBlur ? 'blur(45px) brightness(0.55)' : 'none',
                transform: shouldBlur ? 'scale(1.12)' : 'none',
                transition: 'filter 0.35s ease, transform 0.35s ease'
              }}
            />

            {/* 18+ NSFW AGE GATE OVERLAY */}
            {shouldBlur && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10, 8, 14, 0.86)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  textAlign: 'center',
                  zIndex: 10
                }}
              >
                <div 
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: '50%', 
                    background: 'rgba(244, 63, 94, 0.15)', 
                    border: '1.5px solid rgba(244, 63, 94, 0.4)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 12
                  }}
                >
                  🔞
                </div>
                <div className="rm-title" style={{ fontSize: 18, color: '#f43f5e', marginBottom: 6 }}>
                  NỘI DUNG 18+ NHẠY CẢM (NSFW)
                </div>
                <p className="tiny muted" style={{ maxWidth: 300, lineHeight: 1.55, marginBottom: 18 }}>
                  {!isUserAdult 
                    ? 'Video này chứa nội dung 18+ và đã được AI làm mờ bảo vệ. Bạn cần xác thực trên 18 tuổi trong Hồ Sơ để mở khóa xem.'
                    : 'Video chứa hình ảnh 18+. Bạn đã xác thực đủ 18 tuổi.'}
                </p>

                {!isUserAdult ? (
                  <Link 
                    href="/profile" 
                    className="btn btn-secondary" 
                    style={{ width: 'auto', padding: '9px 18px', fontSize: 12, borderRadius: 8, borderColor: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e' }}
                  >
                    🛡️ Xác thực 18+ trong Hồ Sơ
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '9px 20px', fontSize: 12.5 }}
                    onClick={() => {
                      setUnblurredMap((prev) => ({ ...prev, [currentVideo.id]: true }))
                      if (videoRef.current) videoRef.current.play()
                    }}
                  >
                    👁️ Mở khóa xem video
                  </button>
                )}
              </div>
            )}

            {/* PLAYER OVERLAY CONTROLS */}
            <div 
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 5
              }}
            >
              <button
                type="button"
                className="btn-icon"
                style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                onClick={() => setMuted(!muted)}
                title="Bật/Tắt âm thanh (Phím M)"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                type="button"
                className="btn-icon"
                style={{ width: 34, height: 34, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                onClick={togglePlayPause}
                title="Phát/Tạm dừng (Phím Space)"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            {/* FLOATING VERTICAL NEXT / PREV BUTTONS */}
            <div 
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 5
              }}
            >
              <button
                type="button"
                className="btn-icon"
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
                onClick={handlePrevVideo}
                disabled={currentIndex === 0}
                title="Video trước (Phím ↑)"
              >
                <ChevronUp size={20} />
              </button>
              <button
                type="button"
                className="btn-icon"
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
                onClick={handleNextVideo}
                disabled={currentIndex === videos.length - 1}
                title="Video tiếp theo (Phím ↓)"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* SCRUB PROGRESS BAR */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'rgba(255,255,255,0.15)',
                zIndex: 5
              }}
            >
              <div 
                style={{
                  height: '100%',
                  background: 'var(--gold-gradient)',
                  transform: `scaleX(${progress / 100})`,
                  transformOrigin: 'left center',
                  transition: 'transform 0.1s linear'
                }} 
              />
            </div>
          </div>

          {/* RIGHT: INTERACTIVE CREATOR & COMMENTS PANEL */}
          <div className="theater-panel">
            {/* 1. CREATOR HEADER */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--gold-hairline)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <div className="flex items-center g10">
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
                    {currentVideo?.avatar_letter || 'R'}
                  </div>
                  <div>
                    <div className="semi champagne" style={{ fontSize: 15 }}>{currentVideo?.creator_name}</div>
                    <div className="tiny faint">{currentVideo?.creator_handle}</div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', padding: '5px 12px', fontSize: 11.5 }}
                  onClick={() => showToast('Đã theo dõi creator!')}
                >
                  + Follow
                </button>
              </div>

              {/* Caption & Tags */}
              <div className="small champagne" style={{ lineHeight: 1.5, marginBottom: 8 }}>
                {currentVideo?.caption}
              </div>

              {currentVideo?.tags && currentVideo?.tags.length > 0 && (
                <div className="flex" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {currentVideo.tags.map((tg, i) => (
                    <span key={i} className="tiny gold" style={{ fontWeight: 600 }}>{tg}</span>
                  ))}
                </div>
              )}

              <div className="tiny faint flex items-center g4">
                <Music size={12} style={{ color: 'var(--kinpaku-gold)' }} /> {currentVideo?.song_title}
              </div>

              {/* Quick Actions (Like & Share) */}
              <div className="flex items-center g10" style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--gold-hairline)' }}>
                <button
                  type="button"
                  className="btn-secondary flex items-center g6"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 13,
                    background: isLiked ? 'rgba(245, 192, 66, 0.12)' : 'var(--inset-lacquer)',
                    color: isLiked ? 'var(--kinpaku-gold)' : 'var(--champagne)'
                  }}
                  onClick={() => currentVideo && toggleLike(currentVideo.id)}
                >
                  <Heart size={16} fill={isLiked ? 'var(--kinpaku-gold)' : 'none'} />
                  <span className="bold rm-num">{likesCount}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary flex items-center g6"
                  style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13 }}
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href)
                      showToast('Đã sao chép link video! 📋')
                    }
                  }}
                >
                  <Share2 size={16} /> Chia sẻ
                </button>

                {isVideoNsfw && isUserAdult && isUnblurred && (
                  <button
                    type="button"
                    className="btn-secondary tiny"
                    style={{ padding: '6px 10px', borderRadius: 6, marginLeft: 'auto', color: '#fb7185' }}
                    onClick={() => setUnblurredMap((prev) => ({ ...prev, [currentVideo.id]: false }))}
                  >
                    🔞 Làm mờ
                  </button>
                )}
              </div>
            </div>

            {/* 2. REAL-TIME COMMENTS STREAM */}
            <div 
              ref={commentsScrollRef} 
              className="grow" 
              style={{ 
                overflowY: 'auto', 
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div className="tiny bold faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                Bình luận ({activeComments.length})
              </div>

              {activeComments.length === 0 ? (
                <div className="center-text tiny faint" style={{ margin: 'auto 0' }}>
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </div>
              ) : (
                activeComments.map((c) => (
                  <div key={c.id} className="flex g8 items-start">
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                      {(c.user_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ background: 'var(--lacquer-deep)', padding: '8px 12px', borderRadius: 8, grow: 1, width: '100%', border: '1px solid var(--gold-hairline)' }}>
                      <div className="flex justify-between items-center">
                        <span className="semi tiny gold">{c.user_name}</span>
                        <span className="tiny faint rm-num" style={{ fontSize: 9.5 }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="small champagne" style={{ marginTop: 2 }}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. STICKY COMMENT INPUT DOCK */}
            <form 
              onSubmit={handleSendComment} 
              className="flex g8 items-center" 
              style={{ padding: '12px 16px', borderTop: '1px solid var(--gold-hairline)', background: 'var(--lacquer-deep)' }}
            >
              <input
                className="input"
                placeholder="Thêm bình luận cho video này..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{ padding: '9px 14px', fontSize: 13, borderRadius: 6 }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: 36, height: 36, borderRadius: 6, padding: 0, flexShrink: 0 }}
                disabled={!newCommentText.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD VIDEO MODAL */}
      {showUploadModal && (
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
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 460, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <div className="flex items-center g8">
                <VideoIcon size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                <h2 className="rm-title" style={{ fontSize: 17 }}>{t('uploadNewVideo')}</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="btn-icon" 
                style={{ width: 28, height: 28 }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Upload Method Switcher */}
            <div className="flex g6" style={{ marginBottom: 14 }}>
              <button
                type="button"
                className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '7px 10px', fontSize: 11.5, borderRadius: 6 }}
                onClick={() => setUploadMode('file')}
              >
                <Upload size={13} /> Tải từ máy
              </button>
              <button
                type="button"
                className={`btn ${uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '7px 10px', fontSize: 11.5, borderRadius: 6 }}
                onClick={() => setUploadMode('url')}
              >
                <VideoIcon size={13} /> Dán link Video
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '16px', borderStyle: 'dashed', width: '100%', borderRadius: 8 }}
                  onClick={() => videoFileInputRef.current?.click()}
                >
                  <Upload size={18} style={{ color: 'var(--kinpaku-gold)' }} /> 
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
              <div className="field-group" style={{ marginBottom: 12 }}>
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
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', maxHeight: 160, background: '#000' }}>
                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 160 }} />
              </div>
            )}

            <form onSubmit={handlePostVideo} className="flex col g12">
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
                style={{ marginTop: 4 }}
                disabled={(!videoUrl.trim() && !selectedVideoFile) || isPosting}
              >
                {isPosting ? 'Đang tải lên & Đăng bài...' : t('postVideoBtn')}
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
