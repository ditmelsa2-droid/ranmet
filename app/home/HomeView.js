'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, ArrowUpRight, Zap, Award, ArrowRight, Radio, Newspaper, Gift, Flame,
  Users, Activity, Trophy, Play, CheckCircle2, TrendingUp, MessageSquare, Sliders, Volume2
} from 'lucide-react'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { useLanguage } from '@/lib/LanguageContext'
import { logoutAction } from './actions'
import AppShell from '../components/AppShell'

export default function HomeView({ profile, trust, refCount }) {
  const { t } = useLanguage()
  const [activeSubTab, setActiveSubTab] = useState('overview')

  const score = trust?.score ?? 100
  const tier = trustTier(score)
  const next = nextTierInfo(score)
  const name = profile?.display_name || 'Creator'
  const referrals = refCount || 0

  return (
    <AppShell userProfile={profile} trustScore={score}>
      
      {/* 1. FULL-BLEED EDGE-TO-EDGE INFINITE MARQUEE TICKER */}
      <div className="marquee-container" style={{ margin: 0, width: '100%' }}>
        <div className="marquee-track">
          <span className="flex items-center g8">
            <span className="telemetry-dot" />
            <b className="lime">RANMET // 2026</b> LIVE USERS: 1,840 ONLINE
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Activity size={14} style={{ color: 'var(--ln-cyan)' }} />
            AI RADAR ACCURACY: <b className="champagne">98.6%</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Flame size={14} style={{ color: 'var(--ln-magenta)' }} />
            TRENDING: <b className="champagne">#SpatialVoice · #RanVideoCinema · #AnimeLoFi</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <ShieldCheck size={14} style={{ color: 'var(--ln-lime)' }} />
            AI CONTENT SHIELD: <b className="lime">ACTIVE 24/7</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Trophy size={14} style={{ color: 'var(--kinpaku-gold)' }} />
            TRUST POOL: <b className="gold">52,400 PTS</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <span className="telemetry-dot" />
            <b className="lime">RANMET // 2026</b> LIVE USERS: 1,840 ONLINE
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Activity size={14} style={{ color: 'var(--ln-cyan)' }} />
            AI RADAR ACCURACY: <b className="champagne">98.6%</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Flame size={14} style={{ color: 'var(--ln-magenta)' }} />
            TRENDING: <b className="champagne">#SpatialVoice · #RanVideoCinema · #AnimeLoFi</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <ShieldCheck size={14} style={{ color: 'var(--ln-lime)' }} />
            AI CONTENT SHIELD: <b className="lime">ACTIVE 24/7</b>
          </span>
          <span>•</span>
          <span className="flex items-center g8">
            <Trophy size={14} style={{ color: 'var(--kinpaku-gold)' }} />
            TRUST POOL: <b className="gold">52,400 PTS</b>
          </span>
        </div>
      </div>

      {/* 2. MAIN VIEW CONTAINER (Max-width 1440px) */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '36px 28px 80px', display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* HERO SECTION: IMMERSIVE EDITORIAL LAYOUT (No Nested Box-in-a-Box) */}
        <section 
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: 48,
            alignItems: 'center',
            paddingBottom: 24,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Left Column: Bold Typography & CTAs */}
          <div>
            <div className="flex items-center g8" style={{ marginBottom: 16 }}>
              <span className="badge badge-lime">
                AI SOCIAL // SPEED OF CONNECTION
              </span>
              <span className="badge badge-gold">
                {tier.name} TIER
              </span>
            </div>

            <h1 className="ln-impact-title" style={{ fontSize: 'clamp(38px, 5.2vw, 68px)', lineHeight: 1.02, marginBottom: 20 }}>
              TỐC ĐỘ KẾT NỐI <br />
              <span style={{ color: 'var(--ln-lime)' }}>KHÔNG GIỚI HẠN</span>
            </h1>

            <p className="ln-sub-hero" style={{ fontSize: 16, marginBottom: 32, maxWidth: 580 }}>
              Xin chào <b className="champagne">{name}</b>. Khám phá vũ trụ mạng xã hội AI thế hệ mới với radar quét ngữ nghĩa, rạp phim ngắn 60FPS RanVideo Cinema và sân khấu âm thanh đa chiều Spatial Voice.
            </p>

            <div className="flex items-center g16" style={{ flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/match" className="btn btn-lime" style={{ padding: '13px 28px', fontSize: 14 }}>
                <Zap size={16} /> Bắt Đầu AI Radar Scan <ArrowRight size={16} />
              </Link>
              <Link href="/videos" className="btn btn-secondary" style={{ padding: '13px 24px', fontSize: 14 }}>
                <Play size={15} style={{ color: 'var(--ln-lime)' }} /> Khám Phá RanVideo
              </Link>
            </div>

            {/* Quick Live Indicators */}
            <div className="flex items-center g20 tiny faint rm-num" style={{ flexWrap: 'wrap' }}>
              <div>ĐỘ TRỄ: <b className="lime">12ms</b></div>
              <div>MÃ HÓA: <b className="champagne">E2EE ACTIVE</b></div>
              <div>KIỂM DUYỆT: <b className="gold">18+ AI SHIELD</b></div>
            </div>
          </div>

          {/* Right Column: Live Interactive Cockpit Stage */}
          <div 
            style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 16, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: 28,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)'
            }}
          >
            {/* Header of Cockpit */}
            <div className="flex justify-between items-center" style={{ marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 14 }}>
              <div className="flex items-center g8">
                <span className="telemetry-dot" />
                <span className="rm-num bold champagne" style={{ fontSize: 13, letterSpacing: '0.06em' }}>
                  TELEMETRY COCKPIT // SYS.01
                </span>
              </div>
              <div className="equalizer-wave">
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
                <span className="equalizer-bar" />
              </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div style={{ background: 'var(--ln-dark-2)', padding: 16, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="tiny faint rm-num">AI RADAR MATCH RATE</div>
                <div className="rm-num bold lime" style={{ fontSize: 28, marginTop: 4 }}>98.6%</div>
              </div>
              <div style={{ background: 'var(--ln-dark-2)', padding: 16, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="tiny faint rm-num">ĐIỂM TRUST POOL</div>
                <div className="rm-num bold gold" style={{ fontSize: 28, marginTop: 4 }}>{score} PTS</div>
              </div>
            </div>

            {/* Active Voice Stage Pill */}
            <Link 
              href="/world" 
              className="flex justify-between items-center" 
              style={{ 
                background: 'rgba(210, 255, 0, 0.06)', 
                border: '1px solid rgba(210, 255, 0, 0.25)', 
                padding: '12px 18px', 
                borderRadius: 14,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div className="flex items-center g10">
                <Radio size={18} style={{ color: 'var(--ln-lime)' }} />
                <div className="flex col">
                  <span className="tiny bold champagne">SÂN KHẤU VOICE ĐANG PHÁT</span>
                  <span className="tiny faint">148 thành viên đang lắng nghe</span>
                </div>
              </div>
              <span className="tiny bold lime flex items-center g4">
                Vào nghe <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        </section>

        {/* 3. DEDICATED SUB-TAB NAVIGATION BAR */}
        <div className="subtab-bar" style={{ padding: '6px 8px' }}>
          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'overview' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('overview')}
            style={{ fontSize: 13, padding: '10px 22px' }}
          >
            <Flame size={15} /> 01 // BENTO SPOTLIGHT
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'radar' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('radar')}
            style={{ fontSize: 13, padding: '10px 22px' }}
          >
            <Zap size={15} /> 02 // AI RADAR SCAN HUD
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'stages' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('stages')}
            style={{ fontSize: 13, padding: '10px 22px' }}
          >
            <Radio size={15} /> 03 // LIVE VOICE STAGES (3)
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'trust' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('trust')}
            style={{ fontSize: 13, padding: '10px 22px' }}
          >
            <Trophy size={15} /> 04 // BẢNG VÀNG TRUST ({score} PTS)
          </button>
        </div>

        {/* 4. SUB-TAB VIEW CONTENT */}

        {/* ================================================================= */}
        {/* VIEW 1: ASYMMETRIC BENTO SPOTLIGHT */}
        {/* ================================================================= */}
        {activeSubTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            
            {/* Tile 1: RanVideo Cinema */}
            <Link href="/videos" style={{ textDecoration: 'none' }}>
              <div 
                className="card card-interactive" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  height: 340, 
                  position: 'relative',
                  borderRadius: 22
                }}
              >
                <img 
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JldmhzYWRlZHRrOXB1czVlbm1xcmR2eHBoNTNyMGx1c2o3eW1xZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kigKjAJryWTZK/giphy.gif" 
                  alt="RanVideo Cinema" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                />
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    padding: 28, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="badge badge-gold"><Flame size={12} /> 01 // CINEMA THEATER</span>
                    <Video size={22} style={{ color: 'var(--kinpaku-gold)' }} />
                  </div>
                  <div>
                    <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 6 }}>RanVideo Cinema</div>
                    <div className="tiny muted" style={{ lineHeight: 1.5 }}>Rạp chiếu video dọc 60FPS chuẩn điện ảnh, bình luận thời gian thực và bộ lọc kiểm duyệt 18+ tự động.</div>
                    <div className="tiny bold lime flex items-center g6" style={{ marginTop: 14 }}>
                      Khám phá rạp phim ngay <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tile 2: RanNews Pulse */}
            <Link href="/news" style={{ textDecoration: 'none' }}>
              <div 
                className="card card-interactive" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  height: 340, 
                  position: 'relative',
                  borderRadius: 22
                }}
              >
                <img 
                  src="https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" 
                  alt="RanNews Pulse" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                />
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    padding: 28, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="badge badge-lime"><Newspaper size={12} /> 02 // CHRONICLES</span>
                    <Sparkles size={22} style={{ color: 'var(--ln-lime)' }} />
                  </div>
                  <div>
                    <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 6 }}>RanNews & AI Dịch</div>
                    <div className="tiny muted" style={{ lineHeight: 1.5 }}>Dòng thời gian tương tác đa phương tiện, kho sticker GIF phong phú và dịch thuật tự động hơn 50 ngôn ngữ.</div>
                    <div className="tiny bold lime flex items-center g6" style={{ marginTop: 14 }}>
                      Đọc bảng tin cộng đồng <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tile 3: RanWorld Spatial Lounges */}
            <Link href="/world" style={{ textDecoration: 'none' }}>
              <div 
                className="card card-interactive" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  height: 340, 
                  position: 'relative',
                  borderRadius: 22
                }}
              >
                <img 
                  src="https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" 
                  alt="RanWorld Lounges" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                />
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    padding: 28, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="badge badge-success"><Radio size={12} /> 03 // SPATIAL STAGES</span>
                    <Globe2 size={22} style={{ color: '#2dd4bf' }} />
                  </div>
                  <div>
                    <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 6 }}>RanWorld Spatial Audio</div>
                    <div className="tiny muted" style={{ lineHeight: 1.5 }}>Phòng voice không gian đa chiều theo chủ đề Gaming, Anime Lo-Fi và không gian sáng tạo Dev AI.</div>
                    <div className="tiny bold lime flex items-center g6" style={{ marginTop: 14 }}>
                      Vào sân khấu voice <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: RADAR SCAN HUD */}
        {/* ================================================================= */}
        {activeSubTab === 'radar' && (
          <div className="card" style={{ padding: 40, borderRadius: 24 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="badge badge-lime" style={{ marginBottom: 8 }}>
                  <Zap size={12} /> HOLOGRAPHIC RADAR SCANNER
                </span>
                <h3 className="rm-title" style={{ fontSize: 28 }}>AI Match Engine HUD</h3>
                <p className="small muted">Quét tín hiệu thời gian thực để tìm kiếm bạn bè có độ tương đồng 90%+.</p>
              </div>
              <Link href="/match" className="btn btn-lime">
                Khởi động Radar Toàn Màn Hình <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 36, alignItems: 'center' }}>
              <div className="radar-hud">
                <div className="radar-ring radar-ring-1" />
                <div className="radar-ring radar-ring-2" />
                <div className="radar-ring radar-ring-3" />
                <div className="radar-sweep-beam" />
                <div className="center-text flex col items-center">
                  <div className="rm-num bold lime" style={{ fontSize: 26 }}>98.6%</div>
                  <div className="tiny faint">MATCH RATE</div>
                </div>
              </div>

              <div className="flex col g14">
                <div className="card" style={{ padding: 20, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>🎯 Tương Đồng Sở Thích Cao Nhất</div>
                  <div className="tiny muted" style={{ marginTop: 6 }}>
                    {profile?.interests?.length > 0 ? profile.interests.join(' · ') : 'Gaming · Anime · Lập trình · Âm nhạc'}
                  </div>
                </div>
                <div className="card" style={{ padding: 20, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>💬 Phong Cách Đối Thoại Tối Ưu</div>
                  <div className="tiny muted" style={{ marginTop: 6 }}>
                    {profile?.conversation_style || 'Thoải mái, vui vẻ và tự do'}
                  </div>
                </div>
                <div className="card" style={{ padding: 20, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>🛡️ Bộ Lọc Xác Thực Độ Tuổi 18+</div>
                  <div className="tiny muted" style={{ marginTop: 6 }}>
                    Trạng thái: <b className="lime">{profile?.age_verified ? 'Đã mở khóa toàn bộ' : 'Chế độ bảo vệ AI'}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: LIVE VOICE STAGES */}
        {/* ================================================================= */}
        {activeSubTab === 'stages' && (
          <div className="flex col g20">
            <div className="flex justify-between items-center">
              <h3 className="rm-title" style={{ fontSize: 24 }}>Sân Khấu Âm Thanh Voice Đang Phát Trực Tiếp</h3>
              <Link href="/world" className="tiny bold gold">Xem tất cả 12 phòng →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 26, textDecoration: 'none', borderRadius: 22 }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center g8">
                    <span className="badge badge-success"><Radio size={11} /> VOICE LIVE</span>
                    <div className="equalizer-wave">
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                    </div>
                  </div>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 148 thành viên</span>
                </div>
                <div className="rm-title bold champagne" style={{ fontSize: 20, marginTop: 14 }}>Minecraft Builders & Architects ⛏️</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Thảo luận redstone, server sinh tồn và chia sẻ công trình xây dựng ảo.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 18 }}>
                  Vào nghe trực tiếp <ArrowRight size={13} />
                </div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 26, textDecoration: 'none', borderRadius: 22 }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center g8">
                    <span className="badge badge-gold"><Flame size={11} /> LOUNGE</span>
                    <div className="equalizer-wave">
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                    </div>
                  </div>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 112 thành viên</span>
                </div>
                <div className="rm-title bold champagne" style={{ fontSize: 20, marginTop: 14 }}>Anime Lo-Fi & Manga Chill ✨</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Nghe nhạc nền thư giãn, trò chuyện về các bộ anime và manga hot nhất mùa này.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 18 }}>
                  Vào nghe trực tiếp <ArrowRight size={13} />
                </div>
              </Link>

              <Link href="/world/dev-ai-hub" className="card card-interactive" style={{ padding: 26, textDecoration: 'none', borderRadius: 22 }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center g8">
                    <span className="badge badge-success"><Radio size={11} /> VOICE LIVE</span>
                    <div className="equalizer-wave">
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                      <span className="equalizer-bar" />
                    </div>
                  </div>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 185 thành viên</span>
                </div>
                <div className="rm-title bold champagne" style={{ fontSize: 20, marginTop: 14 }}>Dev & AI Creators Space 💻</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Giao lưu lập trình viên Next.js, Indie Hackers, mô hình AI và Supabase.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 18 }}>
                  Vào nghe trực tiếp <ArrowRight size={13} />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: TRUST HALL OF FAME */}
        {/* ================================================================= */}
        {activeSubTab === 'trust' && (
          <div className="card" style={{ padding: 40, borderRadius: 24 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="badge badge-lime" style={{ marginBottom: 8 }}>
                  <ShieldCheck size={12} /> RANMET TRUST ENGINE
                </span>
                <h3 className="rm-title" style={{ fontSize: 28 }}>Bảng Vàng Tín Nhiệm & Quyền Lợi</h3>
              </div>
              <span className="badge badge-gold" style={{ fontSize: 14, padding: '6px 16px' }}>
                Hạng hiện tại: {tier.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24, background: 'var(--ln-dark-2)' }}>
                <div className="tiny faint">ĐIỂM TÍN NHIỆM HIỆN TẠI</div>
                <div className="rm-num bold gold" style={{ fontSize: 40, marginTop: 6 }}>{score} PTS</div>
                {next && (
                  <div className="tiny faint" style={{ marginTop: 8 }}>
                    Cần thêm <b className="champagne">{next.needed}</b> điểm để nâng cấp lên <b className="gold">{next.label}</b>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 24, background: 'var(--ln-dark-2)' }}>
                <div className="tiny faint">QUYỀN LỢI ĐẲNG CẤP {tier.name}</div>
                <div className="flex col g10" style={{ marginTop: 10 }}>
                  <div className="tiny flex items-center g8 champagne">
                    <CheckCircle2 size={16} style={{ color: 'var(--ln-lime)' }} /> Ưu tiên ghép đôi tốc độ cao nhất trong AI Radar
                  </div>
                  <div className="tiny flex items-center g8 champagne">
                    <CheckCircle2 size={16} style={{ color: 'var(--ln-lime)' }} /> Huy hiệu verified uy tín trong tất cả phòng Voice
                  </div>
                </div>
              </div>
            </div>

            <div className="tiny faint rm-num bold" style={{ letterSpacing: '0.08em', marginBottom: 16 }}>
              TOP CREATORS XUẤT SẮC TRONG TUẦN
            </div>

            <div className="flex col g12">
              {[
                { rank: 1, name: 'VyVy_Anime', score: '2,450 PTS', badge: 'Kim Cương 💎' },
                { rank: 2, name: 'Kaito_Gamer', score: '1,980 PTS', badge: 'Bạch Kim ⭐' },
                { rank: 3, name: 'LinhChi_Dev', score: '1,720 PTS', badge: 'Bạch Kim ⭐' }
              ].map((c) => (
                <div key={c.rank} className="flex justify-between items-center" style={{ padding: '16px 24px', background: 'var(--ln-dark-2)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center g16">
                    <span className="rm-num bold lime" style={{ width: 28, fontSize: 18 }}>#{c.rank}</span>
                    <span className="semi champagne" style={{ fontSize: 16 }}>{c.name}</span>
                  </div>
                  <div className="flex items-center g14">
                    <span className="badge badge-gold">{c.badge}</span>
                    <span className="rm-num bold gold">{c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
