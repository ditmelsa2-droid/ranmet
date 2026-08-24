'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Volume2, VolumeX, 
  Play, Pause, Music, Sparkles, Flame, UserPlus, Check, Send
} from 'lucide-react'
import AppShell from '../components/AppShell'

const SAMPLE_VIDEOS = [
  {
    id: 1,
    creator: 'LinhChi_Dev',
    avatar: 'L',
    handle: '@linhchi.codes',
    caption: 'Setup góc làm việc lập trình cyberpunk ban đêm cực chill ✨💻 #developer #cyberpunk #setup',
    song: 'Lofi Chill Beats - RanMet Audio',
    likes: 1240,
    commentsCount: 88,
    shares: 45,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-42247-large.mp4',
    tags: ['#setup', '#coding', '#chill'],
    comments: [
      { id: 1, user: 'MinhQuan', text: 'Bàn phím custom đèn đẹp quá bạn ơi! 😍' },
      { id: 2, user: 'HaMy', text: 'Xin tên bài nhạc lofi với ạ' },
    ]
  },
  {
    id: 2,
    creator: 'Kaito_Gamer',
    avatar: 'K',
    handle: '@kaito.gaming',
    caption: 'Thử thách sinh tồn Minecraft 100 ngày trong thế giới ngầm Backrooms! ⛏️👹 #minecraft #gaming',
    song: 'Epic Gaming Synthwave - Kaito Sound',
    likes: 3820,
    commentsCount: 215,
    shares: 130,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    tags: ['#minecraft', '#survival', '#backrooms'],
    comments: [
      { id: 1, user: 'TungDev', text: 'Tập sau nhớ đi khám phá thêm tầng 5 nha!' },
      { id: 2, user: 'Alex', text: 'Ghép đôi qua RanMet thấy clip này đỉnh thật' },
    ]
  },
  {
    id: 3,
    creator: 'VyVy_Anime',
    avatar: 'V',
    handle: '@vyvy.art',
    caption: 'Vẽ nhân vật anime theo phong cách Cyber Neon 3D trong 1 tiếng 🎨✨ #anime #digitalart',
    song: 'Anime Future Bass - VyVy Track',
    likes: 5410,
    commentsCount: 340,
    shares: 210,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41584-large.mp4',
    tags: ['#anime', '#drawing', '#art'],
    comments: [
      { id: 1, user: 'NamNguyen', text: 'Nét vẽ đỉnh chóp, xin info bảng vẽ với' },
    ]
  }
]

export default function RanVideoPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedMap, setLikedMap] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({
    1: 1240,
    2: 3820,
    3: 5410,
  })
  const [followedMap, setFollowedMap] = useState({})
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [videoComments, setVideoComments] = useState(SAMPLE_VIDEOS)
  const [toastMsg, setToastMsg] = useState('')

  const currentVideo = videoComments[currentIndex]
  const isLiked = !!likedMap[currentVideo.id]
  const isFollowed = !!followedMap[currentVideo.creator]
  const videoRef = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  function toggleLike(id) {
    const wasLiked = !!likedMap[id]
    setLikedMap((prev) => ({ ...prev, [id]: !wasLiked }))
    setLikesCountMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (wasLiked ? -1 : 1)
    }))
  }

  function toggleFollow(creator) {
    setFollowedMap((prev) => ({ ...prev, [creator]: !prev[creator] }))
    showToast(!followedMap[creator] ? `Đã theo dõi ${creator} 🎉` : `Đã hủy theo dõi ${creator}`)
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

  function addComment() {
    if (!commentDraft.trim()) return
    const newComment = {
      id: Date.now(),
      user: 'Bạn',
      text: commentDraft.trim()
    }

    setVideoComments((prev) =>
      prev.map((v, i) =>
        i === currentIndex
          ? { ...v, comments: [newComment, ...(v.comments || [])], commentsCount: (v.commentsCount || 0) + 1 }
          : v
      )
    )
    setCommentDraft('')
    showToast('Đã đăng bình luận!')
  }

  return (
    <AppShell>
      <div className="desktop-grid-2">
        {/* CENTER VIDEO FEED */}
        <div className="flex col items-center">
          {/* Top category tabs */}
          <div className="flex items-center g10" style={{ marginBottom: 16, width: '100%', maxWidth: 420, justifyContent: 'center' }}>
            <span className="badge badge-glow" style={{ padding: '6px 14px', cursor: 'pointer' }}>
              <Flame size={13} /> Thịnh hành
            </span>
            <span className="chip" style={{ padding: '6px 14px', fontSize: 12 }}>
              Khám phá
            </span>
            <span className="chip" style={{ padding: '6px 14px', fontSize: 12 }}>
              Bạn bè
            </span>
          </div>

          {/* Short-form Video Card */}
          <div className="ranvid-card">
            <video
              ref={videoRef}
              className="ranvid-video"
              src={currentVideo.videoUrl}
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

            {/* Right Action Icons (Like, Comment, Share, Audio Mute) */}
            <div className="ranvid-actions">
              {/* Creator Avatar with follow plus */}
              <div style={{ position: 'relative', marginBottom: 6 }}>
                <div 
                  className="avatar" 
                  style={{ width: 46, height: 46, fontSize: 18, background: 'var(--brand-gradient)' }}
                >
                  {currentVideo.avatar}
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(currentVideo.creator)}
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: isFollowed ? '#10b981' : '#ec4899',
                    border: '2px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {isFollowed ? <Check size={11} /> : <UserPlus size={11} />}
                </button>
              </div>

              {/* Like */}
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
                <span className="tiny bold rm-num">{likesCountMap[currentVideo.id]}</span>
              </button>

              {/* Comment */}
              <button 
                type="button" 
                className="ranvid-action-btn"
                onClick={() => setShowComments(true)}
              >
                <div className="ranvid-icon-wrap">
                  <MessageCircle size={24} style={{ color: '#fff' }} />
                </div>
                <span className="tiny bold rm-num">{currentVideo.commentsCount}</span>
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
                <span className="tiny bold rm-num">{currentVideo.shares}</span>
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
                    {currentVideo.creator}
                  </span>
                  <span className="tiny muted">{currentVideo.handle}</span>
                </div>

                <p className="small" style={{ color: '#f8fafc', marginBottom: 10, lineHeight: 1.4 }}>
                  {currentVideo.caption}
                </p>

                <div className="flex items-center g8 tiny muted">
                  <Music size={13} style={{ color: '#ec4899' }} />
                  <span>{currentVideo.song}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls (Prev / Next Video) */}
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
              ← Video trước
            </button>
            <span className="tiny faint rm-num">
              {currentIndex + 1} / {SAMPLE_VIDEOS.length}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}
              disabled={currentIndex === SAMPLE_VIDEOS.length - 1}
              onClick={() => {
                setCurrentIndex((prev) => Math.min(SAMPLE_VIDEOS.length - 1, prev + 1))
                setIsPlaying(true)
              }}
            >
              Video tiếp theo →
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Desktop widgets) */}
        <div className="flex col g20">
          <div className="card">
            <div className="flex items-center g8" style={{ marginBottom: 14 }}>
              <Flame size={16} style={{ color: '#f43f5e' }} />
              <span className="semi small">Creators nổi bật</span>
            </div>
            <div className="flex col g12">
              {SAMPLE_VIDEOS.map((v) => (
                <div key={v.id} className="flex items-center justify-between">
                  <div className="flex items-center g10">
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--brand-gradient)' }}>
                      {v.avatar}
                    </div>
                    <div>
                      <div className="semi small">{v.creator}</div>
                      <div className="tiny faint">{v.handle}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                    onClick={() => toggleFollow(v.creator)}
                  >
                    {followedMap[v.creator] ? 'Đang follow' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center g8" style={{ marginBottom: 12 }}>
              <Sparkles size={16} style={{ color: '#ec4899' }} />
              <span className="semi small">Chủ đề thịnh hành</span>
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
              <span className="bold small">Bình luận ({currentVideo.comments?.length || 0})</span>
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
              {currentVideo.comments?.map((c) => (
                <div key={c.id} className="flex g10 items-start">
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--brand-gradient)' }}>
                    {c.user.charAt(0)}
                  </div>
                  <div>
                    <div className="semi tiny" style={{ color: '#c084fc' }}>{c.user}</div>
                    <div className="small" style={{ color: '#f8fafc', marginTop: 2 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <div className="flex g8 items-center">
              <input
                className="input"
                style={{ padding: '10px 16px', fontSize: 14, borderRadius: 999 }}
                placeholder="Thêm bình luận..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addComment() }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 42, height: 42, borderRadius: '50%', padding: 0, flexShrink: 0 }}
                onClick={addComment}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
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
