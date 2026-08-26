'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, Sparkles, Compass, ShieldCheck, 
  Search, Clock, ChevronRight, User, MoreVertical, X, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

export default function ChatsInboxPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadChats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // Fetch all chats where current user is participant
      const { data: chatsData } = await supabase
        .from('chats')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!chatsData || chatsData.length === 0) {
        setLoading(false)
        return
      }

      // Deduplicate / Group by partner ID
      const partnerChatMap = new Map()
      const partnerIds = []

      for (const chat of chatsData) {
        const partnerId = chat.user_a === user.id ? chat.user_b : chat.user_a
        if (!partnerChatMap.has(partnerId)) {
          partnerChatMap.set(partnerId, chat)
          partnerIds.push(partnerId)
        }
      }

      const uniqueChats = Array.from(partnerChatMap.values())

      // Fetch partner profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, country, avatar_url')
        .in('id', partnerIds)

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

      // Fetch latest message for each chat
      const chatIds = uniqueChats.map((c) => c.id)
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: true })

      const lastMsgMap = new Map()
      if (messages) {
        messages.forEach((m) => {
          lastMsgMap.set(m.chat_id, m)
        })
      }

      const formatted = uniqueChats.map((c) => {
        const partnerId = c.user_a === user.id ? c.user_b : c.user_a
        const partner = profileMap.get(partnerId) || { display_name: 'Friend', country: 'Global' }
        const lastMsg = lastMsgMap.get(c.id)

        return {
          id: c.id,
          partnerId,
          name: partner.display_name,
          avatarUrl: partner.avatar_url,
          country: partner.country,
          compatibility: c.compatibility || 75,
          isLocked: c.is_locked,
          disconnectType: c.disconnect_type,
          lastMessage: lastMsg ? (lastMsg.kind === 'image' ? '[Hình ảnh]' : lastMsg.kind === 'video' ? '[Video]' : lastMsg.kind === 'file' ? '[Tệp]' : lastMsg.content) : null,
          lastTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })

      setConversations(formatted)
      setLoading(false)
    }

    loadChats()

    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        loadChats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        loadChats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <AppShell>
      <div className="flex col g20" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        {/* HEADER BAR */}
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div className="tiny faint flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <ShieldCheck size={13} style={{ color: 'var(--emerald-patina)' }} /> REALTIME MESSAGES
            </div>
            <h1 className="rm-title" style={{ fontSize: 24, marginTop: 4 }}>
              {t('inboxTitle')}
            </h1>
          </div>

          <Link href="/match" className="btn btn-primary" style={{ width: 'auto', padding: '9px 18px', fontSize: 13, borderRadius: 8 }}>
            <Compass size={15} /> {t('newMatchBtn')}
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            className="input"
            style={{ paddingLeft: 44, borderRadius: 10, background: 'var(--lacquer-deep)' }}
            placeholder={t('searchChatsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONVERSATION LIST */}
        {loading ? (
          <div className="card center-text" style={{ padding: 40 }}>
            <div className="tiny muted">Đang tải tin nhắn...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="card flex col items-center center-text" style={{ padding: '48px 24px' }}>
            <div 
              style={{ 
                width: 56, 
                height: 56, 
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
              <MessageSquare size={26} />
            </div>
            <h2 className="rm-title" style={{ fontSize: 18, marginBottom: 6 }}>{t('noChatsTitle')}</h2>
            <p className="small muted" style={{ marginBottom: 20, maxWidth: 360, lineHeight: 1.6 }}>
              {t('noChatsDesc')}
            </p>
            <Link href="/match" className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
              <Compass size={15} /> {t('newMatchBtn')}
            </Link>
          </div>
        ) : (
          <div className="flex col g8">
            {filteredConversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/chat/${conv.id}`}
                className="card card-interactive flex items-center justify-between"
                style={{ 
                  padding: '14px 18px', 
                  borderRadius: 12,
                  background: conv.isLocked ? 'rgba(244, 63, 94, 0.06)' : 'var(--raised-lacquer)',
                  border: conv.isLocked ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--gold-hairline)'
                }}
              >
                <div className="flex items-center g14 grow" style={{ overflow: 'hidden' }}>
                  {/* Avatar with Status Ring */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      className="avatar"
                      style={{
                        width: 44,
                        height: 44,
                        fontSize: 16,
                      }}
                    >
                      {conv.avatarUrl ? (
                        <img src={conv.avatarUrl} alt="Avatar" />
                      ) : (
                        conv.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        background: conv.isLocked ? '#f43f5e' : 'var(--emerald-patina)', 
                        border: '2px solid var(--lacquer-black)' 
                      }} 
                    />
                  </div>

                  {/* Text Details */}
                  <div className="grow" style={{ overflow: 'hidden' }}>
                    <div className="flex items-center g8" style={{ marginBottom: 4 }}>
                      <span className="semi champagne" style={{ fontSize: 15 }}>{conv.name}</span>
                      <span className="badge badge-gold tiny" style={{ fontSize: 10, padding: '1px 6px' }}>
                        {conv.compatibility}% MATCH
                      </span>
                      {conv.isLocked && (
                        <span className="badge tiny" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: 9 }}>
                          🔒 AI Lock
                        </span>
                      )}
                    </div>
                    <div 
                      className="small" 
                      style={{ 
                        color: conv.isLocked ? '#fb7185' : 'var(--text-muted)', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}
                    >
                      {conv.isLocked ? t('aiReviewingMsg') : (conv.lastMessage || t('noMessagesYet'))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center g8" style={{ flexShrink: 0, marginLeft: 12 }}>
                  <span className="tiny faint rm-num">{conv.lastTime}</span>
                  <ChevronRight size={15} style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
