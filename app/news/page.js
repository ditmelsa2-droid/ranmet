'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Newspaper, Heart, MessageCircle, Share2, Send, 
  Sparkles, Flame, Clock, AlertCircle, ShieldCheck, Upload,
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
    content: 'Setup không gian làm việc ban đêm phong cách Kinpaku Gold và vừa hoàn thiện tính năng AI Vision Multimodal trên Next.js 🚀 Mọi người trải nghiệm giao diện mới thế nào?',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['#Developer', '#Nextjs', '#Impeccable'],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likesCount: 34,
    comments: [
      { id: 1, user_name: 'VyVy_Anime', content: 'Giao diện mới nhìn sang trọng và sắc nét thật sự á chị ơi! ✨' }
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
    'post-seed-2': [{ id: 1, user_name: 'VyVy_Anime', content: 'Giao diện mới nhìn sang trọng và sắc nét thật sự á chị ơi! ✨' }]
  })
  const [commentDrafts, setCommentDrafts] = useState({})
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null)
  
  // Translation state for posts & comments: { [id]: { translated: string, isTranslating: boolean, show: boolean } }
  const [postTranslations, setPostTranslations] = useState({})
  const [commentTranslations, setCommentTranslations] = useState({})

  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('User')
  const [userProfile, setUserProfile] = useState(null)
  const [isImageDraftNsfw, setIsImageDraftNsfw] = useState(false)
  const [unblurredNewsMap, setUnblurredNewsMap] = useState({})
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
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile) {
          setUserProfile(profile)
          if (profile.display_name) setCurrentUserName(profile.display_name)
        }
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
      showToast('Đang quét an toàn hình ảnh bằng AI Vision... 👁️')
      const res = await readFileAsDataUrl(file, 20)

      // Gemini Vision Check
      const { checkImageVisualSafety } = await import('@/lib/videoInspector')
      const visionCheck = await checkImageVisualSafety(res.url)
      
      if (!visionCheck.isAllowed) {
        showToast(`Hình ảnh bị AI từ chối: ${visionCheck.reason || 'Nội dung bạo lực / bất hợp pháp!'} ⚠️`)
        setImageDraft('')
        setIsImageDraftNsfw(false)
        return
      }

      if (visionCheck.isNsfw) {
        setIsImageDraftNsfw(true)
        showToast('AI phát hiện ảnh 18+ — Đã gắn nhãn NSFW và kích hoạt làm mờ bảo vệ! 🔞')
      } else {
        setIsImageDraftNsfw(false)
        showToast('Đã đính kèm ảnh thành công! 🖼️')
      }

      setImageDraft(res.url)
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!postDraft.trim() || !currentUserId) return

    // GEMINI AI & SLANG AUTO-MODERATION CHECK
    const modCheck = await checkContent(postDraft)
    let isNsfw = isImageDraftNsfw

    if (!modCheck.isSafe) {
      if (modCheck.reason?.includes('18+') || modCheck.reason?.includes('nhạy cảm') || modCheck.reason?.includes('thô tục')) {
        isNsfw = true
      } else {
        setModerationWarning(`Hệ thống AI từ chối: Bài viết chứa nội dung không an toàn (${modCheck.flaggedWord}). Hãy điều chỉnh để bảo vệ cộng đồng!`)
        showToast('Nội dung bài viết vi phạm tiêu chuẩn an toàn!')
        return
      }
    }

    setModerationWarning('')

    const newPost = {
      author_id: currentUserId,
      author_name: currentUserName,
      author_avatar: currentUserName.charAt(0).toUpperCase(),
      content: postDraft.trim(),
      image_url: imageDraft.trim() || null,
      tags: ['#RanNews', '#Community'],
      is_nsfw: isNsfw
    }

    const { data, error } = await supabase.from('rannews_posts').insert(newPost).select().single()
    if (!error && data) {
      setPosts([data, ...posts])
    } else {
      setPosts([{ id: 'post-' + Date.now(), ...newPost, created_at: new Date().toISOString() }, ...posts])
    }

    setPostDraft('')
    setImageDraft('')
    setIsImageDraftNsfw(false)
    showToast(isNsfw ? 'Đã đăng bài viết (Chế độ 18+ đã làm mờ)! 🔞' : 'Đã đăng bài viết lên RanNews! 🎉')
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
          {/* CREATE POST CARD */}
          <div 
            className="card"
            style={{
              padding: 20,
              background: 'var(--raised-lacquer)',
              border: '1px solid var(--gold-hairline-strong)'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div className="flex items-center g10">
                <div className="avatar" style={{ width: 38, height: 38, fontSize: 14 }}>
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="semi small champagne">{currentUserName}</div>
                  <div className="tiny faint">{t('composerSub')}</div>
                </div>
              </div>

              <span className="badge badge-success tiny">
                <ShieldCheck size={11} /> Gemini Guard
              </span>
            </div>

            {moderationWarning && (
              <div className="err-text" style={{ marginBottom: 12 }}>
                <AlertCircle size={15} /> {moderationWarning}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="flex col g10">
              <textarea
                className="input"
                rows={3}
                placeholder={`${currentUserName} ${t('composerPlaceholder')}`}
                value={postDraft}
                onChange={(e) => setPostDraft(e.target.value)}
                required
                style={{ resize: 'none' }}
              />

              {/* Image Preview */}
              {imageDraft && (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', maxHeight: 220, animation: 'msgPop 0.2s ease', border: '1px solid var(--gold-hairline)' }}>
                  <img src={imageDraft} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.7)' }}
                    onClick={() => setImageDraft('')}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center" style={{ paddingTop: 8, borderTop: '1px solid var(--gold-hairline)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 6 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} style={{ color: 'var(--verdigris-patina)' }} /> {t('uploadPhotoBtn')}
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
                  style={{ width: 'auto', padding: '7px 18px', fontSize: 13, borderRadius: 6 }}
                  disabled={!postDraft.trim()}
                >
                  <Send size={13} /> {t('postNewsBtn')}
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
                <div key={post.id} className="card" style={{ padding: 20 }}>
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                    <div className="flex items-center g10">
                      <div className="avatar" style={{ width: 38, height: 38, fontSize: 14 }}>
                        {(post.author_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="semi small champagne">{post.author_name}</div>
                        <div className="tiny faint flex items-center g4 rm-num">
                          <Clock size={11} /> {timeStr} · Global
                        </div>
                      </div>
                    </div>

                    {/* AI Translation 1-tap button */}
                    <button 
                      type="button" 
                      className="btn-secondary flex items-center g4" 
                      style={{ padding: '4px 8px', fontSize: 11, borderRadius: 6, color: 'var(--kinpaku-gold)' }}
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
                  <div className="small champagne" style={{ lineHeight: 1.65, marginBottom: 12, whiteSpace: 'pre-line' }}>
                    {postTrans?.show && postTrans?.translated ? (
                      <div>
                        <div style={{ borderLeft: '2px solid var(--kinpaku-gold)', paddingLeft: 10, color: 'var(--champagne)', marginBottom: 4 }}>
                          {postTrans.translated}
                        </div>
                        <div className="tiny faint">(Original: {post.content})</div>
                      </div>
                    ) : (
                      post.content
                    )}
                  </div>

                  {/* Attached Image with 18+ Blur & Age Gate */}
                  {post.image_url && (() => {
                    const isPostNsfw = !!post.is_nsfw || (post.tags && post.tags.some(t => /18|nsfw|sex|porn|hentai/i.test(t)))
                    const isUserAdult = !!userProfile?.age_verified
                    const isUnblurred = !!unblurredNewsMap[post.id]
                    const shouldBlur = isPostNsfw && (!isUserAdult || !isUnblurred)

                    return (
                      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 12, maxHeight: 380, border: '1px solid var(--gold-hairline)' }}>
                        <img 
                          src={post.image_url} 
                          alt="Post attachment" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            filter: shouldBlur ? 'blur(40px) brightness(0.6)' : 'none',
                            transform: shouldBlur ? 'scale(1.1)' : 'none',
                            transition: 'filter 0.3s ease, transform 0.3s ease'
                          }} 
                        />

                        {shouldBlur && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(10, 8, 14, 0.82)',
                              backdropFilter: 'blur(14px)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 16,
                              textAlign: 'center',
                              zIndex: 5
                            }}
                          >
                            <div style={{ fontSize: 22, marginBottom: 4 }}>🔞</div>
                            <div className="semi small" style={{ color: '#f43f5e', marginBottom: 2 }}>
                              Hình ảnh 18+ Nhạy cảm
                            </div>
                            <p className="tiny faint" style={{ maxWidth: 260, lineHeight: 1.4, marginBottom: 10 }}>
                              {!isUserAdult 
                                ? 'Đã làm mờ bảo vệ. Cần xác thực độ tuổi 18+ trong Hồ sơ để xem.'
                                : 'Hình ảnh 18+ đã làm mờ.'}
                            </p>

                            {!isUserAdult ? (
                              <Link
                                href="/profile"
                                className="btn btn-secondary"
                                style={{ width: 'auto', padding: '5px 12px', fontSize: 11, borderRadius: 6, color: '#f43f5e' }}
                              >
                                🛡️ Xác thực 18+ trong Hồ sơ
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '5px 14px', fontSize: 11.5, borderRadius: 6 }}
                                onClick={() => setUnblurredNewsMap((prev) => ({ ...prev, [post.id]: true }))}
                              >
                                👁️ Mở khóa xem ảnh
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {post.tags.map((tagItem) => (
                        <span key={tagItem} className="tiny gold">
                          {tagItem}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar (Like, Comment, Share) */}
                  <div className="flex justify-between items-center" style={{ paddingTop: 8, borderTop: '1px solid var(--gold-hairline)' }}>
                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        border: 'none',
                        background: isLiked ? 'rgba(245, 192, 66, 0.12)' : 'transparent',
                        color: isLiked ? 'var(--kinpaku-gold)' : 'var(--text-muted)'
                      }}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <Heart size={15} style={{ fill: isLiked ? 'var(--kinpaku-gold)' : 'none' }} />
                      <span className="bold rm-num">{likesCount}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 13, border: 'none', background: 'transparent' }}
                      onClick={() => setActiveCommentsPostId(showCommentsSection ? null : post.id)}
                    >
                      <MessageCircle size={15} />
                      <span className="bold rm-num">{postComments.length} {t('commentsCountSuffix')}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary flex items-center g6"
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 13, border: 'none', background: 'transparent' }}
                      onClick={() => showToast('Link copied! 📋')}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>

                  {/* EXPANDABLE COMMENTS SECTION */}
                  {showCommentsSection && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gold-hairline)', animation: 'msgPop 0.2s ease' }}>
                      {/* Comments Feed */}
                      <div className="flex col g8" style={{ marginBottom: 10 }}>
                        {postComments.length === 0 ? (
                          <div className="tiny faint">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                        ) : (
                          postComments.map((c) => {
                            const cTrans = commentTranslations[c.id]
                            return (
                              <div key={c.id} className="flex g8 items-start">
                                <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                                  {(c.user_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ background: 'var(--lacquer-deep)', padding: '7px 10px', borderRadius: 8, grow: 1, width: '100%', border: '1px solid var(--gold-hairline)' }}>
                                  <div className="flex justify-between items-center">
                                    <span className="semi tiny gold">{c.user_name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleTranslateComment(c.id, c.content)}
                                      style={{ background: 'none', border: 'none', color: 'var(--kinpaku-gold)', fontSize: 10, cursor: 'pointer' }}
                                    >
                                      {cTrans?.isTranslating ? '...' : cTrans?.show ? t('showOriginal') : t('aiTranslate')}
                                    </button>
                                  </div>
                                  <div className="small champagne" style={{ marginTop: 2 }}>
                                    {cTrans?.show && cTrans?.translated ? cTrans.translated : c.content}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex g6 items-center">
                        <input
                          className="input"
                          style={{ padding: '7px 12px', fontSize: 13, borderRadius: 6 }}
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
                          style={{ width: 34, height: 34, borderRadius: 6, padding: 0, flexShrink: 0 }}
                          onClick={() => handleAddComment(post.id)}
                        >
                          <Send size={13} />
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
        <div className="flex col g16">
          <div className="card" style={{ padding: 18 }}>
            <div className="flex items-center g8" style={{ marginBottom: 10 }}>
              <Flame size={15} style={{ color: 'var(--kinpaku-gold)' }} />
              <span className="semi small champagne">{t('newsTrendsTitle')}</span>
            </div>
            <div className="flex col g8">
              <div className="flex justify-between items-center tiny">
                <span className="bold champagne">#RanMetLaunch</span>
                <span className="faint rm-num">1.2k {t('postsCountSuffix')}</span>
              </div>
              <div className="flex justify-between items-center tiny">
                <span className="bold champagne">#MinecraftBackrooms</span>
                <span className="faint rm-num">840 {t('postsCountSuffix')}</span>
              </div>
              <div className="flex justify-between items-center tiny">
                <span className="bold champagne">#AIMatchRealtime</span>
                <span className="faint rm-num">520 {t('postsCountSuffix')}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: 'var(--lacquer-deep)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 6 }}>
              <ShieldCheck size={15} style={{ color: 'var(--emerald-patina)' }} />
              <span className="semi small champagne">{t('geminiGuardTitle')}</span>
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
