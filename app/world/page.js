'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Globe2, Users, MessageSquare, Volume2, Plus, 
  Search, Sparkles, Flame, Shield, ArrowRight, Radio
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
    color: '#10b981'
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
    color: '#ec4899'
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
    color: '#06b6d4'
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
    color: '#a855f7'
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
    color: '#f59e0b'
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
      color: '#ec4899'
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
      <div className="flex col g24">
        {/* Top Header Banner */}
        <div 
          className="card" 
          style={{ 
            padding: '26px 24px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            boxShadow: '0 16px 40px -10px rgba(168, 85, 247, 0.3)'
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="badge badge-glow" style={{ marginBottom: 10 }}>
                <Globe2 size={12} /> RANWORLD ECOSYSTEM
              </div>
              <h1 className="rm-title" style={{ fontSize: 26, marginBottom: 8, color: '#fff' }}>
                {t('worldTitle')}
              </h1>
              <p className="small" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 620, lineHeight: 1.45 }}>
                {t('worldDesc')}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 20px', fontSize: 14 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> {t('createRoomBtn')}
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex col g16">
          <div className="flex g12 items-center" style={{ flexWrap: 'wrap' }}>
            <div className="grow" style={{ minWidth: 260 }}>
              <input
                className="input"
                style={{ padding: '12px 18px', borderRadius: 999 }}
                placeholder={`🔍 ${t('searchRoomsPlaceholder')}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex g8" style={{ flexWrap: 'wrap' }}>
              {CATEGORY_ITEMS.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`chip ${selectedCatKey === cat.key ? 'selected' : ''}`}
                  style={{ padding: '8px 16px', fontSize: 13 }}
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
            <Link key={room.id} href={`/world/${room.id}`} className="world-room-card">
              <div>
                {/* Room Header */}
                <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                  <span 
                    className="badge tiny" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: room.color || '#ec4899',
                      border: `1px solid ${room.color || '#ec4899'}40`
                    }}
                  >
                    {room.category}
                  </span>

                  <div className="flex items-center g8">
                    {room.is_voice && (
                      <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                        <Radio size={10} /> Voice Live
                      </span>
                    )}
                    <span className="tiny faint flex items-center g4">
                      <Users size={12} /> {room.members || 1}
                    </span>
                  </div>
                </div>

                {/* Room Title & Description */}
                <h3 className="semi" style={{ fontSize: 18, marginBottom: 8, color: '#fff' }}>
                  {room.name}
                </h3>
                <p className="small muted" style={{ marginBottom: 16, lineHeight: 1.45 }}>
                  {room.description}
                </p>

                {/* Tags */}
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {(room.tags || []).map((tagItem) => (
                    <span 
                      key={tagItem} 
                      className="tiny" 
                      style={{ 
                        padding: '3px 8px', 
                        borderRadius: 6, 
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-faint)' 
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
                  paddingTop: 14, 
                  borderTop: '1px solid var(--border)',
                  marginTop: 6
                }}
              >
                <span className="tiny faint">Host: <b style={{ color: '#fff' }}>{room.host_name || 'RanMet'}</b></span>
                <span className="tiny bold flex items-center g4" style={{ color: '#ec4899' }}>
                  {t('joinRoom')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="card center-text" style={{ padding: 40 }}>
            <Globe2 size={40} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <h3 className="semi">{t('noMatchTitle')}</h3>
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
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
            style={{ width: '100%', maxWidth: 480, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
              <h2 className="rm-title" style={{ fontSize: 20 }}>{t('createRoomBtn')}</h2>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="btn-icon" 
                style={{ width: 32, height: 32 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="flex col g16">
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

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Sparkles size={16} /> {t('createRoomBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
