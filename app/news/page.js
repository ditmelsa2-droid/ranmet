'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Newspaper, Heart, MessageCircle, Share2, Send, 
  Sparkles, Image as ImageIcon, Plus, Flame, Clock, MoreHorizontal, AlertCircle, ShieldCheck, Upload,
  Languages, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { translateText } from '@/lib/translate'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

const INITIAL_SEED_POSTS = [
  {
    id: 'post-seed-1',
    author_name: 'MinhQuan',
    author_avatar: 'M',
    content: 'Chào cả nhà RanMet! Hôm nay có bạn nào tham gia phòng Minecraft RanWorld không? Mình vừa thiết kế xong hệ thống redstone farm tự động cực đỉnh! ⛏️🔥',
    image_url: '',
    tags: ['#RanWorld', '#Minecraft', '#Gaming'],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likesCount: 18,
    comments: [
      { id: 1, user_name: 'Kaito_Gamer', content: 'Tối nay 8h vào giao lưu nhé bác!' }
    ]
  },
  {
    id: 'post-seed-2',
    author_name: 'LinhChi_Dev',
    author_avatar: 'L',
    content: 'Setup không gian làm việc ban đêm phong cách Cyberpunk và vừa build xong tính năng AI Matching trên Next.js 🚀 Mọi người thấy giao diện mới thế nào?',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['#Developer', '#Nextjs', '#Cyberpunk'],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likesCount: 34,
    comments: [
      { id: 1, user_name: 'VyVy_Anime', content: 'Giao diện tím neon nhìn cuốn thật sự á chị ơi! ✨' }
    ]
  }
]

export default function RanNewsPage() {
  const { lang, t } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [posts, setPosts] = useState(INITIAL_SEED_POSTS)
  const [postDraft, setPostDraft] = useState('')
  const [imageDraft, setImageDraft] = useState('')
  const [likedPosts, setLikedPosts] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({ 'post-seed-1': 18, 'post-seed-2': 34 })
  const [commentsMap, setCommentsMap] = useState({
    'post-seed-1': [{ id: 1, user_name: 'Kaito_Gamer', content: 'Tối nay 8h vào giao lưu nhé bác!' }],
    'post-seed-2': [{ id: 1, user_name: 'VyVy_Anime', content: 'Giao diện tím neon nhìn cuốn thật sự á chị ơi! ✨' }]
  })
  const [commentDrafts, setCommentDrafts] = useState({})
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null)
  
  // Translation state for posts & comments: { [id]: { translated: string, isTranslating: boolean, show: boolean } }
  const [postTranslations, setPostTranslations] = useState({})
  const [commentTranslations, setCommentTranslations] = useState({})

  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('User')
  const [toastMsg, setToastMsg] = useState('')
  const [moderationWarning, setModerationWarning] = useState('')

  const fileInputRef = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Handle AI Post Translation
  async function handleTranslatePost(postId, originalText) {
    if (postTranslations[postId]?.translated) {
      setPostTranslations((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], show: !prev[postId].show }
      }))
      return
    }

    setPostTranslations((prev) => ({
      ...prev,
      [postId]: { isTranslating: true, show: true }
    }))

    const translated = await translateText(originalText, lang)
    setPostTranslations((prev) => ({
      ...prev,
      [postId]: { translated, isTranslating: false, show: true }
    }))
  }

  // Handle AI Comment Translation
  async function handleTranslateComment(commentId, originalText) {
    if (commentTranslations[commentId]?.translated) {
      setCommentTranslations((prev) => ({
        ...prev,
        [commentId]: { ...prev[commentId], show: !prev[commentId].show }
      }))
      return
    }

    setCommentTranslations((prev) => ({
      ...prev,
      [commentId]: { isTranslating: true, show: true }
    }))

    const translated = await translateText(originalText, lang)
    setCommentTranslations((prev) => ({
      ...prev,
      [commentId]: { translated, isTranslating: false, show: true }
    }))
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        if (profile?.display_name) setCurrentUserName(profile.display_name)
      }

      // Fetch posts from database
      const { data: dbPosts } = await supabase
        .from('rannews_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (dbPosts && dbPosts.length > 0) {
        setPosts(dbPosts)
      }

      // Fetch likes
      const { data: dbLikes } = await supabase.from('rannews_likes').select('post_id, user_id')
      if (dbLikes) {
        const counts = { ...likesCountMap }
        const userLiked = {}
        dbLikes.forEach((l) => {
          counts[l.post_id] = (counts[l.post_id] || 0) + 1
          if (user && l.user_id === user.id) {
            userLiked[l.post_id] = true
          }
        })
        setLikesCountMap(counts)
        setLikedPosts(userLiked)
      }

      // Fetch comments
      const { data: dbComments } = await supabase.from('rannews_comments').select('*').order('created_at', { ascending: true })
      if (dbComments) {
        const cm = { ...commentsMap }
        dbComments.forEach((c) => {
          if (!cm[c.post_id]) cm[c.post_id] = []
          cm[c.post_id].push(c)
        })
        setCommentsMap(cm)
      }
    }

    loadData()

    // Realtime subscription for posts and comments
    const channel = supabase
      .channel('rannews-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rannews_posts' }, (payload) => {
        setPosts((prev) => [payload.new, ...prev])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rannews_comments' }, (payload) => {
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Đang tải hình ảnh từ thiết bị...')
      const res = await readFileAsDataUrl(file, 20)
      setImageDraft(res.url)
      showToast('Đã đính kèm ảnh thành công! 🖼️')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!postDraft.trim() || !currentUserId) return

    // GEMINI AI & SLANG AUTO-MODERATION CHECK
    const modCheck = await checkContent(postDraft)
    if (!modCheck.isSafe) {
      setModerationWarning(`Hệ thống AI từ chối: Bài viết chứa nội dung không an toàn (${modCheck.flaggedWord}). Hãy điều chỉnh để bảo vệ cộng đồng!`)
      showToast('Nội dung bài viết vi phạm tiêu chuẩn an toàn!')
      return
    }

    setModerationWarning('')

    const newPost = {
      author_id: currentUserId,
      author_name: currentUserName,
      author_avatar: currentUserName.charAt(0).toUpperCase(),
      content: postDraft.trim(),
      image_url: imageDraft.trim() || null,
      tags: ['#RanNews', '#Community']
    }

    const { data, error } = await supabase.from('rannews_posts').insert(newPost).select().single()
    if (!error && data) {
      setPosts([data, ...posts])
    } else {
      setPosts([{ id: 'post-' + Date.now(), ...newPost, created_at: new Date().toISOString() }, ...posts])
    }

    setPostDraft('')
    setImageDraft('')
    showToast('Đã đăng bài viết lên RanNews! 🎉')
  }

  async function handleToggleLike(postId) {
    if (!currentUserId) {
      showToast('Vui lòng đăng nhập để thích bài viết!')
      return
    }

    const wasLiked = !!likedPosts[postId]
    setLikedPosts((prev) => ({ ...prev, [postId]: !wasLiked }))
    setLikesCountMap((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] || 0) + (wasLiked ? -1 : 1))
    }))

    if (wasLiked) {
      await supabase.from('rannews_likes').delete().match({ post_id: postId, user_id: currentUserId })
    } else {
      await supabase.from('rannews_likes').insert({ post_id: postId, user_id: currentUserId })
    }
  }

  async function handleAddComment(postId) {
    const text = (commentDrafts[postId] || '').trim()
    if (!text || !currentUserId) return

    // AI MODERATION CHECK ON COMMENT
    const modCheck = await checkContent(text)
    if (!modCheck.isSafe) {
      showToast('Bình luận chứa từ ngữ không phù hợp, đã bị chặn!')
      return
    }

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))

    const newComment = {
      post_id: postId,
      user_id: currentUserId,
      user_name: currentUserName,
      content: text,
    }

    const { error } = await supabase.from('rannews_comments').insert(newComment)
    if (error) {
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { id: Date.now(), ...newComment, created_at: new Date().toISOString() }]
      }))
    }
    showToast('Đã gửi bình luận!')
  }

  return (
    <AppShell>
      <div className="desktop-grid-2">
        {/* MAIN FEED COLUMN */}
        <div className="flex col g20">
          {/* CREATE POST CARD (FACEBOOK-STYLE COMPOSER WITH DEVICE UPLOAD) */}
          <div 
            className="card"
            style={{
              padding: 22,
              background: 'linear-gradient(135deg, rgba(24, 18, 42, 0.95) 0%, rgba(14, 10, 24, 0.98) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="flex items-center g12">
                <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: 'var(--brand-gradient)' }}>
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>{currentUserName}</div>
                  <div className="tiny faint">{t('composerSub')}</div>
                </div>
              </div>

              <span className="badge tiny flex items-center g4" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <ShieldCheck size={12} /> Gemini Guard
              </span>
            </div>

            {moderationWarning && (
              <div className="err-text" style={{ marginBottom: 12 }}>
                <AlertCircle size={16} /> {moderationWarning}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="flex col g12">
              <textarea
                className="input"
                rows={3}
                placeholder={`${currentUserName} ${t('composerPlaceholder')}`}
                value={postDraft}
                onChange={(e) => setPostDraft(e.target.value)}
                required
                style={{ resize: 'none' }}
              />

              {/* Image Preview if selected */}
              {imageDraft && (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', maxHeight: 220, animation: 'msgPop 0.2s ease' }}>
                  <img src={imageDraft} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setImageDraft('')}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center" style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 999 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} style={{ color: '#06b6d4' }} /> {t('uploadPhotoBtn')}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '8px 20px', fontSize: 13 }}
                  disabled={!postDraft.trim()}
                >
                  <Send size={14} /> {t('postNewsBtn')}
                </button>
              </div>
            </form>
          </div>

          {/* POSTS LIST */}
          <div className="flex col g16">
            {posts.map((post) => {
              const isLiked = !!likedPosts[post.id]
              const likesCount = likesCountMap[post.id] || 0
              const postComments = commentsMap[post.id] || []
              const showCommentsSection = activeCommentsPostId === post.id
              const timeStr = new Date(post.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              const postTrans = postTranslations[post.id]

              return (
                <div key={post.id} className="card" style={{ padding: 22 }}>
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                    <div className="flex items-center g12">
                      <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: 'var(--brand-gradient)' }}>
                        {(post.author_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="semi small" style={{ color: '#fff' }}>{post.author_name}</div>
                        <div className="tiny faint flex items-center g4">
                          <Clock size={11} /> {timeStr} · Global
                        </div>
                      </div>
                    </div>

                    {/* AI Translation 1-tap button */}
                    <button 
                      type="button" 
                      className="btn-secondary flex items-center g4" 
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 999, color: '#c084fc' }}
                      onClick={() => handleTranslatePost(post.id, post.content)}
                    >
                      {postTrans?.isTranslating ? (
                        <><Loader2 size={11} className="spin" /> {t('aiTranslating')}</>
                      ) : postTrans?.show ? (
                        <><Languages size={11} /> {t('showOriginal')}</>
                      ) : (
                        <><Sparkles size={11} /> {t('aiTranslate')}</>
                      )}
                    </button>
                  </div>

                  {/* Post Content with AI Translation */}
                  <div className="small" style={{ color: '#f8fafc', lineHeight: 1.55, marginBottom: 14, whiteSpace: 'pre-line' }}>
                    {postTrans?.show && postTrans?.translated ? (
                      <div>
                        <div style={{ borderLeft: '2px solid #a855f7', paddingLeft: 10, color: '#f3e8ff', marginBottom: 6 }}>
                          {postTrans.translated}
                        </div>
                        <div className="tiny faint">(Original: {post.content})</div>
                      </div>
                    ) : (
                      post.content
                    )}
                  </div>

                  {/* Attached Image if any */}
                  {post.image_url && (
                    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 14, maxHeight: 380 }}>
                      <img 
                        src={post.image_url} 
                        alt="Post attachment" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {post.tags.map((tagItem) => (
                        <span key={tagItem} className="tiny" style={{ color: '#c084fc' }}>
                          {tagItem}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar (Like, Comment, Share) */}
                  <div className="flex justify-between items-center" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: 13,
                        border: 'none',
                        background: isLiked ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                        color: isLiked ? '#ec4899' : 'var(--text-muted)'
                      }}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <Heart size={16} style={{ fill: isLiked ? '#ec4899' : 'none' }} />
                      <span className="bold rm-num">{likesCount}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, border: 'none', background: 'transparent' }}
                      onClick={() => setActiveCommentsPostId(showCommentsSection ? null : post.id)}
                    >
                      <MessageCircle size={16} />
                      <span className="bold rm-num">{postComments.length} {t('commentsCountSuffix')}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, border: 'none', background: 'transparent' }}
                      onClick={() => showToast('Link copied! 📋')}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* EXPANDABLE COMMENTS SECTION */}
                  {showCommentsSection && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'msgPop 0.2s ease' }}>
                      {/* Comments Feed */}
                      <div className="flex col g10" style={{ marginBottom: 12 }}>
                        {postComments.length === 0 ? (
                          <div className="tiny faint">No comments yet. Be the first to comment!</div>
                        ) : (
                          postComments.map((c) => {
                            const cTrans = commentTranslations[c.id]
                            return (
                              <div key={c.id} className="flex g8 items-start">
                                <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--brand-gradient)' }}>
                                  {(c.user_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 12, grow: 1, width: '100%' }}>
                                  <div className="flex justify-between items-center">
                                    <span className="semi tiny" style={{ color: '#c084fc' }}>{c.user_name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleTranslateComment(c.id, c.content)}
                                      style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: 10, cursor: 'pointer' }}
                                    >
                                      {cTrans?.isTranslating ? '...' : cTrans?.show ? t('showOriginal') : t('aiTranslate')}
                                    </button>
                                  </div>
                                  <div className="small" style={{ color: '#fff', marginTop: 2 }}>
                                    {cTrans?.show && cTrans?.translated ? cTrans.translated : c.content}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex g8 items-center">
                        <input
                          className="input"
                          style={{ padding: '8px 14px', fontSize: 13, borderRadius: 999 }}
                          placeholder={t('writeCommentPlaceholder')}
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) => setCommentDrafts({ ...commentDrafts, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, flexShrink: 0 }}
                          onClick={() => handleAddComment(post.id)}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR */}
        <div className="flex col g20">
          <div className="card">
            <div className="flex items-center g8" style={{ marginBottom: 12 }}>
              <Flame size={16} style={{ color: '#f43f5e' }} />
              <span className="semi small">{t('newsTrendsTitle')}</span>
            </div>
            <div className="flex col g10">
              <div className="flex justify-between items-center tiny">
                <span className="bold" style={{ color: '#fff' }}>#RanMetLaunch</span>
                <span className="faint">1.2k {t('postsCountSuffix')}</span>
              </div>
              <div className="flex justify-between items-center tiny">
                <span className="bold" style={{ color: '#fff' }}>#MinecraftBackrooms</span>
                <span className="faint">840 {t('postsCountSuffix')}</span>
              </div>
              <div className="flex justify-between items-center tiny">
                <span className="bold" style={{ color: '#fff' }}>#AIMatchRealtime</span>
                <span className="faint">520 {t('postsCountSuffix')}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 8 }}>
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
              <span className="semi small">{t('geminiGuardTitle')}</span>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.5 }}>
              {t('geminiGuardDesc')}
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
