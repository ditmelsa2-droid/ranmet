'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Globe2, Users, MessageSquare, Volume2, Plus, 
  Search, Sparkles, Flame, Shield, ArrowRight, Radio
} from 'lucide-react'
import AppShell from '../components/AppShell'

const INITIAL_ROOMS = [
  {
    id: 'minecraft-builders',
    name: 'Thế Giới Minecraft & Builders ⛏️',
    desc: 'Cộng đồng chia sẻ công trình, server multiplayer và mẹo sinh tồn backrooms.',
    category: 'Gaming',
    members: 148,
    isVoice: true,
    tags: ['Minecraft', 'Survival', 'Redstone'],
    host: 'Kaito_Gamer',
    color: '#10b981'
  },
  {
    id: 'anime-lounge',
    name: 'Góc Wibu & Anime Mùa Mới ✨',
    desc: 'Thảo luận các bộ Anime hot, cosplay, manga và art phong cách Cyber.',
    category: 'Anime',
    members: 112,
    isVoice: false,
    tags: ['Anime', 'Manga', 'Cosplay'],
    host: 'VyVy_Anime',
    color: '#ec4899'
  },
  {
    id: 'dev-ai-hub',
    name: 'Dev & AI Creators Space 💻',
    desc: 'Nơi quy tụ các lập trình viên Next.js, Supabase, Python AI và Indie Hackers.',
    category: 'Công nghệ',
    members: 185,
    isVoice: true,
    tags: ['Next.js', 'AI', 'Fullstack'],
    host: 'LinhChi_Dev',
    color: '#06b6d4'
  },
  {
    id: 'chill-lofi-room',
    name: 'Tâm Sự Đêm Khuya & Lofi Beats ☕',
    desc: 'Phòng nghe nhạc chill, trò chuyện tâm sự nhẹ nhàng sau những giờ làm việc mệt mỏi.',
    category: 'Âm nhạc',
    members: 240,
    isVoice: true,
    tags: ['Lofi', 'Chill', 'TamSu'],
    host: 'MinhQuan',
    color: '#a855f7'
  },
  {
    id: 'travel-food',
    name: 'Hội Mê Du Lịch & Ẩm Thực 🍜',
    desc: 'Chia sẻ các địa điểm check-in, quán cafe đẹp và review đồ ăn ngon toàn quốc.',
    category: 'Đời sống',
    members: 76,
    isVoice: false,
    tags: ['Foodie', 'Travel', 'Cafe'],
    host: 'HaMy',
    color: '#f59e0b'
  }
]

const CATEGORIES = ['Tất cả', 'Gaming', 'Anime', 'Công nghệ', 'Âm nhạc', 'Đời sống']

export default function RanWorldPage() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [selectedCat, setSelectedCat] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [newRoomCategory, setNewRoomCategory] = useState('Gaming')
  const [newRoomIsVoice, setNewRoomIsVoice] = useState(true)

  const filteredRooms = rooms.filter((r) => {
    const matchCat = selectedCat === 'Tất cả' || r.category === selectedCat
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  function handleCreateRoom(e) {
    e.preventDefault()
    if (!newRoomName.trim()) return

    const newRoom = {
      id: 'room-' + Date.now(),
      name: newRoomName.trim(),
      desc: newRoomDesc.trim() || 'Phòng thảo luận cộng đồng RanWorld.',
      category: newRoomCategory,
      members: 1,
      isVoice: newRoomIsVoice,
      tags: [newRoomCategory, 'Mới tạo'],
      host: 'Bạn',
      color: '#ec4899'
    }

    setRooms([newRoom, ...rooms])
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
          <div className="flex justify-between items-start">
            <div>
              <div className="badge badge-glow" style={{ marginBottom: 10 }}>
                <Globe2 size={12} /> RANWORLD ECOSYSTEM
              </div>
              <h1 className="rm-title" style={{ fontSize: 26, marginBottom: 8, color: '#fff' }}>
                Thế Giới Cộng Đồng Trực Tuyến 🌐
              </h1>
              <p className="small" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 620, lineHeight: 1.45 }}>
                Tham gia các không gian thảo luận theo chủ đề yêu thích, trò chuyện bằng âm thanh (Voice Lounge) hoặc văn bản với hàng ngàn thành viên có cùng đam mê.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 20px', fontSize: 14 }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Tạo phòng mới
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
                placeholder="🔍 Tìm kiếm phòng cộng đồng, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex g8" style={{ flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCat === cat ? 'selected' : ''}`}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={() => setSelectedCat(cat)}
                >
                  {cat}
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
                      color: room.color,
                      border: `1px solid ${room.color}40`
                    }}
                  >
                    {room.category}
                  </span>

                  <div className="flex items-center g8">
                    {room.isVoice && (
                      <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                        <Radio size={10} /> Voice Live
                      </span>
                    )}
                    <span className="tiny faint flex items-center g4">
                      <Users size={12} /> {room.members}
                    </span>
                  </div>
                </div>

                {/* Room Title & Description */}
                <h3 className="semi" style={{ fontSize: 18, marginBottom: 8, color: '#fff' }}>
                  {room.name}
                </h3>
                <p className="small muted" style={{ marginBottom: 16, lineHeight: 1.45 }}>
                  {room.desc}
                </p>

                {/* Tags */}
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {room.tags.map((t) => (
                    <span 
                      key={t} 
                      className="tiny" 
                      style={{ 
                        padding: '3px 8px', 
                        borderRadius: 6, 
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-faint)' 
                      }}
                    >
                      #{t}
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
                <span className="tiny faint">Host: <b style={{ color: '#fff' }}>{room.host}</b></span>
                <span className="tiny bold flex items-center g4" style={{ color: '#ec4899' }}>
                  Tham gia phòng <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="card center-text" style={{ padding: 40 }}>
            <Globe2 size={40} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
            <h3 className="semi">Không tìm thấy phòng phù hợp</h3>
            <p className="small muted">Hãy thử từ khóa khác hoặc tự tạo một thế giới mới của riêng bạn!</p>
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
              <h2 className="rm-title" style={{ fontSize: 20 }}>Tạo Phòng RanWorld Mới</h2>
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
                <label className="field-label">Tên phòng / Thế giới</label>
                <input 
                  className="input" 
                  placeholder="Ví dụ: Hội Lập Trình Game Unity & C#"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Mô tả ngắn</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder="Giới thiệu về mục đích và quy tắc của phòng..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Chủ đề</label>
                <select 
                  className="input"
                  value={newRoomCategory}
                  onChange={(e) => setNewRoomCategory(e.target.value)}
                >
                  {CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                    <option key={c} value={c} style={{ background: '#161320', color: '#fff' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between" style={{ padding: '10px 0' }}>
                <span className="small semi">Bật kênh Voice Audio Live</span>
                <input 
                  type="checkbox" 
                  checked={newRoomIsVoice} 
                  onChange={(e) => setNewRoomIsVoice(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#ec4899' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Sparkles size={16} /> Khởi tạo phòng ngay
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
