'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Send, Sparkles, ShieldCheck, 
  MessageCircle, Heart, Flame, Image as ImageIcon, Video as VideoIcon, 
  FileText, Paperclip, Plus, X, Download, Play, Upload, Camera
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkContent } from '@/lib/moderation'
import { readFileAsDataUrl } from '@/lib/upload'
import AppShell from '../../components/AppShell'

const ICE_BREAKERS = [
  'Chào bạn! Rất vui được ghép đôi với bạn ✨',
  'Bạn có sở thích nào đang mê nhất hiện tại?',
  'Gu âm nhạc hoặc bộ phim gần đây bạn thích là gì? 🎵'
]

export default function ChatRoom({ chatId, myId, otherName, compatibility, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video' | 'file'
  const [mediaUrl, setMediaUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const [supabase] = useState(() => createClient())

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  useEffect(() => {
    const channel = supabase
      .channel('chat:' + chatId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
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
                    background: '#10b981', 
                    border: '2px solid #161320' 
                  }} 
                />
              </div>

              <div>
                <div className="semi small flex items-center g6">
                  <span>{otherName || 'Người bạn mới'}</span>
                </div>
                {compatibility != null && (
                  <div className="tiny bold flex items-center g4" style={{ color: '#ec4899' }}>
                    <Sparkles size={11} /> {compatibility}% tương thích AI
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center g6">
            <span className="badge badge-glow tiny" style={{ padding: '4px 10px' }}>
              <ShieldCheck size={12} /> Gemini Protected
            </span>
          </div>
        </div>

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

                  {/* Text Content */}
                  <div>{m.content}</div>

                  <div 
                    className="tiny" 
                    style={{ 
                      fontSize: 10, 
                      opacity: 0.65, 
                      textAlign: 'right', 
                      marginTop: 4,
                      fontWeight: 500
                    }}
                  >
                    {time}
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
              placeholder="Nhập tin nhắn..."
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
        </div>
      </div>

      {/* SEND MEDIA / FILE MODAL WITH DIRECT DEVICE UPLOAD */}
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

            {/* Direct Device Upload Trigger */}
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

            {/* Media Preview if chosen */}
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
