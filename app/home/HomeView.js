'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, ArrowUpRight, Zap, Award, ArrowRight, Radio, Newspaper, Gift, Flame,
  Users, Activity, Trophy, Play, CheckCircle2, TrendingUp, MessageSquare, Sliders
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
  const name = profile?.display_name || 'Bạn mới'
  const initial = name.charAt(0).toUpperCase()
  const referrals = refCount || 0

  return (
    <AppShell userProfile={profile} trustScore={score}>
      <div className="flex col g24" style={{ maxWidth: 1180, margin: '0 auto' }}>
        
        {/* 1. F1 TELEMETRY LIVE TICKER BAR */}
        <div className="telemetry-ticker">
          <div className="telemetry-item">
            <span className="telemetry-dot" />
            <span className="bold champagne" style={{ letterSpacing: '0.06em' }}>RANMET TELEMETRY:</span>
            <span className="lime rm-num bold">1,840 ONLINE</span>
          </div>
          <div className="telemetry-item">
            <span className="faint">•</span>
            <Activity size={13} style={{ color: 'var(--ln-cyan)' }} />
            <span>AI MATCH ACCURACY:</span>
            <span className="champagne rm-num bold">98.6%</span>
          </div>
          <div className="telemetry-item">
            <span className="faint">•</span>
            <Flame size={13} style={{ color: 'var(--ln-magenta)' }} />
            <span>TRENDING:</span>
            <span className="champagne">#SpatialVoice · #RanVideoCinema</span>
          </div>
          <div className="telemetry-item">
            <span className="faint">•</span>
            <Award size={13} style={{ color: 'var(--kinpaku-gold)' }} />
            <span>COMMUNITY TRUST POOL:</span>
            <span className="gold rm-num bold">52,400 PTS</span>
          </div>
        </div>

        {/* 2. GRAND IMPACT HERO STAGE (Lando Norris Aesthetic) */}
        <div 
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'linear-gradient(135deg, #0f0f16 0%, #060609 100%)',
            padding: '36px 32px',
            boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Ambient Motion GIF Texture in Background */}
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: 'url(https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.18,
              mixBlendMode: 'screen',
              maskImage: 'linear-gradient(to right, transparent, black 60%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)',
              pointerEvents: 'none'
            }}
          />

          {/* Top Tag & Logout Header */}
          <div className="flex justify-between items-start" style={{ position: 'relative', zIndex: 2, marginBottom: 20 }}>
            <div className="flex items-center g10">
              <img 
                src="/logo.png" 
                alt="RanMet Logo" 
                style={{ width: 36, height: 36, borderRadius: 10, boxShadow: '0 0 20px var(--brand-aurora-glow)' }} 
              />
              <div className="flex items-center g6">
                <span className="badge badge-lime">
                  OFFICIAL ENGINE v2.0
                </span>
                <span className="badge badge-gold">
                  {tier.name} TIER
                </span>
              </div>
            </div>

            <form action={logoutAction}>
              <button 
                className="btn-icon" 
                title="Đăng xuất" 
                type="submit"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>

          {/* Massive Display Heading */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 740, marginBottom: 24 }}>
            <div className="ln-impact-title">
              KẾT NỐI KHÔNG GIỚI HẠN · NÂNG TẦM TRẢI NGHIỆM
            </div>
            <p className="ln-sub-hero" style={{ marginTop: 12 }}>
              Xin chào <b className="champagne">{name}</b>. Khám phá vũ trụ mạng xã hội thế hệ mới với AI Matching Radar, rạp phim ngắn 60FPS RanVideo Cinema và không gian âm thanh đa chiều Spatial Voice.
            </p>
          </div>

          {/* Telemetry Control Pill Row & CTAs */}
          <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 20 }}>
            <div className="flex items-center g12" style={{ flexWrap: 'wrap' }}>
              <Link href="/match" className="btn btn-primary">
                <Zap size={16} /> Bắt đầu AI Radar Scan <ArrowRight size={14} />
              </Link>
              <Link href="/videos" className="btn btn-secondary">
                <Play size={15} style={{ color: 'var(--ln-lime)' }} /> Xem RanVideo Cinema
              </Link>
            </div>

            <div className="flex items-center g16 tiny faint rm-num">
              <div>ĐỘ TRỄ: <b className="lime">12ms</b></div>
              <div>MÃ HÓA: <b className="champagne">E2EE ACTIVE</b></div>
              <div>BẢO MẬT: <b className="gold">18+ AI GATE</b></div>
            </div>
          </div>
        </div>

        {/* 3. DEDICATED SUB-TAB SELECTOR (High-Fashion Capsule Bar) */}
        <div className="subtab-bar">
          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <Flame size={15} /> 01 // Tổng Quan Hệ Sinh Thái
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('radar')}
          >
            <Zap size={15} /> 02 // AI Radar & Đối Soát
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'stages' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('stages')}
          >
            <Radio size={15} /> 03 // Sân Khấu Voice Live (3)
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('trust')}
          >
            <Trophy size={15} /> 04 // Bảng Vàng & Tín Nhiệm ({score} pts)
          </button>
        </div>

        {/* 4. SUB-TAB VIEW CONTENT */}

        {/* ================================================================= */}
        {/* VIEW 1: OVERVIEW BENTO REEL */}
        {/* ================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="flex col g24">
            {/* 3-Column Immersive Media Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              
              {/* Card 1: RanVideo Shorts Cinema */}
              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 18, 
                    height: 270, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JldmhzYWRlZHRrOXB1czVlbm1xcmR2eHBoNTNyMGx1c2o3eW1xZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kigKjAJryWTZK/giphy.gif" 
                    alt="RanVideo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 20, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-gold"><Flame size={11} /> 01 // CINEMA THEATER</span>
                      <Video size={20} style={{ color: 'var(--kinpaku-gold)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 20, marginBottom: 4 }}>RanVideo Cinema</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Trải nghiệm rạp chiếu video dọc 2 cột, bình luận trực tiếp và bộ lọc 18+ tự động.</div>
                      <div className="tiny bold lime flex items-center g4" style={{ marginTop: 10 }}>
                        Khám phá rạp phim <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 2: RanNews Social Timeline */}
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 18, 
                    height: 270, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" 
                    alt="RanNews" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 20, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-lime"><Newspaper size={11} /> 02 // SOCIAL TIMELINE</span>
                      <Sparkles size={20} style={{ color: 'var(--ln-lime)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 20, marginBottom: 4 }}>RanNews & AI Dịch</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Bảng tin cộng đồng 3 cột, đính kèm GIF phản ứng và dịch thuật AI 1-chạm.</div>
                      <div className="tiny bold lime flex items-center g4" style={{ marginTop: 10 }}>
                        Đọc bảng tin <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 3: RanWorld Spatial Voice */}
              <Link href="/world" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 18, 
                    height: 270, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" 
                    alt="RanWorld" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 20, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(6,6,8,0.95) 0%, rgba(6,6,8,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-success"><Radio size={11} /> 03 // SPATIAL AUDIO</span>
                      <Globe2 size={20} style={{ color: '#2dd4bf' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 20, marginBottom: 4 }}>RanWorld Lounges</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Không gian phòng voice theo chủ đề Gaming, Anime Lo-Fi và Dev AI Creators.</div>
                      <div className="tiny bold lime flex items-center g4" style={{ marginTop: 10 }}>
                        Vào phòng nghe <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Telemetry Indicators Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Điểm Tín Nhiệm Trust</span>
                  <Award size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                </div>
                <div className="rm-num bold gold" style={{ fontSize: 30, marginTop: 6 }}>
                  {score} <span className="tiny faint">PTS ({tier.name})</span>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mạng Lưới Bạn Bè</span>
                  <Gift size={18} style={{ color: 'var(--ln-cyan)' }} />
                </div>
                <div className="rm-num bold champagne" style={{ fontSize: 30, marginTop: 6 }}>
                  {referrals}/10 <span className="tiny faint">Thành viên</span>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Vision & Guard</span>
                  <ShieldCheck size={18} style={{ color: 'var(--ln-lime)' }} />
                </div>
                <div className="bold lime" style={{ fontSize: 16, marginTop: 8 }}>
                  KÍCH HOẠT & BẢO VỆ 24/7
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: AI RADAR CONSOLE */}
        {/* ================================================================= */}
        {activeSubTab === 'radar' && (
          <div className="card" style={{ padding: 28 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 20 }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: 8 }}>
                  <Zap size={12} /> AI MATCHING RADAR CONSOLE
                </span>
                <h3 className="rm-title" style={{ fontSize: 24 }}>Ghép Đôi Trực Tiếp Bằng Trí Tuệ Nhân Tạo</h3>
                <p className="small muted" style={{ maxWidth: 640, marginTop: 6 }}>
                  Thuật toán đối sánh ngữ nghĩa phân tích sở thích, phong cách giao tiếp và điểm uy tín để ghép nối chuẩn xác nhất.
                </p>
              </div>

              <Link href="/match" className="btn btn-primary">
                Mở Radar HUD <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="card" style={{ background: 'var(--ln-dark-2)', padding: 18 }}>
                <div className="semi champagne" style={{ fontSize: 16 }}>🎯 Tương Thích Sở Thích</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  Tự động phân tích các tag: {profile?.interests?.slice(0, 3).join(', ') || 'Âm nhạc, Công nghệ'}
                </div>
              </div>

              <div className="card" style={{ background: 'var(--ln-dark-2)', padding: 18 }}>
                <div className="semi champagne" style={{ fontSize: 16 }}>💬 Phong Cách Hội Thoại</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  Chế độ: <b className="champagne">{profile?.conversation_style || 'Thoải mái, tự do'}</b>
                </div>
              </div>

              <div className="card" style={{ background: 'var(--ln-dark-2)', padding: 18 }}>
                <div className="semi champagne" style={{ fontSize: 16 }}>🛡️ Lọc Độ Tuổi & 18+</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  Trạng thái: <b className="lime">{profile?.age_verified ? 'Đã xác minh 18+' : 'Chế độ an toàn'}</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: LIVE STAGES */}
        {/* ================================================================= */}
        {activeSubTab === 'stages' && (
          <div className="flex col g18">
            <div className="flex justify-between items-center">
              <h3 className="rm-title" style={{ fontSize: 22 }}>Sân Khấu Âm Thanh Voice Đang Phát Trực Tiếp</h3>
              <Link href="/world" className="tiny bold gold">Xem tất cả phòng →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 20, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-success"><Radio size={10} /> VOICE LIVE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 148 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 17, marginTop: 12 }}>Minecraft Builders & Architects ⛏️</div>
                <div className="tiny muted" style={{ marginTop: 6 }}>Thảo luận redstone, server sinh tồn và xây dựng thành phố ảo.</div>
                <div className="tiny bold lime" style={{ marginTop: 14 }}>Tham gia trò chuyện →</div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 20, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-gold"><Flame size={10} /> LOUNGE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 112 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 17, marginTop: 12 }}>Anime Lo-Fi & Manga Lounge ✨</div>
                <div className="tiny muted" style={{ marginTop: 6 }}>Nghe nhạc nền thư giãn, bàn luận các bộ anime mùa mới.</div>
                <div className="tiny bold lime" style={{ marginTop: 14 }}>Tham gia trò chuyện →</div>
              </Link>

              <Link href="/world/dev-ai-hub" className="card card-interactive" style={{ padding: 20, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-success"><Radio size={10} /> VOICE LIVE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 185 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 17, marginTop: 12 }}>Dev & AI Creators Space 💻</div>
                <div className="tiny muted" style={{ marginTop: 6 }}>Giao lưu lập trình viên Next.js, Indie Hackers và Supabase AI.</div>
                <div className="tiny bold lime" style={{ marginTop: 14 }}>Tham gia trò chuyện →</div>
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 4: TRUST & HALL OF FAME */}
        {/* ================================================================= */}
        {activeSubTab === 'trust' && (
          <div className="card" style={{ padding: 28 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 24 }}>
              <div>
                <span className="badge badge-lime" style={{ marginBottom: 8 }}>
                  <ShieldCheck size={12} /> RANMET TRUST ENGINE
                </span>
                <h3 className="rm-title" style={{ fontSize: 24 }}>Bảng Xếp Hạng & Điểm Tín Nhiệm Cá Nhân</h3>
              </div>
              <span className="badge badge-gold" style={{ fontSize: 13, padding: '5px 12px' }}>
                Hạng: {tier.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div className="card" style={{ padding: 20, background: 'var(--ln-dark-2)' }}>
                <div className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Điểm Tín Nhiệm Hiện Tại</div>
                <div className="rm-num bold gold" style={{ fontSize: 36, marginTop: 6 }}>{score} PTS</div>
                {next && (
                  <div className="tiny faint" style={{ marginTop: 10 }}>
                    Cần thêm <b className="champagne">{next.needed}</b> điểm để đạt cấp <b className="gold">{next.label}</b>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 20, background: 'var(--ln-dark-2)' }}>
                <div className="tiny faint" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quyền Lợi Đẳng Cấp {tier.name}</div>
                <div className="flex col g8" style={{ marginTop: 10 }}>
                  <div className="tiny flex items-center g8 champagne">
                    <CheckCircle2 size={15} style={{ color: 'var(--ln-lime)' }} /> Ưu tiên ghép đôi radar tốc độ cao
                  </div>
                  <div className="tiny flex items-center g8 champagne">
                    <CheckCircle2 size={15} style={{ color: 'var(--ln-lime)' }} /> Huy hiệu verified uy tín trong phòng Voice
                  </div>
                </div>
              </div>
            </div>

            {/* Top Creators Leaderboard */}
            <div className="tiny faint" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Top Thành Viên Xuất Sắc Tuần Này
            </div>
            <div className="flex col g10">
              {[
                { rank: 1, name: 'VyVy_Anime', score: '2,450 PTS', badge: 'Kim Cương 💎' },
                { rank: 2, name: 'Kaito_Gamer', score: '1,980 PTS', badge: 'Bạch Kim ⭐' },
                { rank: 3, name: 'LinhChi_Dev', score: '1,720 PTS', badge: 'Bạch Kim ⭐' }
              ].map((c) => (
                <div key={c.rank} className="flex justify-between items-center" style={{ padding: '12px 18px', background: 'var(--ln-dark-2)', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center g12">
                    <span className="rm-num bold lime" style={{ width: 24, fontSize: 15 }}>#{c.rank}</span>
                    <span className="semi champagne" style={{ fontSize: 15 }}>{c.name}</span>
                  </div>
                  <div className="flex items-center g12">
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
