'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Send, Sparkles, ShieldCheck, 
  MessageCircle, Heart, Flame, Image as ImageIcon, Video as VideoIcon, 
  FileText, Paperclip, Plus, X, Download, Play, Upload, Camera,
  AlertTriangle, UserX, Lock, ShieldAlert, CheckCircle, Languages, Loader2
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

export default function ChatRoom({ chatId, myId, otherName, compatibility, initialMessages }) {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const [messages, setMessages] = useState(initialMessages || [])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedReason, setLockedReason] = useState('')
  
  // Translation state: { [msgId]: { translatedText: string, isTranslating: boolean } }
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
      // Toggle off
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

  // 🛡️ REPORT ABUSE & AI LOCK CHAT
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

  // 🔌 DISCONNECT CHAT WITH COOLDOWN
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
      <div className="card flex col justify-between" style={{ height: 'calc(100vh - 80px)', minHeight: 560, padding: 0, overflow: 'hidden' }}>
        {/* Sleek Top Chat Header */}
        <div 
          className="flex items-center justify-between" 
          style={{ 
            padding: '14px 20px', 
            background: 'rgba(18, 14, 28, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 10
          }}
        >
          <div className="flex items-center g12">
            <Link href="/chats" className="btn-icon" style={{ width: 38, height: 38 }}>
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center g10">
              <div style={{ position: 'relative' }}>
                <div
                  className="avatar"
                  style={{
                    width: 42,
                    height: 42,
                    fontSize: 17,
                    background: 'var(--brand-gradient)',
                  }}
                >
                  {initial}
                </div>
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: isLocked ? '#f43f5e' : '#10b981', 
                    border: '2px solid #161320' 
                  }} 
                />
              </div>

              <div>
                <div className="semi small flex items-center g6">
                  <span>{otherName || 'Người bạn mới'}</span>
                  {isLocked && <span className="badge tiny" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', fontSize: 10 }}>ĐÃ KHÓA</span>}
                </div>
                {compatibility != null && (
                  <div className="tiny bold flex items-center g4" style={{ color: '#ec4899' }}>
                    <Sparkles size={11} /> {compatibility}% tương thích AI
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools: Report & Disconnect */}
          <div className="flex items-center g8">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12, borderRadius: 999, color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              onClick={() => setShowReportModal(true)}
              title="Báo cáo vi phạm"
            >
              <AlertTriangle size={14} /> {t('reportAbuse')}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12, borderRadius: 999 }}
              onClick={() => setShowDisconnectModal(true)}
              title="Ngắt kết nối trò chuyện"
            >
              <UserX size={14} /> {t('disconnect')}
            </button>
          </div>
        </div>

        {/* AI LOCKED WARNING BANNER IF LOCKED */}
        {isLocked && (
          <div 
            style={{ 
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderBottom: '1px solid rgba(244, 63, 94, 0.4)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <ShieldAlert size={22} style={{ color: '#fb7185', flexShrink: 0 }} />
            <div className="grow">
              <div className="semi small" style={{ color: '#fff' }}>Phòng trò chuyện đã bị AI tạm khóa từ 2 phía 🔒</div>
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
            padding: '20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {messages.length === 0 && (
            <div className="flex col items-center center-text" style={{ margin: 'auto 0', padding: '30px 16px' }}>
              <div 
                style={{ 
                  width: 58, 
                  height: 58, 
                  borderRadius: '50%', 
                  background: 'rgba(236, 72, 153, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 16
                }}
              >
                <MessageCircle size={28} style={{ color: '#ec4899' }} />
              </div>

              <div className="bold" style={{ fontSize: 18, marginBottom: 4 }}>
                Hãy bắt đầu cuộc trò chuyện!
              </div>
              <div className="tiny faint" style={{ marginBottom: 20, maxWidth: 300 }}>
                Hai bạn đã được kết nối với nhau nhờ độ tương thích cao. Hãy gửi lời chào mở đầu:
              </div>

              <div className="flex col g8" style={{ width: '100%', maxWidth: 380 }}>
                {ICE_BREAKERS.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendText(text)}
                    className="card card-interactive"
                    style={{
                      padding: '12px 16px',
                      fontSize: 13.5,
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 14,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
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
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 6, maxHeight: 260 }}>
                      <img 
                        src={m.media_url} 
                        alt="Chat attachment" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  {/* VIDEO ATTACHMENT */}
                  {m.kind === 'video' && m.media_url && (
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 6, maxHeight: 280, background: '#000' }}>
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
                        padding: '10px 14px', 
                        background: 'rgba(0,0,0,0.25)', 
                        borderRadius: 12, 
                        marginBottom: 6,
                        textDecoration: 'none',
                        color: '#fff'
                      }}
                    >
                      <FileText size={22} style={{ color: '#06b6d4' }} />
                      <div className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div className="semi small" style={{ color: '#fff' }}>{m.file_name || 'Tập tin đính kèm'}</div>
                        <div className="tiny faint">Bấm để tải xuống / mở xem</div>
                      </div>
                      <Download size={16} />
                    </a>
                  )}

                  {/* Text Content with AI Translation Display */}
                  <div>
                    {translation?.showTranslated && translation?.translatedText ? (
                      <div>
                        <div style={{ borderLeft: '2px solid #a855f7', paddingLeft: 8, marginBottom: 4, color: '#f3e8ff' }}>
                          {translation.translatedText}
                        </div>
                        <div className="tiny faint" style={{ fontSize: 10, opacity: 0.6 }}>
                          (Bản gốc: {m.content})
                        </div>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>

                  {/* Bottom Message Row: Timestamp & AI Translate Action */}
                  <div className="flex justify-between items-center" style={{ marginTop: 6, gap: 10 }}>
                    {/* 1-Tap AI Translate Button */}
                    {m.kind === 'text' && m.content && (
                      <button
                        type="button"
                        onClick={() => handleTranslateMessage(m.id, m.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c084fc',
                          fontSize: 10.5,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: 0,
                          opacity: 0.85
                        }}
                      >
                        {translation?.isTranslating ? (
                          <><Loader2 size={10} className="spin" /> {t('aiTranslating')}</>
                        ) : translation?.showTranslated ? (
                          <><Languages size={10} /> {t('showOriginal')}</>
                        ) : (
                          <><Sparkles size={10} /> {t('aiTranslate')}</>
                        )}
                      </button>
                    )}

                    <div 
                      className="tiny" 
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

        {/* Sleek Bottom Input Bar with Media Attachment */}
        <div 
          style={{ 
            padding: '14px 18px', 
            background: 'rgba(18, 14, 28, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {isLocked ? (
            <div className="center-text tiny faint" style={{ padding: '8px 0', color: '#fb7185' }}>
              🔒 Cuộc trò chuyện đã bị tạm khóa an toàn. Bạn không thể gửi thêm tin nhắn.
            </div>
          ) : (
            <div className="flex items-center g10">
              {/* Attachment Button */}
              <button
                type="button"
                className="btn-icon"
                style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
                onClick={() => setShowMediaModal(true)}
                title="Đăng Ảnh / Video / File từ máy"
              >
                <Paperclip size={18} style={{ color: '#ec4899' }} />
              </button>

              <input
                className="input"
                style={{ 
                  borderRadius: 999, 
                  padding: '13px 20px',
                  fontSize: 15,
                  background: 'rgba(255, 255, 255, 0.05)'
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
                  width: 46, 
                  height: 46, 
                  borderRadius: '50%', 
                  padding: 0, 
                  flexShrink: 0 
                }}
                onClick={() => sendText()}
                disabled={!draft.trim() || isSending}
              >
                <Send size={18} />
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
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
            style={{ width: '100%', maxWidth: 460, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="flex items-center g8">
                <AlertTriangle size={20} style={{ color: '#fb7185' }} />
                <h2 className="rm-title" style={{ fontSize: 18 }}>Báo Cáo Vi Phạm & Lạm Dụng</h2>
              </div>
              <button type="button" onClick={() => setShowReportModal(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 16 }}>
              Khi bạn gửi báo cáo, hệ thống AI sẽ <b>khóa ngay lập tức phòng chat từ cả 2 phía</b> để bảo vệ bạn và xem xét nội dung vi phạm.
            </p>

            <form onSubmit={handleReportSubmit} className="flex col g16">
              <div className="field-group">
                <label className="field-label">Lý do báo cáo vi phạm:</label>
                <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="Quấy rối tình dục / Gạ gẫm 18+" style={{ background: '#161320' }}>Quấy rối tình dục / Gạ gẫm 18+</option>
                  <option value="Đe dọa / Ngôn từ thù địch / Xâm hại" style={{ background: '#161320' }}>Đe dọa / Ngôn từ thù địch / Xâm hại</option>
                  <option value="Lừa đảo / Gửi link độc hại / Spam" style={{ background: '#161320' }}>Lừa đảo / Gửi link độc hại / Spam</option>
                  <option value="Gửi hình ảnh / video khiêu dâm trái phép" style={{ background: '#161320' }}>Gửi hình ảnh / video khiêu dâm trái phép</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' }}>
                <ShieldAlert size={16} /> Gửi Báo Cáo & Khóa Chat Ngay
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
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
            style={{ width: '100%', maxWidth: 460, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="flex items-center g8">
                <UserX size={20} style={{ color: '#f59e0b' }} />
                <h2 className="rm-title" style={{ fontSize: 18 }}>Ngắt Kết Nối Trò Chuyện</h2>
              </div>
              <button type="button" onClick={() => setShowDisconnectModal(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 16 }}>
              Bạn có thể chọn thời gian cho phép hệ thống ghép lại người này trong tương lai:
            </p>

            <form onSubmit={handleDisconnectSubmit} className="flex col g16">
              <div className="field-group">
                <label className="field-label">Tùy chọn ghép lại:</label>
                <select className="input" value={disconnectType} onChange={(e) => setDisconnectType(e.target.value)}>
                  <option value="temporary_24h" style={{ background: '#161320' }}>Tạm ngắt kết nối (Có thể ghép lại sau 24 giờ)</option>
                  <option value="temporary_7d" style={{ background: '#161320' }}>Tạm ngắt kết nối (Có thể ghép lại sau 7 ngày)</option>
                  <option value="permanent" style={{ background: '#161320' }}>Ngắt kết nối vĩnh viễn (Không bao giờ ghép lại)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                <CheckCircle size={16} /> Xác nhận ngắt kết nối
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
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
            style={{ width: '100%', maxWidth: 460, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <h2 className="rm-title" style={{ fontSize: 18 }}>Tải Lên Tệp & Ảnh Từ Thiết Bị</h2>
              <button 
                type="button" 
                onClick={() => setShowMediaModal(false)}
                className="btn-icon" 
                style={{ width: 32, height: 32 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '16px', borderStyle: 'dashed', width: '100%', borderRadius: 16 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} style={{ color: '#ec4899' }} /> 
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
              <div style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 14 }}>
                {mediaType === 'image' && (
                  <img src={mediaUrl} alt="Preview" style={{ maxHeight: 180, borderRadius: 10, width: '100%', objectFit: 'contain' }} />
                )}
                {mediaType === 'video' && (
                  <video src={mediaUrl} controls style={{ maxHeight: 180, borderRadius: 10, width: '100%' }} />
                )}
                {mediaType === 'file' && (
                  <div className="flex items-center g8">
                    <FileText size={20} style={{ color: '#06b6d4' }} />
                    <span className="semi small">{fileName}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={sendMedia} className="flex col g14">
              <div className="field-group">
                <label className="field-label">Lời nhắn kèm theo (Tùy chọn)</label>
                <input 
                  className="input" 
                  placeholder="Gửi bạn xem nhé..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }} disabled={!mediaUrl.trim() || isSending}>
                <Send size={16} /> Gửi tệp đính kèm vào phòng chat
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
