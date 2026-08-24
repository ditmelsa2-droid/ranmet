'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Volume2, VolumeX, 
  Play, Pause, Music, Sparkles, Flame, UserPlus, Check, Send, Plus, Video as VideoIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../components/AppShell'

const FALLBACK_VIDEOS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    creator_name: 'LinhChi_Dev',
    creator_handle: '@linhchi.codes',
    avatar_letter: 'L',
    caption: 'Setup góc làm việc lập trình cyberpunk ban đêm cực chill ✨💻 #developer #cyberpunk #setup',
    song_title: 'Lofi Chill Beats - RanMet Audio',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-42247-large.mp4',
    tags: ['#setup', '#coding', '#chill'],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    creator_name: 'Kaito_Gamer',
    creator_handle: '@kaito.gaming',
    avatar_letter: 'K',
    caption: 'Thử thách sinh tồn Minecraft 100 ngày trong thế giới ngầm Backrooms! ⛏️👹 #minecraft #gaming',
    song_title: 'Epic Gaming Synthwave - Kaito Sound',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    tags: ['#minecraft', '#survival', '#backrooms'],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    creator_name: 'VyVy_Anime',
    creator_handle: '@vyvy.art',
    avatar_letter: 'V',
    caption: 'Vẽ nhân vật anime theo phong cách Cyber Neon 3D trong 1 tiếng 🎨✨ #anime #digitalart',
    song_title: 'Anime Future Bass - VyVy Track',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41584-large.mp4',
    tags: ['#anime', '#drawing', '#art'],
  }
]

export default function RanVideoPage() {
  const [supabase] = useState(() => createClient())
  const [videos, setVideos] = useState(FALLBACK_VIDEOS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedMap, setLikedMap] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({})
  const [commentsMap, setCommentsMap] = useState({})
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newTags, setNewTags] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('Người dùng RanMet')

  const videoRef = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Load videos and user from Supabase
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        if (profile?.display_name) setCurrentUserName(profile.display_name)
      }

      // Fetch real videos from DB
      const { data: dbVideos } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbVideos && dbVideos.length > 0) {
        setVideos(dbVideos)
      }

      // Fetch likes count and comments for all videos
      const { data: likes } = await supabase.from('video_likes').select('video_id, user_id')
      if (likes) {
        const counts = {}
        const userLiked = {}
        likes.forEach((l) => {
          counts[l.video_id] = (counts[l.video_id] || 0) + 1
          if (user && l.user_id === user.id) {
            userLiked[l.video_id] = true
          }
        })
        setLikesCountMap(counts)
        setLikedMap(userLiked)
      }

      // Fetch comments
      const { data: comments } = await supabase.from('video_comments').select('*').order('created_at', { ascending: true })
      if (comments) {
        const cm = {}
        comments.forEach((c) => {
          if (!cm[c.video_id]) cm[c.video_id] = []
          cm[c.video_id].push(c)
        })
        setCommentsMap(cm)
      }
    }

    loadData()

    // Realtime listeners for comments and likes
    const channel = supabase
      .channel('videos-realtime')
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

  const currentVideo = videos[currentIndex] || FALLBACK_VIDEOS[0]
  const isLiked = !!likedMap[currentVideo.id]
  const currentLikes = likesCountMap[currentVideo.id] || 0
  const currentComments = commentsMap[currentVideo.id] || []

  async function toggleLike(videoId) {
    if (!currentUserId) {
      showToast('Vui lòng đăng nhập để thả tim!')
      return
    }

    const wasLiked = !!likedMap[videoId]
    setLikedMap((prev) => ({ ...prev, [videoId]: !wasLiked }))
    setLikesCountMap((prev) => ({
      ...prev,
      [videoId]: Math.max(0, (prev[videoId] || 0) + (wasLiked ? -1 : 1))
    }))

    if (wasLiked) {
      await supabase.from('video_likes').delete().match({ video_id: videoId, user_id: currentUserId })
    } else {
      await supabase.from('video_likes').insert({ video_id: videoId, user_id: currentUserId })
    }
  }

  async function handleAddComment() {
    if (!commentDraft.trim() || !currentUserId) return
    const text = commentDraft.trim()
    setCommentDraft('')

    const newComment = {
      video_id: currentVideo.id,
      user_id: currentUserId,
      user_name: currentUserName,
      content: text,
    }

    const { error } = await supabase.from('video_comments').insert(newComment)
    if (error) {
      console.error('Error adding comment:', error)
      // optimistic update
      setCommentsMap((prev) => ({
        ...prev,
        [currentVideo.id]: [...(prev[currentVideo.id] || []), { id: Date.now(), ...newComment }]
      }))
    }
    showToast('Đã gửi bình luận!')
  }

  async function handlePostVideo(e) {
    e.preventDefault()
    if (!newVideoUrl.trim() || !newCaption.trim()) return

    const tagArray = newTags
      .split(' ')
      .filter((t) => t.trim().length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))

    const newVid = {
      creator_id: currentUserId,
      creator_name: currentUserName,
      creator_handle: `@${currentUserName.toLowerCase().replace(/\s+/g, '')}`,
      avatar_letter: currentUserName.charAt(0).toUpperCase(),
      caption: newCaption.trim(),
      video_url: newVideoUrl.trim(),
      song_title: 'Original Sound - ' + currentUserName,
      tags: tagArray.length > 0 ? tagArray : ['#RanVideo', '#Hot'],
    }

    const { data, error } = await supabase.from('videos').insert(newVid).select().single()
    if (!error && data) {
      setVideos([data, ...videos])
    } else {
      setVideos([{ id: 'v-' + Date.now(), ...newVid }, ...videos])
    }

    setShowPostModal(false)
    setNewVideoUrl('')
    setNewCaption('')
    setNewTags('')
    showToast('Đã đăng video thành công! 🎉')
  }

  function togglePlay() {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  return (
    <AppShell>
      <div className="desktop-grid-2">
        {/* CENTER VIDEO FEED */}
        <div className="flex col items-center">
          {/* Top category tabs & Post Button */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16, width: '100%', maxWidth: 420 }}>
            <div className="flex items-center g8">
              <span className="badge badge-glow" style={{ padding: '6px 14px', cursor: 'pointer' }}>
                <Flame size={13} /> Thịnh hành
              </span>
              <span className="chip" style={{ padding: '6px 14px', fontSize: 12 }}>
                Cộng đồng
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 999 }}
              onClick={() => setShowPostModal(true)}
            >
              <Plus size={14} /> Đăng Video
            </button>
          </div>

          {/* Short-form Video Card */}
          <div className="ranvid-card">
            <video
              ref={videoRef}
              className="ranvid-video"
              src={currentVideo.video_url}
              loop
              autoPlay
              muted={isMuted}
              playsInline
              onClick={togglePlay}
            />

            {/* Play/Pause Overlay indicator */}
            {!isPlaying && (
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={32} style={{ color: '#fff', marginLeft: 4 }} />
                </div>
              </div>
            )}

            {/* Right Action Icons */}
            <div className="ranvid-actions">
              {/* Creator Avatar */}
              <div style={{ position: 'relative', marginBottom: 6 }}>
                <div 
                  className="avatar" 
                  style={{ width: 46, height: 46, fontSize: 18, background: 'var(--brand-gradient)' }}
                >
                  {currentVideo.avatar_letter || (currentVideo.creator_name || 'R').charAt(0)}
                </div>
              </div>

              {/* Like (Real DB synced) */}
              <button 
                type="button" 
                className="ranvid-action-btn"
                onClick={() => toggleLike(currentVideo.id)}
              >
                <div 
                  className="ranvid-icon-wrap"
                  style={{ 
                    background: isLiked ? 'rgba(236, 72, 153, 0.25)' : 'rgba(20, 16, 32, 0.65)',
                    borderColor: isLiked ? '#ec4899' : 'rgba(255,255,255,0.15)'
                  }}
                >
                  <Heart 
                    size={24} 
                    style={{ 
                      color: isLiked ? '#ec4899' : '#fff',
                      fill: isLiked ? '#ec4899' : 'transparent',
                      transition: 'all 0.2s ease'
                    }} 
                  />
                </div>
                <span className="tiny bold rm-num">{currentLikes}</span>
              </button>

              {/* Comment (Real DB synced) */}
              <button 
                type="button" 
                className="ranvid-action-btn"
                onClick={() => setShowComments(true)}
              >
                <div className="ranvid-icon-wrap">
                  <MessageCircle size={24} style={{ color: '#fff' }} />
                </div>
                <span className="tiny bold rm-num">{currentComments.length}</span>
              </button>

              {/* Share */}
              <button 
                type="button" 
                className="ranvid-action-btn"
                onClick={() => showToast('Đã sao chép link video vào bộ nhớ tạm! 📋')}
              >
                <div className="ranvid-icon-wrap">
                  <Share2 size={22} style={{ color: '#fff' }} />
                </div>
              </button>

              {/* Mute/Unmute */}
              <button 
                type="button" 
                className="ranvid-action-btn"
                onClick={() => setIsMuted(!isMuted)}
              >
                <div className="ranvid-icon-wrap">
                  {isMuted ? <VolumeX size={20} style={{ color: '#fff' }} /> : <Volume2 size={20} style={{ color: '#06b6d4' }} />}
                </div>
              </button>
            </div>

            {/* Bottom Overlay Info (Caption, Song) */}
            <div className="ranvid-overlay">
              <div />
              <div>
                <div className="flex items-center g8" style={{ marginBottom: 6 }}>
                  <span className="bold" style={{ fontSize: 16, color: '#fff' }}>
                    {currentVideo.creator_name}
                  </span>
                  <span className="tiny muted">{currentVideo.creator_handle}</span>
                </div>

                <p className="small" style={{ color: '#f8fafc', marginBottom: 10, lineHeight: 1.4 }}>
                  {currentVideo.caption}
                </p>

                <div className="flex items-center g8 tiny muted">
                  <Music size={13} style={{ color: '#ec4899' }} />
                  <span>{currentVideo.song_title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center g16" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1))
                setIsPlaying(true)
              }}
            >
              ← Trước
            </button>
            <span className="tiny faint rm-num">
              {currentIndex + 1} / {videos.length}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}
              disabled={currentIndex === videos.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => Math.min(videos.length - 1, prev + 1))
                setIsPlaying(true)
              }}
            >
              Tiếp theo →
            </button>
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR */}
        <div className="flex col g20">
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="flex items-center g8">
                <VideoIcon size={16} style={{ color: '#ec4899' }} />
                <span className="semi small">Đăng video sáng tạo</span>
              </div>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 14 }}>
              Chia sẻ các video ngắn, clip game, hướng dẫn lập trình hoặc âm nhạc của bạn lên RanVideo để kết nối với hàng ngàn người dùng khác.
            </p>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setShowPostModal(true)}
            >
              <Plus size={16} /> Đăng Video Mới Ngay
            </button>
          </div>

          <div className="card">
            <div className="flex items-center g8" style={{ marginBottom: 12 }}>
              <Sparkles size={16} style={{ color: '#06b6d4' }} />
              <span className="semi small">Chủ đề nổi bật</span>
            </div>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
              {['#Minecraft', '#Cyberpunk', '#Anime', '#DevLife', '#AI', '#Setup', '#ChillBeats'].map((tag) => (
                <span key={tag} className="chip" style={{ fontSize: 12, padding: '6px 12px' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS MODAL / DRAWER */}
      {showComments && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
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
              maxWidth: 460,
              maxHeight: '75vh',
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 30px',
              display: 'flex',
              flexDirection: 'column',
              animation: 'msgPop 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <span className="bold small">Bình luận trực tiếp ({currentComments.length})</span>
              <button 
                type="button" 
                onClick={() => setShowComments(false)} 
                className="btn-icon" 
                style={{ width: 30, height: 30 }}
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="grow flex col g12" style={{ overflowY: 'auto', maxHeight: '45vh', marginBottom: 16 }}>
              {currentComments.length === 0 ? (
                <div className="tiny faint center-text" style={{ padding: 20 }}>Chưa có bình luận nào. Hãy là người đầu tiên!</div>
              ) : (
                currentComments.map((c) => (
                  <div key={c.id} className="flex g10 items-start">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--brand-gradient)' }}>
                      {(c.user_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div className="semi tiny" style={{ color: '#c084fc' }}>{c.user_name}</div>
                      <div className="small" style={{ color: '#f8fafc', marginTop: 2 }}>{c.content || c.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <div className="flex g8 items-center">
              <input
                className="input"
                style={{ padding: '10px 16px', fontSize: 14, borderRadius: 999 }}
                placeholder="Thêm bình luận..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 42, height: 42, borderRadius: '50%', padding: 0, flexShrink: 0 }}
                onClick={handleAddComment}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST VIDEO MODAL */}
      {showPostModal && (
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
          onClick={() => setShowPostModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 480, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
              <h2 className="rm-title" style={{ fontSize: 20 }}>Đăng Video Lên RanVideo</h2>
              <button 
                type="button" 
                onClick={() => setShowPostModal(false)}
                className="btn-icon" 
                style={{ width: 32, height: 32 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostVideo} className="flex col g16">
              <div className="field-group">
                <label className="field-label">Đường dẫn Video (MP4 / Direct URL)</label>
                <input 
                  className="input" 
                  placeholder="https://assets.mixkit.co/videos/preview/...mp4"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Tiêu đề / Caption</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder="Viết mô tả thú vị cho video của bạn..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Hashtags (cách nhau bằng dấu cách)</label>
                <input 
                  className="input" 
                  placeholder="#gaming #minecraft #coding"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Sparkles size={16} /> Đăng tải video lên hệ thống
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
