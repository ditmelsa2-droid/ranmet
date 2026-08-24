'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MessageCircle, Sparkles, ShieldCheck, ArrowRight, 
  Compass, Clock, Search, UserCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../components/AppShell'

export default function ChatsInboxPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadChats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // Fetch all chats where user is participant
      const { data: rawChats, error } = await supabase
        .from('chats')
        .select(`
          id,
          user_a,
          user_b,
          compatibility,
          created_at,
          ended_at,
          messages (
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching chats:', error)
        setLoading(false)
        return
      }

      // Fetch profiles for the partners
      const partnerIds = (rawChats || []).map((c) => (c.user_a === user.id ? c.user_b : c.user_a))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, country, avatar_seed')
        .in('id', partnerIds)

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

      const formatted = (rawChats || []).map((c) => {
        const partnerId = c.user_a === user.id ? c.user_b : c.user_a
        const partner = profileMap.get(partnerId) || { display_name: 'Người dùng', country: 'Toàn cầu' }
        const msgs = c.messages || []
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null

        return {
          id: c.id,
          partnerId,
          partnerName: partner.display_name,
          partnerCountry: partner.country,
          compatibility: c.compatibility || 85,
          lastMessage: lastMsg?.content || 'Chưa có tin nhắn nào',
          lastTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      })

      setChats(formatted)
      setLoading(false)
    }

    loadChats()

    // Realtime subscription for incoming new chats
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        loadChats()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadChats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  const filtered = chats.filter((c) =>
    c.partnerName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="flex col g24" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="tiny faint flex items-center g6" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} /> Realtime Messenger
            </div>
            <h1 className="rm-title" style={{ fontSize: 26, color: '#fff' }}>
              Hộp Thư & Cuộc Trò Chuyện 💬
            </h1>
          </div>

          <Link href="/match" className="btn btn-primary" style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}>
            <Compass size={16} /> Ghép bạn mới
          </Link>
        </div>

        {/* Search bar */}
        <div>
          <input
            className="input"
            style={{ padding: '12px 18px', borderRadius: 999 }}
            placeholder="🔍 Tìm kiếm người trò chuyện hoặc tin nhắn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Chats List */}
        {loading ? (
          <div className="card center-text" style={{ padding: 40 }}>
            <div className="tiny bold muted">Đang tải lịch sử hội thoại...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex col items-center center-text" style={{ padding: 48 }}>
            <div 
              style={{ 
                width: 60, 
                height: 60, 
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
            <h2 className="rm-title" style={{ fontSize: 20, marginBottom: 6 }}>Chưa có cuộc trò chuyện nào</h2>
            <p className="small muted" style={{ marginBottom: 20, maxWidth: 400 }}>
              Hãy sử dụng tính năng Ghép đôi AI để tìm bạn mới và bắt đầu trò chuyện ngay lập tức!
            </p>
            <Link href="/match" className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
              <Compass size={16} /> Bắt đầu ghép đôi AI
            </Link>
          </div>
        ) : (
          <div className="flex col g12">
            {filtered.map((c) => (
              <Link 
                key={c.id} 
                href={`/chat/${c.id}`}
                className="card card-interactive flex items-center justify-between"
                style={{ padding: '18px 20px' }}
              >
                <div className="flex items-center g14">
                  <div style={{ position: 'relative' }}>
                    <div 
                      className="avatar" 
                      style={{ 
                        width: 48, 
                        height: 48, 
                        fontSize: 18, 
                        background: 'var(--brand-gradient)' 
                      }}
                    >
                      {c.partnerName.charAt(0).toUpperCase()}
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
                    <div className="flex items-center g8">
                      <span className="semi" style={{ fontSize: 16, color: '#fff' }}>
                        {c.partnerName}
                      </span>
                      <span className="badge badge-glow tiny" style={{ fontSize: 10, padding: '2px 6px' }}>
                        {c.compatibility}% Tương thích
                      </span>
                    </div>
                    <div className="small muted" style={{ marginTop: 4, maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessage}
                    </div>
                  </div>
                </div>

                <div className="flex col items-end g6">
                  <span className="tiny faint rm-num">{c.lastTime}</span>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
