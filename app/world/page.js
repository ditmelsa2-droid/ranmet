'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Globe2, Users, Volume2, Plus, 
  Search, Sparkles, Radio, ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/LanguageContext'
import AppShell from '../components/AppShell'

const DEFAULT_ROOMS_LIST = [
  {
    id: 'minecraft-builders',
    name: 'Thế Giới Minecraft & Builders ⛏️',
    description: 'Cộng đồng chia sẻ công trình, server multiplayer và mẹo sinh tồn backrooms.',
    category: 'Gaming',
    members: 148,
    is_voice: true,
    tags: ['Minecraft', 'Survival', 'Redstone'],
    host_name: 'Kaito_Gamer',
    color: 'var(--emerald-patina)'
  },
  {
    id: 'anime-lounge',
    name: 'Góc Wibu & Anime Mùa Mới ✨',
    description: 'Thảo luận các bộ Anime hot, cosplay, manga và art phong cách Cyber.',
    category: 'Anime',
    members: 112,
    is_voice: false,
    tags: ['Anime', 'Manga', 'Cosplay'],
    host_name: 'VyVy_Anime',
    color: 'var(--kinpaku-gold)'
  },
  {
    id: 'dev-ai-hub',
    name: 'Dev & AI Creators Space 💻',
    description: 'Nơi quy tụ các lập trình viên Next.js, Supabase, Python AI và Indie Hackers.',
    category: 'Tech',
    members: 185,
    is_voice: true,
    tags: ['Next.js', 'AI', 'Fullstack'],
    host_name: 'LinhChi_Dev',
    color: 'var(--verdigris-patina)'
  },
  {
    id: 'chill-lofi-room',
    name: 'Tâm Sự Đêm Khuya & Lofi Beats ☕',
    description: 'Phòng nghe nhạc chill, trò chuyện tâm sự nhẹ nhàng sau những giờ làm việc mệt mỏi.',
    category: 'Music',
    members: 240,
    is_voice: true,
    tags: ['Lofi', 'Chill', 'TamSu'],
    host_name: 'MinhQuan',
    color: 'var(--kinpaku-gold)'
  },
  {
    id: 'travel-food',
    name: 'Hội Mê Du Lịch & Ẩm Thực 🍜',
    description: 'Chia sẻ các địa điểm check-in, quán cafe đẹp và review đồ ăn ngon toàn quốc.',
    category: 'Lifestyle',
    members: 76,
    is_voice: false,
    tags: ['Foodie', 'Travel', 'Cafe'],
    host_name: 'HaMy',
    color: 'var(--emerald-patina)'
  }
]

export default function RanWorldPage() {
  const { t } = useLanguage()
  const [supabase] = useState(() => createClient())
  const [rooms, setRooms] = useState(DEFAULT_ROOMS_LIST)
  const [selectedCatKey, setSelectedCatKey] = useState('catAll')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [newRoomCategory, setNewRoomCategory] = useState('Gaming')
  const [newRoomIsVoice, setNewRoomIsVoice] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('Bạn')

  const CATEGORY_ITEMS = [
    { key: 'catAll', label: t('catAll'), filterVal: 'All' },
    { key: 'catGaming', label: t('catGaming'), filterVal: 'Gaming' },
    { key: 'catAnime', label: t('catAnime'), filterVal: 'Anime' },
    { key: 'catTech', label: t('catTech'), filterVal: 'Tech' },
    { key: 'catMusic', label: t('catMusic'), filterVal: 'Music' },
    { key: 'catLife', label: t('catLife'), filterVal: 'Lifestyle' },
  ]

  useEffect(() => {
    async function loadRooms() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        if (profile?.display_name) setCurrentUserName(profile.display_name)
      }

      const { data: dbRooms } = await supabase.from('world_rooms').select('*').order('created_at', { ascending: false })
      if (dbRooms && dbRooms.length > 0) {
        setRooms(dbRooms)
      }
    }

    loadRooms()

    const channel = supabase
      .channel('world-rooms-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'world_rooms' }, () => {
        loadRooms()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const selectedCategoryObj = CATEGORY_ITEMS.find((c) => c.key === selectedCatKey) || CATEGORY_ITEMS[0]

  const filteredRooms = rooms.filter((r) => {
    const matchCat = selectedCategoryObj.filterVal === 'All' || 
      (r.category || '').toLowerCase() === selectedCategoryObj.filterVal.toLowerCase() ||
      (selectedCategoryObj.key === 'catTech' && (r.category === 'Công nghệ' || r.category === 'Tech')) ||
      (selectedCategoryObj.key === 'catMusic' && (r.category === 'Âm nhạc' || r.category === 'Music')) ||
      (selectedCategoryObj.key === 'catLife' && (r.category === 'Đời sống' || r.category === 'Lifestyle'))

    const nameStr = (r.name || '').toLowerCase()
    const descStr = (r.description || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return matchCat && (nameStr.includes(query) || descStr.includes(query))
  })

  async function handleCreateRoom(e) {
    e.preventDefault()
    if (!newRoomName.trim()) return

    const roomId = 'room-' + Date.now()
    const newRoom = {
      id: roomId,
      name: newRoomName.trim(),
      description: newRoomDesc.trim() || 'Phòng thảo luận cộng đồng RanWorld.',
      category: newRoomCategory,
      creator_id: currentUserId,
      host_name: currentUserName,
      is_voice: newRoomIsVoice,
      tags: [newRoomCategory, 'Live'],
      color: 'var(--kinpaku-gold)'
    }

    const { error } = await supabase.from('world_rooms').insert(newRoom)
    if (!error) {
      setRooms([newRoom, ...rooms])
    } else {
      console.error('Error creating room:', error)
      setRooms([newRoom, ...rooms])
    }

    setShowCreateModal(false)
    setNewRoomName('')
    setNewRoomDesc('')
  }

  return (
    <AppShell>
      <div className="flex col g20">
        {/* Top Header Banner */}
        <div 
          className="card" 
          style={{ 
            padding: '24px 24px',
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--gold-hairline-strong)'
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div className="tiny faint flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                <Globe2 size={13} style={{ color: 'var(--verdigris-patina)' }} /> SPATIAL AUDIO & LIVE STAGES
              </div>
              <h1 className="rm-title" style={{ fontSize: 24, marginBottom: 6 }}>
                {t('worldTitle')}
              </h1>
              <p className="small muted" style={{ maxWidth: 620, lineHeight: 1.5 }}>
                {t('worldDesc')}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '9px 18px', fontSize: 13, borderRadius: 8 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={15} /> {t('createRoomBtn')}
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex col g12">
          <div className="flex g10 items-center" style={{ flexWrap: 'wrap' }}>
            <div className="grow" style={{ minWidth: 240 }}>
              <input
                className="input"
                style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--lacquer-deep)' }}
                placeholder={`🔍 ${t('searchRoomsPlaceholder')}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex g6" style={{ flexWrap: 'wrap' }}>
              {CATEGORY_ITEMS.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`chip ${selectedCatKey === cat.key ? 'selected' : ''}`}
                  style={{ padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setSelectedCatKey(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="desktop-grid-3">
          {filteredRooms.map((room) => (
            <Link key={room.id} href={`/world/${room.id}`} className="card card-interactive flex col justify-between" style={{ padding: 18, textDecoration: 'none' }}>
              <div>
                {/* Room Header */}
                <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
                  <span 
                    className="badge tiny" 
                    style={{ 
                      background: 'rgba(245, 192, 66, 0.1)',
                      color: 'var(--kinpaku-gold)',
                      border: '1px solid var(--gold-hairline)'
                    }}
                  >
                    {room.category}
                  </span>

                  <div className="flex items-center g6">
                    {room.is_voice && (
                      <span className="badge badge-success tiny" style={{ fontSize: 9.5, padding: '2px 6px' }}>
                        <Radio size={9} /> Voice Live
                      </span>
                    )}
                    <span className="tiny faint flex items-center g4 rm-num">
                      <Users size={11} /> {room.members || 1}
                    </span>
                  </div>
                </div>

                {/* Room Title & Description */}
                <h3 className="semi champagne" style={{ fontSize: 16, marginBottom: 6 }}>
                  {room.name}
                </h3>
                <p className="small muted" style={{ marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {room.description}
                </p>

                {/* Tags */}
                <div className="flex" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                  {(room.tags || []).map((tagItem) => (
                    <span 
                      key={tagItem} 
                      className="tiny" 
                      style={{ 
                        padding: '2px 6px', 
                        borderRadius: 4, 
                        background: 'var(--lacquer-deep)',
                        color: 'var(--text-faint)',
                        border: '1px solid var(--gold-hairline)'
                      }}
                    >
                      #{tagItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Footer & Join Button */}
              <div 
                className="flex justify-between items-center" 
                style={{ 
                  paddingTop: 10, 
                  borderTop: '1px solid var(--gold-hairline)',
                  marginTop: 6
                }}
              >
                <span className="tiny faint">Host: <b className="champagne">{room.host_name || 'RanMet'}</b></span>
                <span className="tiny bold gold flex items-center g4">
                  {t('joinRoom')} <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="card center-text" style={{ padding: 40 }}>
            <Globe2 size={36} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <h3 className="semi champagne">{t('noMatchTitle')}</h3>
            <p className="small muted">{t('noMatchDesc')}</p>
          </div>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 440, padding: 24, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <h2 className="rm-title" style={{ fontSize: 17 }}>{t('createRoomBtn')}</h2>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="btn-icon" 
                style={{ width: 28, height: 28 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="flex col g14">
              <div className="field-group">
                <label className="field-label">{t('displayNameLabel')}</label>
                <input 
                  className="input" 
                  placeholder="Ví dụ: Dev AI Hub & Next.js"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">{t('captionLabel')}</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder={t('captionPlaceholder')}
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
                <Sparkles size={15} /> {t('createRoomBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
