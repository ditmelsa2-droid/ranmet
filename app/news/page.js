'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, 
  Globe, ShieldCheck, Image as ImageIcon, Flame, TrendingUp, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent, checkTags } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

const POPULAR_NEWS_GIFS = [
  { label: 'Anime Sparkle', url: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif' },
  { label: 'Gaming Win', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { label: 'Vibe Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { label: 'Cute Cat', url: 'https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif' }
]

export default function RanNewsPage() {
  const { t, currentLang } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPostText, setNewPostText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [activeFeedSubTab, setActiveFeedSubTab] = useState('all')
  const [isPosting, setIsPosting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [unblurredMap, setUnblurredMap] = useState({})
  
  // Likes & Comments
  const [likedPosts, setLikedPosts] = useState({})
  const [commentsMap, setCommentsMap] = useState({})
  const [activeCommentPostId, setActiveCommentPostId] = useState(null)
  const [commentInputText, setCommentInputText] = useState('')
  
  // Translations
  const [translations, setTranslations] = useState({})
  const [translatingPostId, setTranslatingPostId] = useState(null)

  const [currentUserId, setCurrentUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const fileInputRef = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
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
    fetchPosts()

    const channel = supabase
      .channel('news-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        setPosts((prev) => [payload.new, ...prev.filter(p => p.id !== payload.new.id)])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, (payload) => {
        setCommentsMap((prev) => ({
          ...prev,
          [payload.new.post_id]: [...(prev[payload.new.post_id] || []), payload.new]
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Select Image
  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await readFileAsDataUrl(file, 20)
      setSelectedImage(file)
      setImagePreview(res.url)
    } catch (err) {
      showToast(err.message)
    }
  }

  // Create Post
  async function handleCreatePost(e) {
    e.preventDefault()
    if ((!newPostText.trim() && !selectedImage) || isPosting) return

    setIsPosting(true)
    showToast('AI đang kiểm duyệt bài viết... 🧠')

    let isNsfw = false
    if (newPostText.trim()) {
      const mod = await checkContent(newPostText.trim())
      if (!mod.isSafe) {
        if (mod.reason?.includes('18+') || mod.reason?.includes('nhạy cảm') || mod.reason?.includes('thô tục')) {
          isNsfw = true
        } else {
          showToast(`Bài viết bị từ chối: Vi phạm an toàn cộng đồng! ⚠️`)
          setIsPosting(false)
          return
        }
      }
    }

    let imageUrl = ''
    if (selectedImage) {
      try {
        const { uploadMediaToSupabase } = await import('@/lib/upload')
        const { checkImageVisualSafety } = await import('@/lib/videoInspector')
        const imgCheck = await checkImageVisualSafety(selectedImage)
        if (!imgCheck.isAllowed) {
          showToast(`Ảnh bị AI từ chối: ${imgCheck.reason || 'Nội dung không phù hợp'} ⚠️`)
          setIsPosting(false)
          return
        }
        if (imgCheck.isNsfw) {
          isNsfw = true
        }

        const res = await uploadMediaToSupabase(supabase, selectedImage, 'posts', currentUserId || 'guest')
        imageUrl = res.url
      } catch (uploadErr) {
        showToast(uploadErr.message || 'Lỗi tải ảnh lên!')
        setIsPosting(false)
        return
      }
    } else if (imagePreview && imagePreview.startsWith('http')) {
      imageUrl = imagePreview
    }

    const { data: { user } } = await supabase.auth.getUser()
    const activeUid = currentUserId || user?.id || null

    const newPost = {
      user_id: activeUid,
      author_name: userProfile?.display_name || 'RanMet Member',
      author_handle: `@${(userProfile?.display_name || 'user').toLowerCase().replace(/\s+/g, '')}`,
      avatar_letter: (userProfile?.display_name || 'R').charAt(0).toUpperCase(),
      content: newPostText.trim(),
      image_url: imageUrl,
      is_nsfw: isNsfw,
      likes_count: 0
    }

    const { data, error } = await supabase.from('posts').insert(newPost).select().single()

    setIsPosting(false)
    if (error) {
      showToast('Lỗi đăng bài: ' + error.message)
    } else {
      setNewPostText('')
      setSelectedImage(null)
      setImagePreview('')
      showToast('Đã đăng bài viết thành công! ✨')
      if (data) {
        setPosts((prev) => [data, ...prev.filter(p => p.id !== data.id)])
      }
    }
  }

  // Translate Post
  async function handleTranslatePost(post) {
    if (translations[post.id]) {
      setTranslations((prev) => {
        const updated = { ...prev }
        delete updated[post.id]
        return updated
      })
      return
    }

    setTranslatingPostId(post.id)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.content, targetLang: currentLang })
      })
      const data = await res.json()
      if (data.translatedText) {
        setTranslations((prev) => ({ ...prev, [post.id]: data.translatedText }))
      } else {
        showToast('Không thể dịch bài viết này.')
      }
    } catch {
      showToast('Lỗi khi gọi API dịch thuật.')
    } finally {
      setTranslatingPostId(null)
    }
  }

  // Comments Fetch & Send
  async function toggleComments(postId) {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null)
      return
    }
    setActiveCommentPostId(postId)
    if (!commentsMap[postId]) {
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (data) setCommentsMap((prev) => ({ ...prev, [postId]: data }))
    }
  }

  async function handleSendComment(postId, e) {
    e.preventDefault()
    if (!commentInputText.trim()) return

    const mod = await checkContent(commentInputText.trim())
    if (!mod.isSafe) {
      showToast('Bình luận vi phạm an toàn cộng đồng!')
      return
    }

    const newComment = {
      post_id: postId,
      user_id: currentUserId,
      user_name: userProfile?.display_name || 'Member',
      content: commentInputText.trim()
    }

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { ...newComment, id: Date.now(), created_at: new Date().toISOString() }]
    }))
    setCommentInputText('')

    await supabase.from('post_comments').insert(newComment)
  }

  const isUserAdult = !!userProfile?.age_verified

  return (
    <AppShell>
      {/* 3-COLUMN SOCIAL TIMELINE CONTAINER */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 24,
          maxWidth: 1040,
          margin: '0 auto'
        }}
      >
        {/* CENTER: FEED & COMPOSER */}
        <div>
          {/* COMPOSER */}
          <div className="card" style={{ marginBottom: 20, padding: 18 }}>
            <div className="flex g12 items-start">
              <div className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                {(userProfile?.display_name || 'R').charAt(0).toUpperCase()}
              </div>
              <div className="grow">
                <textarea
                  className="input"
                  rows={3}
                  placeholder={t('postComposerPlaceholder') || 'Chia sẻ suy nghĩ, tin tức, hình ảnh cùng cộng đồng RanMet...'}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: '4px 0', resize: 'none', fontSize: 14.5 }}
                />

                {imagePreview && (
                  <div style={{ position: 'relative', marginTop: 10, borderRadius: 8, overflow: 'hidden', maxHeight: 240, border: '1px solid var(--gold-hairline)' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.7)' }}
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview('')
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Quick GIF Tray */}
                {showGifPicker && (
                  <div 
                    style={{ 
                      marginTop: 10, 
                      padding: 10, 
                      background: 'var(--lacquer-deep)', 
                      borderRadius: 10, 
                      border: '1px solid var(--gold-hairline)' 
                    }}
                  >
                    <div className="tiny bold gold flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span>✨ Chọn GIF Reaction nhanh:</span>
                      <X size={13} style={{ cursor: 'pointer' }} onClick={() => setShowGifPicker(false)} />
                    </div>
                    <div className="flex g8" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                      {POPULAR_NEWS_GIFS.map((g, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setImagePreview(g.url)
                            setSelectedImage(null)
                            setShowGifPicker(false)
                          }}
                          style={{
                            width: 76,
                            height: 60,
                            borderRadius: 6,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            flexShrink: 0,
                            border: '1px solid var(--gold-hairline)'
                          }}
                        >
                          <img src={g.url} alt={g.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--gold-hairline)' }}>
                  <div className="flex items-center g8">
                    <button
                      type="button"
                      className="btn btn-secondary flex items-center g6"
                      style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={15} style={{ color: 'var(--kinpaku-gold)' }} /> Thêm ảnh
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />

                    <button
                      type="button"
                      className="btn btn-secondary flex items-center g6"
                      style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, fontWeight: 700, color: 'var(--kinpaku-gold)' }}
                      onClick={() => setShowGifPicker(!showGifPicker)}
                    >
                      GIF
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '7px 20px', fontSize: 12.5 }}
                      onClick={handleCreatePost}
                      disabled={(!newPostText.trim() && !selectedImage && !imagePreview) || isPosting}
                    >
                      {isPosting ? 'Đang đăng...' : 'Đăng tin'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FEED SUB-TABS */}
          <div className="subtab-bar" style={{ marginBottom: 16 }}>
            <button 
              type="button" 
              className={`subtab-btn ${activeFeedSubTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFeedSubTab('all')}
            >
              <Globe size={14} /> Tất Cả Tin Mới
            </button>
            <button 
              type="button" 
              className={`subtab-btn ${activeFeedSubTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveFeedSubTab('media')}
            >
              <ImageIcon size={14} /> Ảnh & GIF Động 📸
            </button>
            <button 
              type="button" 
              className={`subtab-btn ${activeFeedSubTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveFeedSubTab('trending')}
            >
              <Flame size={14} /> Thịnh Hành 🔥
            </button>
          </div>

          {/* POSTS FEED */}
          {loading ? (
            <div className="card center-text" style={{ padding: 40 }}>
              <div className="tiny muted">Đang tải bảng tin RanNews...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card center-text" style={{ padding: 40 }}>
              <div className="semi champagne" style={{ fontSize: 16, marginBottom: 4 }}>Bảng tin đang trống</div>
              <div className="tiny faint">Hãy là người đầu tiên đăng bài lên RanNews!</div>
            </div>
          ) : (
            <div className="flex col g12">
              {posts
                .filter((p) => {
                  if (activeFeedSubTab === 'media') return !!p.image_url
                  if (activeFeedSubTab === 'trending') return (p.likes_count || 0) > 0 || (p.content || '').includes('#')
                  return true
                })
                .map((p) => {
                const isNsfw = !!p.is_nsfw
                const isUnblurred = !!unblurredMap[p.id]
                const shouldBlur = isNsfw && (!isUserAdult || !isUnblurred)
                const translated = translations[p.id]
                const postComments = commentsMap[p.id] || []

                return (
                  <div key={p.id} className="card" style={{ padding: '18px 20px' }}>
                    {/* Author Header */}
                    <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
                      <div className="flex items-center g10">
                        <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
                          {p.avatar_letter || 'R'}
                        </div>
                        <div>
                          <div className="flex items-center g6">
                            <span className="semi champagne" style={{ fontSize: 14.5 }}>{p.author_name}</span>
                            <span className="badge badge-gold" style={{ fontSize: 9, padding: '1px 5px' }}>✓ Verified</span>
                          </div>
                          <div className="tiny faint rm-num">{p.author_handle} · {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* AI Translate Pill */}
                      {p.content && (
                        <button
                          type="button"
                          className={`btn ${translated ? 'btn-primary' : 'btn-secondary'} flex items-center g4`}
                          style={{ padding: '4px 9px', fontSize: 11, borderRadius: 6 }}
                          onClick={() => handleTranslatePost(p)}
                          disabled={translatingPostId === p.id}
                        >
                          <Globe size={12} />
                          {translatingPostId === p.id ? 'Đang dịch...' : translated ? 'Bản gốc' : 'AI Dịch'}
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div 
                      style={{ 
                        fontSize: 14.5, 
                        lineHeight: 1.6, 
                        marginBottom: p.image_url ? 12 : 6,
                        filter: shouldBlur ? 'blur(16px)' : 'none',
                        transition: 'filter 0.25s ease'
                      }}
                    >
                      {translated ? (
                        <div>
                          <span className="gold bold">[Bản dịch AI]: </span>
                          <span>{translated}</span>
                        </div>
                      ) : (
                        p.content
                      )}
                    </div>

                    {/* Post Image Attachment with 18+ Blur Gate */}
                    {p.image_url && (
                      <div 
                        style={{ 
                          position: 'relative', 
                          borderRadius: 10, 
                          overflow: 'hidden', 
                          marginBottom: 12, 
                          border: '1px solid var(--gold-hairline)',
                          maxHeight: 400
                        }}
                      >
                        <img 
                          src={p.image_url} 
                          alt="Post attachment" 
                          style={{ 
                            width: '100%', 
                            objectFit: 'cover',
                            filter: shouldBlur ? 'blur(35px) brightness(0.6)' : 'none',
                            transform: shouldBlur ? 'scale(1.08)' : 'none',
                            transition: 'filter 0.3s ease, transform 0.3s ease'
                          }} 
                        />

                        {shouldBlur && (
                          <div 
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(10, 8, 14, 0.85)',
                              backdropFilter: 'blur(12px)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 20,
                              textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: 24, marginBottom: 6 }}>🔞</span>
                            <div className="rm-title" style={{ color: '#f43f5e', fontSize: 15, marginBottom: 4 }}>
                              NỘI DUNG 18+ ĐÃ LÀM MỜ
                            </div>
                            <p className="tiny muted" style={{ maxWidth: 280, lineHeight: 1.5, marginBottom: 12 }}>
                              {!isUserAdult 
                                ? 'Hình ảnh chứa nội dung nhạy cảm. Bạn cần xác thực 18+ trong Hồ Sơ để xem.'
                                : 'Bạn đã đủ điều kiện 18+.'}
                            </p>
                            {!isUserAdult ? (
                              <Link 
                                href="/profile" 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 14px', fontSize: 11.5, color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}
                              >
                                🛡️ Xác thực 18+
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: '6px 16px', fontSize: 12 }}
                                onClick={() => setUnblurredMap((prev) => ({ ...prev, [p.id]: true }))}
                              >
                                👁️ Mở khóa xem ảnh
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post Actions (Like, Comment, Share) */}
                    <div className="flex items-center g16" style={{ paddingTop: 10, borderTop: '1px solid var(--gold-hairline)' }}>
                      <button
                        type="button"
                        className="btn-secondary flex items-center g6"
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          fontSize: 12.5,
                          background: likedPosts[p.id] ? 'rgba(245, 192, 66, 0.12)' : 'var(--inset-lacquer)',
                          color: likedPosts[p.id] ? 'var(--kinpaku-gold)' : 'var(--text-muted)'
                        }}
                        onClick={() => {
                          setLikedPosts((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                        }}
                      >
                        <Heart size={15} fill={likedPosts[p.id] ? 'var(--kinpaku-gold)' : 'none'} />
                        <span className="bold rm-num">{(p.likes_count || 0) + (likedPosts[p.id] ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary flex items-center g6"
                        style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12.5, color: 'var(--text-muted)' }}
                        onClick={() => toggleComments(p.id)}
                      >
                        <MessageCircle size={15} />
                        <span className="rm-num">{postComments.length || 0}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary flex items-center g6"
                        style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12.5, color: 'var(--text-muted)', marginLeft: 'auto' }}
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href)
                            showToast('Đã sao chép liên kết bài viết!')
                          }
                        }}
                      >
                        <Share2 size={15} />
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {activeCommentPostId === p.id && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gold-hairline)', animation: 'msgPop 0.2s ease' }}>
                        <div className="flex col g8" style={{ marginBottom: 12 }}>
                          {postComments.length === 0 ? (
                            <div className="tiny faint center-text" style={{ padding: '8px 0' }}>Chưa có bình luận nào.</div>
                          ) : (
                            postComments.map((cm) => (
                              <div key={cm.id} className="flex g8 items-start" style={{ background: 'var(--lacquer-deep)', padding: '8px 12px', borderRadius: 8 }}>
                                <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                                  {(cm.user_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="semi tiny gold">{cm.user_name}</div>
                                  <div className="small champagne">{cm.content}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={(e) => handleSendComment(p.id, e)} className="flex g8 items-center">
                          <input
                            className="input"
                            placeholder="Viết bình luận cho bài đăng này..."
                            value={commentInputText}
                            onChange={(e) => setCommentInputText(e.target.value)}
                            style={{ padding: '8px 12px', fontSize: 12.5, borderRadius: 6 }}
                          />
                          <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: 6 }}>
                            <Send size={14} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: TRENDS & GEMINI SAFETY STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Trending Topics */}
          <div className="card" style={{ padding: 18 }}>
            <div className="flex items-center g6" style={{ marginBottom: 12 }}>
              <TrendingUp size={16} style={{ color: 'var(--kinpaku-gold)' }} />
              <div className="rm-title" style={{ fontSize: 15 }}>Chủ Đề Thịnh Hành</div>
            </div>

            <div className="flex col g10">
              {[
                { tag: '#RanMetAI', count: '14.2K bài viết' },
                { tag: '#SpatialAudio', count: '8.7K bài viết' },
                { tag: '#AnimeVoice', count: '6.1K bài viết' },
                { tag: '#CreatorStudio', count: '4.9K bài viết' },
                { tag: '#GamingHub', count: '3.4K bài viết' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center" style={{ cursor: 'pointer' }}>
                  <div>
                    <div className="semi gold tiny">{item.tag}</div>
                    <div className="tiny faint rm-num">{item.count}</div>
                  </div>
                  <span className="tiny faint">🔥</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini AI Guard Status */}
          <div className="card" style={{ padding: 18, background: 'var(--lacquer-deep)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 8 }}>
              <ShieldCheck size={16} style={{ color: 'var(--emerald-patina)' }} />
              <div className="rm-title" style={{ fontSize: 14 }}>Gemini AI Guard</div>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.55 }}>
              Mọi bài đăng, hình ảnh và video đều được AI kiểm duyệt thời gian thực theo tiêu chuẩn an toàn cộng đồng toàn cầu.
            </p>
          </div>
        </div>
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
