'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Send, Sparkles, ShieldCheck, 
  MessageCircle, Heart, Image as ImageIcon, Video as VideoIcon, 
  FileText, Paperclip, X, Download, Upload,
  AlertTriangle, UserX, ShieldAlert, CheckCircle, Languages, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import { translateText } from '@/lib/translate'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../../components/AppShell'

const ICE_BREAKERS = [
  'Chào bạn! Rất vui được ghép đôi với bạn ✨',
  'Bạn có sở thích nào đang mê nhất hiện tại?',
  'Gu âm nhạc hoặc bộ phim gần đây bạn thích là gì? 🎵'
]

const POPULAR_GIFS = [
  { label: 'Anime Wave', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JldmhzYWRlZHRrOXB1czVlbm1xcmR2eHBoNTNyMGx1c2o3eW1xZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kigKjAJryWTZK/giphy.gif' },
  { label: 'Cute Cat Vibe', url: 'https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif' },
  { label: 'Dance Party', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { label: 'Heart Love', url: 'https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif' },
  { label: 'Cheers Celebration', url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif' },
  { label: 'Gaming Victory', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { label: 'Sparkle Wow', url: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif' },
  { label: 'Popcorn Chill', url: 'https://media.giphy.com/media/t3sZxY5zS5B0z5zMIz/giphy.gif' }
]

export default function ChatRoom({ chatId, myId, otherName, compatibility, initialMessages }) {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const [messages, setMessages] = useState(initialMessages || [])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedReason, setLockedReason] = useState('')
  const [showGifDrawer, setShowGifDrawer] = useState(false)
  
  // Translation state: { [msgId]: { translatedText: string, isTranslating: boolean, showTranslated: boolean } }
  const [translatedMap, setTranslatedMap] = useState({})
  
  // Modals
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  
  // Form states
  const [reportReason, setReportReason] = useState('Quấy rối tình dục / 18+')
  const [disconnectType, setDisconnectType] = useState('temporary_24h')
  const [mediaType, setMediaType] = useState('image')
  const [mediaUrl, setMediaUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const [supabase] = useState(() => createClient())

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Handle AI Message Translation
  async function handleTranslateMessage(msgId, originalContent) {
    if (translatedMap[msgId]?.translatedText) {
      setTranslatedMap((prev) => ({
        ...prev,
        [msgId]: { ...prev[msgId], showTranslated: !prev[msgId].showTranslated }
      }))
      return
    }

    setTranslatedMap((prev) => ({
      ...prev,
      [msgId]: { isTranslating: true, showTranslated: true }
    }))

    const translated = await translateText(originalContent, lang)
    setTranslatedMap((prev) => ({
      ...prev,
      [msgId]: { translatedText: translated, isTranslating: false, showTranslated: true }
    }))
  }

  // Load chat status (check if locked)
  useEffect(() => {
    async function checkChatStatus() {
      const { data: chat } = await supabase.from('chats').select('is_locked, locked_reason, ended_at').eq('id', chatId).single()
      if (chat) {
        if (chat.is_locked) {
          setIsLocked(true)
          setLockedReason(chat.locked_reason || 'Bị báo cáo hành vi lạm dụng')
        }
      }
    }
    checkChatStatus()

    const channel = supabase
      .channel('chat:' + chatId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chats', filter: `id=eq.${chatId}` },
        (payload) => {
          if (payload.new.is_locked) {
            setIsLocked(true)
            setLockedReason(payload.new.locked_reason || 'Đang được AI xem xét vi phạm')
          }
          if (payload.new.ended_at) {
            showToast('Đối phương đã ngắt kết nối cuộc trò chuyện.')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  async function sendText(textToSend) {
    if (isLocked) {
      showToast('Cuộc trò chuyện đang bị khóa an toàn!')
      return
    }
    const text = (textToSend || draft).trim()
    if (!text || isSending) return

    // GEMINI & DEEP SLANG AUTO-MODERATION CHECK
    const modCheck = await checkContent(text)
    if (!modCheck.isSafe) {
      showToast('Tin nhắn vi phạm tiêu chuẩn cộng đồng hoặc chứa từ ngữ độc hại!')
      return
    }

    setDraft('')
    setIsSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: myId, content: text, kind: 'text' })

    setIsSending(false)

    if (error) {
      setDraft(text)
      showToast('Lỗi gửi tin nhắn: ' + error.message)
    }
  }

  async function handleDeviceFilePick(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showToast('Đang tải tệp từ thiết bị...')
      const res = await readFileAsDataUrl(file, 40)
      setMediaUrl(res.url)
      setFileName(res.name)

      if (file.type.startsWith('image/')) setMediaType('image')
      else if (file.type.startsWith('video/')) setMediaType('video')
      else setMediaType('file')

      showToast('Đã chọn tệp từ máy! Bấm "Gửi đính kèm" để gửi.')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function sendMedia(e) {
    e?.preventDefault()
    if (isLocked) {
      showToast('Cuộc trò chuyện đang bị khóa!')
      return
    }
    if (!mediaUrl.trim() || isSending) return

    setIsSending(true)
    const caption = draft.trim() || (mediaType === 'image' ? '[Hình ảnh]' : mediaType === 'video' ? '[Video]' : '[Tệp đính kèm]')

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: myId,
        content: caption,
        kind: mediaType,
        media_url: mediaUrl.trim(),
        file_name: fileName.trim() || (mediaType === 'file' ? 'Tai_lieu.pdf' : null)
      })

    setIsSending(false)
    setShowMediaModal(false)
    setMediaUrl('')
    setFileName('')
    setDraft('')

    if (error) {
      showToast('Lỗi gửi tệp: ' + error.message)
    } else {
      showToast('Đã gửi tệp đính kèm! ✨')
    }
  }

  async function sendGif(gifUrl, gifLabel) {
    if (isLocked) {
      showToast('Cuộc trò chuyện đang bị khóa!')
      return
    }
    setShowGifDrawer(false)
    setIsSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: myId,
        content: `[GIF: ${gifLabel}]`,
        kind: 'image',
        media_url: gifUrl
      })

    setIsSending(false)
    if (error) {
      showToast('Lỗi gửi GIF: ' + error.message)
    } else {
      showToast('Đã gửi GIF! ✨')
    }
  }

  // REPORT ABUSE & AI LOCK CHAT
  async function handleReportSubmit(e) {
    e.preventDefault()
    setIsLocked(true)
    setLockedReason(reportReason)
    setShowReportModal(false)

    await supabase.from('chats').update({
      is_locked: true,
      locked_reason: `Báo cáo: ${reportReason}`
    }).eq('id', chatId)

    await supabase.from('chat_reports').insert({
      chat_id: chatId,
      reporter_id: myId,
      reported_user_id: myId,
      reason: reportReason,
      ai_verdict: 'AI Auto-Locked for Safety Review'
    })

    showToast('Đã báo cáo vi phạm! Hệ thống AI đã tạm khóa phòng chat từ cả 2 phía để kiểm tra. 🛡️')
  }

  // DISCONNECT CHAT WITH COOLDOWN
  async function handleDisconnectSubmit(e) {
    e.preventDefault()
    setShowDisconnectModal(false)

    await supabase.from('chats').update({
      ended_at: new Date().toISOString(),
      disconnect_type: disconnectType
    }).eq('id', chatId)

    showToast('Đã ngắt kết nối cuộc trò chuyện.')
    setTimeout(() => {
      router.push('/chats')
    }, 800)
  }

  const initial = (otherName || 'N').charAt(0).toUpperCase()

  return (
    <AppShell>
      <div className="card flex col justify-between" style={{ height: 'calc(100vh - 80px)', minHeight: 560, padding: 0, overflow: 'hidden', border: '1px solid var(--gold-hairline)' }}>
        {/* Sleek Top Chat Header */}
        <div 
          className="flex items-center justify-between" 
          style={{ 
            padding: '12px 18px', 
            background: 'var(--lacquer-deep)',
            borderBottom: '1px solid var(--gold-hairline)',
            zIndex: 10
          }}
        >
          <div className="flex items-center g10">
            <Link href="/chats" className="btn-icon" style={{ width: 34, height: 34 }}>
              <ArrowLeft size={16} />
            </Link>

            <div className="flex items-center g10">
              <div style={{ position: 'relative' }}>
                <div
                  className="avatar"
                  style={{
                    width: 38,
                    height: 38,
                    fontSize: 15,
                  }}
                >
                  {initial}
                </div>
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: isLocked ? '#f43f5e' : 'var(--emerald-patina)', 
                    border: '2px solid var(--lacquer-black)' 
                  }} 
                />
              </div>

              <div>
                <div className="semi small champagne flex items-center g6">
                  <span>{otherName || 'Người bạn mới'}</span>
                  {isLocked && <span className="badge tiny" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: 9 }}>ĐÃ KHÓA</span>}
                </div>
                {compatibility != null && (
                  <div className="tiny bold gold flex items-center g4">
                    <Sparkles size={10} /> {compatibility}% MATCH
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools: Report & Disconnect */}
          <div className="flex items-center g6">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 11.5, borderRadius: 6, color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.25)' }}
              onClick={() => setShowReportModal(true)}
              title="Báo cáo vi phạm"
            >
              <AlertTriangle size={13} /> {t('reportAbuse')}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 11.5, borderRadius: 6 }}
              onClick={() => setShowDisconnectModal(true)}
              title="Ngắt kết nối trò chuyện"
            >
              <UserX size={13} /> {t('disconnect')}
            </button>
          </div>
        </div>

        {/* AI LOCKED WARNING BANNER IF LOCKED */}
        {isLocked && (
          <div 
            style={{ 
              background: 'rgba(244, 63, 94, 0.12)',
              borderBottom: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ShieldAlert size={18} style={{ color: '#fb7185', flexShrink: 0 }} />
            <div className="grow">
              <div className="semi small champagne">Phòng trò chuyện đã bị AI tạm khóa từ 2 phía 🔒</div>
              <div className="tiny faint" style={{ color: '#fca5a5' }}>
                Lý do: {lockedReason || 'Nghi vấn có hành vi lạm dụng / quấy rối online theo báo cáo'}. Không thể gửi thêm tin nhắn.
              </div>
            </div>
          </div>
        )}

        {/* Message History Feed */}
        <div 
          ref={scrollRef} 
          className="grow" 
          style={{ 
            overflowY: 'auto', 
            padding: '18px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          {messages.length === 0 && (
            <div className="flex col items-center center-text" style={{ margin: 'auto 0', padding: '30px 16px' }}>
              <div 
                style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: '50%', 
                  background: 'rgba(245, 192, 66, 0.1)', 
                  border: '1px solid var(--gold-hairline-strong)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 14,
                  color: 'var(--kinpaku-gold)'
                }} 
              >
                <MessageCircle size={24} />
              </div>

              <div className="bold champagne" style={{ fontSize: 16, marginBottom: 4 }}>
                Bắt đầu cuộc trò chuyện!
              </div>
              <div className="tiny faint" style={{ marginBottom: 18, maxWidth: 300 }}>
                Hai bạn đã được ghép nối nhờ độ tương thích cao. Hãy gửi lời chào mở đầu:
              </div>

              <div className="flex col g8" style={{ width: '100%', maxWidth: 360 }}>
                {ICE_BREAKERS.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendText(text)}
                    className="card card-interactive"
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      background: 'var(--lacquer-deep)',
                      borderRadius: 10,
                      border: '1px solid var(--gold-hairline)'
                    }}
                  >
                    💬 {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.sender_id === myId
            const time = new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const translation = translatedMap[m.id]

            return (
              <div key={m.id} className={`msg-row ${isMe ? 'me' : ''}`}>
                <div className={`msg-bubble ${isMe ? 'me' : 'them'}`} style={{ maxWidth: m.kind === 'image' || m.kind === 'video' ? '85%' : '78%' }}>
                  
                  {/* IMAGE ATTACHMENT */}
                  {m.kind === 'image' && m.media_url && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 6, maxHeight: 260 }}>
                      <img 
                        src={m.media_url} 
                        alt="Chat attachment" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  {/* VIDEO ATTACHMENT */}
                  {m.kind === 'video' && m.media_url && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 6, maxHeight: 280, background: '#000' }}>
                      <video 
                        src={m.media_url} 
                        controls 
                        playsInline 
                        style={{ width: '100%', maxHeight: 280, display: 'block' }} 
                      />
                    </div>
                  )}

                  {/* FILE ATTACHMENT */}
                  {m.kind === 'file' && m.media_url && (
                    <a 
                      href={m.media_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center g10"
                      style={{ 
                        padding: '8px 12px', 
                        background: 'rgba(0,0,0,0.25)', 
                        borderRadius: 8, 
                        marginBottom: 6,
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <FileText size={20} style={{ color: 'var(--verdigris-patina)' }} />
                      <div className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div className="semi small">{m.file_name || 'Tệp đính kèm'}</div>
                        <div className="tiny faint">Bấm để tải xuống</div>
                      </div>
                      <Download size={14} />
                    </a>
                  )}

                  {/* Text Content with AI Translation Display */}
                  <div>
                    {translation?.showTranslated && translation?.translatedText ? (
                      <div>
                        <div style={{ borderLeft: isMe ? '2px solid rgba(0,0,0,0.3)' : '2px solid var(--kinpaku-gold)', paddingLeft: 8, marginBottom: 4 }}>
                          {translation.translatedText}
                        </div>
                        <div className="tiny faint" style={{ fontSize: 10, opacity: 0.7 }}>
                          (Gốc: {m.content})
                        </div>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>

                  {/* Bottom Message Row: Timestamp & AI Translate Action */}
                  <div className="flex justify-between items-center" style={{ marginTop: 4, gap: 10 }}>
                    {/* 1-Tap AI Translate Button */}
                    {m.kind === 'text' && m.content && (
                      <button
                        type="button"
                        onClick={() => handleTranslateMessage(m.id, m.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isMe ? 'rgba(0,0,0,0.7)' : 'var(--kinpaku-gold)',
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: 0
                        }}
                      >
                        {translation?.isTranslating ? (
                          <><Loader2 size={9} className="spin" /> {t('aiTranslating')}</>
                        ) : translation?.showTranslated ? (
                          <><Languages size={9} /> {t('showOriginal')}</>
                        ) : (
                          <><Sparkles size={9} /> {t('aiTranslate')}</>
                        )}
                      </button>
                    )}

                    <div 
                      className="tiny rm-num" 
                      style={{ 
                        fontSize: 10, 
                        opacity: 0.65, 
                        marginLeft: 'auto',
                        fontWeight: 500
                      }}
                    >
                      {time}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sleek Bottom Input Bar with Media Attachment & GIF Drawer */}
        <div 
          style={{ 
            padding: '12px 16px', 
            background: 'var(--lacquer-deep)',
            borderTop: '1px solid var(--gold-hairline)',
            position: 'relative'
          }}
        >
          {/* POPULAR GIFS DRAWER */}
          {showGifDrawer && (
            <div 
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 16,
                right: 16,
                marginBottom: 8,
                background: 'var(--raised-lacquer)',
                border: '1px solid var(--gold-hairline-strong)',
                borderRadius: 12,
                padding: 12,
                boxShadow: '0 16px 36px rgba(0,0,0,0.8)',
                zIndex: 40,
                animation: 'msgPop 0.2s ease'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--gold-hairline)' }}>
                <span className="tiny bold gold flex items-center g4">
                  <Sparkles size={12} /> Nhãn dán GIF & Reaction Động
                </span>
                <button 
                  type="button" 
                  className="btn-icon" 
                  style={{ width: 22, height: 22 }}
                  onClick={() => setShowGifDrawer(false)}
                >
                  <X size={13} />
                </button>
              </div>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 8,
                  maxHeight: 180,
                  overflowY: 'auto'
                }}
              >
                {POPULAR_GIFS.map((g, idx) => (
                  <div
                    key={idx}
                    onClick={() => sendGif(g.url, g.label)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid var(--gold-hairline)',
                      background: 'var(--lacquer-deep)',
                      height: 72,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={g.url} alt={g.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLocked ? (
            <div className="center-text tiny faint" style={{ padding: '6px 0', color: '#fb7185' }}>
              🔒 Cuộc trò chuyện đã bị tạm khóa an toàn. Bạn không thể gửi thêm tin nhắn.
            </div>
          ) : (
            <div className="flex items-center g8">
              {/* Attachment Button */}
              <button
                type="button"
                className="btn-icon"
                style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }}
                onClick={() => setShowMediaModal(true)}
                title="Đăng Ảnh / Video / File từ máy"
              >
                <Paperclip size={16} style={{ color: 'var(--kinpaku-gold)' }} />
              </button>

              {/* GIF Sticker Button */}
              <button
                type="button"
                className={`btn-icon ${showGifDrawer ? 'btn-primary' : ''}`}
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 8, 
                  flexShrink: 0,
                  fontWeight: 800,
                  fontSize: 11,
                  background: showGifDrawer ? 'var(--gold-gradient)' : 'var(--inset-lacquer)',
                  color: showGifDrawer ? 'var(--dark-ink)' : 'var(--kinpaku-gold)'
                }}
                onClick={() => setShowGifDrawer(!showGifDrawer)}
                title="Gửi nhãn dán GIF động"
              >
                GIF
              </button>

              <input
                className="input"
                style={{ 
                  borderRadius: 8, 
                  padding: '11px 16px',
                  fontSize: 14,
                  background: 'var(--raised-lacquer)'
                }}
                placeholder="Nhập tin nhắn (Tự động dịch cho đối phương)..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendText()
                  } 
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 8, 
                  padding: 0, 
                  flexShrink: 0 
                }}
                onClick={() => sendText()}
                disabled={!draft.trim() || isSending}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REPORT ABUSE MODAL */}
      {showReportModal && (
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
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 440, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <div className="flex items-center g8">
                <AlertTriangle size={18} style={{ color: '#fb7185' }} />
                <h2 className="rm-title" style={{ fontSize: 16 }}>Báo Cáo Vi Phạm & Lạm Dụng</h2>
              </div>
              <button type="button" onClick={() => setShowReportModal(false)} className="btn-icon" style={{ width: 28, height: 28 }}>✕</button>
            </div>

            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 14 }}>
              Khi bạn gửi báo cáo, hệ thống AI sẽ <b>khóa ngay lập tức phòng chat từ cả 2 phía</b> để bảo vệ bạn và xem xét nội dung vi phạm.
            </p>

            <form onSubmit={handleReportSubmit} className="flex col g14">
              <div className="field-group">
                <label className="field-label">Lý do báo cáo vi phạm:</label>
                <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="Quấy rối tình dục / Gạ gẫm 18+" style={{ background: '#120f18' }}>Quấy rối tình dục / Gạ gẫm 18+</option>
                  <option value="Đe dọa / Ngôn từ thù địch / Xâm hại" style={{ background: '#120f18' }}>Đe dọa / Ngôn từ thù địch / Xâm hại</option>
                  <option value="Lừa đảo / Gửi link độc hại / Spam" style={{ background: '#120f18' }}>Lừa đảo / Gửi link độc hại / Spam</option>
                  <option value="Gửi hình ảnh / video khiêu dâm trái phép" style={{ background: '#120f18' }}>Gửi hình ảnh / video khiêu dâm trái phép</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: '#f43f5e', color: '#fff' }}>
                <ShieldAlert size={15} /> Gửi Báo Cáo & Khóa Chat Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DISCONNECT MODAL */}
      {showDisconnectModal && (
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
          onClick={() => setShowDisconnectModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 440, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <div className="flex items-center g8">
                <UserX size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                <h2 className="rm-title" style={{ fontSize: 16 }}>Ngắt Kết Nối Trò Chuyện</h2>
              </div>
              <button type="button" onClick={() => setShowDisconnectModal(false)} className="btn-icon" style={{ width: 28, height: 28 }}>✕</button>
            </div>

            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 14 }}>
              Bạn có thể chọn thời gian cho phép hệ thống ghép lại người này trong tương lai:
            </p>

            <form onSubmit={handleDisconnectSubmit} className="flex col g14">
              <div className="field-group">
                <label className="field-label">Tùy chọn ghép lại:</label>
                <select className="input" value={disconnectType} onChange={(e) => setDisconnectType(e.target.value)}>
                  <option value="temporary_24h" style={{ background: '#120f18' }}>Tạm ngắt kết nối (Có thể ghép lại sau 24 giờ)</option>
                  <option value="temporary_7d" style={{ background: '#120f18' }}>Tạm ngắt kết nối (Có thể ghép lại sau 7 ngày)</option>
                  <option value="permanent" style={{ background: '#120f18' }}>Ngắt kết nối vĩnh viễn (Không bao giờ ghép lại)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                <CheckCircle size={15} /> Xác nhận ngắt kết nối
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEND MEDIA / FILE MODAL */}
      {showMediaModal && (
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
          onClick={() => setShowMediaModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 440, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <h2 className="rm-title" style={{ fontSize: 16 }}>Tải Lên Tệp & Ảnh Từ Thiết Bị</h2>
              <button 
                type="button" 
                onClick={() => setShowMediaModal(false)}
                className="btn-icon" 
                style={{ width: 28, height: 28 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '14px', borderStyle: 'dashed', width: '100%', borderRadius: 10 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} style={{ color: 'var(--kinpaku-gold)' }} /> 
                {mediaUrl ? `✓ Đã chọn: ${fileName || 'Tệp đính kèm'}` : 'Bấm để chọn Ảnh / Video / Tệp từ máy'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*,video/*,.pdf,.zip,.doc,.docx,.txt" 
                style={{ display: 'none' }} 
                onChange={handleDeviceFilePick} 
              />
            </div>

            {mediaUrl && (
              <div style={{ marginBottom: 14, padding: 10, background: 'var(--lacquer-deep)', borderRadius: 8 }}>
                {mediaType === 'image' && (
                  <img src={mediaUrl} alt="Preview" style={{ maxHeight: 160, borderRadius: 6, width: '100%', objectFit: 'contain' }} />
                )}
                {mediaType === 'video' && (
                  <video src={mediaUrl} controls style={{ maxHeight: 160, borderRadius: 6, width: '100%' }} />
                )}
                {mediaType === 'file' && (
                  <div className="flex items-center g8">
                    <FileText size={18} style={{ color: 'var(--verdigris-patina)' }} />
                    <span className="semi small champagne">{fileName}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={sendMedia} className="flex col g12">
              <div className="field-group">
                <label className="field-label">Lời nhắn kèm theo (Tùy chọn)</label>
                <input 
                  className="input" 
                  placeholder="Gửi bạn xem nhé..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }} disabled={!mediaUrl.trim() || isSending}>
                <Send size={15} /> Gửi tệp đính kèm vào phòng chat
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
            padding: '10px 20px',
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
