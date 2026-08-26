'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, ArrowUpRight, Zap, Award, ArrowRight, Radio, Newspaper, Gift, Flame,
  Users, Activity, Trophy, Play, CheckCircle2, TrendingUp
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
      <div className="flex col g20" style={{ maxWidth: 1120, margin: '0 auto' }}>
        
        {/* 1. F1-STYLE TELEMETRY TICKER BAR */}
        <div className="telemetry-ticker">
          <div className="telemetry-item">
            <span className="telemetry-dot" />
            <span className="bold champagne">RANMET LIVE:</span>
            <span className="gold rm-num">1,840 ONLINE</span>
          </div>
          <div className="telemetry-item">
            <span>•</span>
            <Activity size={12} style={{ color: 'var(--verdigris-patina)' }} />
            <span>AI MATCH VELOCITY:</span>
            <span className="champagne rm-num">98.6% ACCURACY</span>
          </div>
          <div className="telemetry-item">
            <span>•</span>
            <Flame size={12} style={{ color: '#f43f5e' }} />
            <span>TRENDING:</span>
            <span className="champagne">#SpatialVoice · #RanVideoCinema</span>
          </div>
          <div className="telemetry-item">
            <span>•</span>
            <Award size={12} style={{ color: 'var(--kinpaku-gold)' }} />
            <span>TRUST POOL:</span>
            <span className="gold rm-num">52,400 PTS</span>
          </div>
        </div>

        {/* 2. HIGH-OCTANE HERO BANNER (Lando Norris Aesthetic) */}
        <div className="f1-hero-banner">
          {/* Subtle Ambient Looping Motion Glow */}
          <div 
            style={{
              position: 'absolute',
              right: '-5%',
              top: '-15%',
              width: '55%',
              height: '130%',
              backgroundImage: 'url(https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15,
              mixBlendMode: 'screen',
              maskImage: 'linear-gradient(to right, transparent, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 50%)',
              pointerEvents: 'none'
            }}
          />

          <div className="flex justify-between items-start" style={{ position: 'relative', zIndex: 2, marginBottom: 16 }}>
            <div className="flex items-center g10">
              <img 
                src="/logo.png" 
                alt="RanMet" 
                style={{ width: 34, height: 34, borderRadius: 9, boxShadow: '0 0 16px var(--brand-glow)' }} 
              />
              <div>
                <span className="badge badge-gold tiny" style={{ fontSize: 10, letterSpacing: '0.08em' }}>
                  THE NEXT-GEN SOCIAL ENGINE
                </span>
              </div>
            </div>

            <form action={logoutAction}>
              <button className="btn-icon" title="Đăng xuất" type="submit" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <LogOut size={16} />
              </button>
            </form>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, marginBottom: 20 }}>
            <div className="f1-hero-title">
              KẾT NỐI KHÔNG GIỚI HẠN · TRẢI NGHIỆM ĐỈNH CAO
            </div>
            <p className="small muted" style={{ marginTop: 10, lineHeight: 1.6, fontSize: 14 }}>
              Chào mừng <b className="champagne">{name}</b>. Khám phá hệ sinh thái AI Radar, rạp phim ngắn RanVideo Cinema và sân khấu âm thanh không gian đa chiều.
            </p>
          </div>

          {/* Action CTAs Row */}
          <div className="flex items-center g12" style={{ position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
            <Link href="/match" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: 13.5 }}>
              <Zap size={16} /> Bắt đầu AI Radar <ArrowRight size={14} />
            </Link>
            <Link href="/videos" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
              <Play size={15} style={{ color: 'var(--kinpaku-gold)' }} /> Xem RanVideo Cinema
            </Link>
          </div>
        </div>

        {/* 3. INTELLIGENT SUB-TAB NAVIGATION BAR */}
        <div className="subtab-bar">
          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <Flame size={15} /> Tổng Quan Hệ Sinh Thái
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('radar')}
          >
            <Zap size={15} /> AI Radar & Match
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'stages' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('stages')}
          >
            <Radio size={15} /> Sân Khấu Voice Live (3)
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('trust')}
          >
            <Trophy size={15} /> Bảng Vàng & Trust ({score} pts)
          </button>
        </div>

        {/* 4. SUB-TAB VIEWS CONTENT */}

        {/* TAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="flex col g20">
            {/* Bento 3-Columns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
              
              {/* Tile 1: RanVideo Cinema Showcase */}
              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 16, 
                    height: 240, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JldmhzYWRlZHRrOXB1czVlbm1xcmR2eHBoNTNyMGx1c2o3eW1xZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kigKjAJryWTZK/giphy.gif" 
                    alt="RanVideo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 18, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.92) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-gold tiny"><Flame size={10} /> CINEMA THEATER</span>
                      <Video size={18} style={{ color: 'var(--kinpaku-gold)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 18, marginBottom: 4 }}>RanVideo Shorts</div>
                      <div className="tiny muted">Rạp phim video dọc 2 cột, bình luận trực tiếp và lọc 18+ an toàn.</div>
                      <div className="tiny bold gold flex items-center g4" style={{ marginTop: 8 }}>
                        Khám phá ngay <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Tile 2: RanNews Pulse */}
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 16, 
                    height: 240, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" 
                    alt="RanNews" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 18, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.92) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-success tiny"><Newspaper size={10} /> SOCIAL TIMELINE</span>
                      <Sparkles size={18} style={{ color: 'var(--verdigris-patina)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 18, marginBottom: 4 }}>RanNews & AI Dịch</div>
                      <div className="tiny muted">Bảng tin cộng đồng 3 cột, đính kèm GIF động và AI dịch thuật tức thì.</div>
                      <div className="tiny bold gold flex items-center g4" style={{ marginTop: 8 }}>
                        Đọc bản tin <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Tile 3: RanWorld Spatial Lounges */}
              <Link href="/world" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 16, 
                    height: 240, 
                    position: 'relative' 
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" 
                    alt="RanWorld" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 18, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.92) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-success tiny"><Radio size={10} /> SPATIAL AUDIO</span>
                      <Globe2 size={18} style={{ color: 'var(--emerald-patina)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 18, marginBottom: 4 }}>RanWorld Voice Live</div>
                      <div className="tiny muted">Không gian phòng voice theo chủ đề Gaming, Anime Lo-Fi và Dev AI.</div>
                      <div className="tiny bold gold flex items-center g4" style={{ marginTop: 8 }}>
                        Vào phòng nghe <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint">Điểm Tín Nhiệm Trust</span>
                  <Award size={16} style={{ color: 'var(--kinpaku-gold)' }} />
                </div>
                <div className="rm-num bold gold" style={{ fontSize: 26, marginTop: 4 }}>
                  {score} <span className="tiny faint">PTS ({tier.name})</span>
                </div>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint">Lượt Giới Thiệu Bạn Bè</span>
                  <Gift size={16} style={{ color: 'var(--verdigris-patina)' }} />
                </div>
                <div className="rm-num bold champagne" style={{ fontSize: 26, marginTop: 4 }}>
                  {referrals}/10 <span className="tiny faint">Thành viên</span>
                </div>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <div className="flex justify-between items-center">
                  <span className="tiny faint">AI Vision Guard</span>
                  <ShieldCheck size={16} style={{ color: 'var(--emerald-patina)' }} />
                </div>
                <div className="bold" style={{ fontSize: 15, marginTop: 6, color: 'var(--emerald-patina)' }}>
                  Kích hoạt & Bảo vệ 24/7
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI RADAR & MATCH */}
        {activeSubTab === 'radar' && (
          <div className="card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 18 }}>
              <div>
                <div className="badge badge-gold tiny" style={{ marginBottom: 8 }}>
                  <Zap size={12} /> AI MATCHING RADAR CONSOLE
                </div>
                <h3 className="rm-title" style={{ fontSize: 22 }}>Ghép Đôi Trực Tiếp Bằng Trí Tuệ Nhân Tạo</h3>
                <p className="small muted" style={{ maxWidth: 600, marginTop: 4 }}>
                  Thuật toán đối chiếu sở thích, phong cách trò chuyện và độ uy tín để tìm ra bạn đồng hành ăn ý nhất.
                </p>
              </div>

              <Link href="/match" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
                Mở Radar HUD <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div className="card" style={{ background: 'var(--lacquer-deep)', padding: 16 }}>
                <div className="semi champagne" style={{ fontSize: 15 }}>🎯 Tương Thích Sở Thích</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  Tự động phân tích các tag: {profile?.interests?.slice(0, 3).join(', ') || 'Âm nhạc, Công nghệ'}
                </div>
              </div>

              <div className="card" style={{ background: 'var(--lacquer-deep)', padding: 16 }}>
                <div className="semi champagne" style={{ fontSize: 15 }}>💬 Phong Cách Hội Thoại</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  Chế độ: <b className="champagne">{profile?.conversation_style || 'Thoải mái, tự do'}</b>
                </div>
              </div>

              <div className="card" style={{ background: 'var(--lacquer-deep)', padding: 16 }}>
                <div className="semi champagne" style={{ fontSize: 15 }}>🛡️ Lọc Độ Tuổi & 18+</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  Trạng thái: <b className="gold">{profile?.age_verified ? 'Đã xác minh 18+' : 'Chế độ an toàn'}</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE STAGES */}
        {activeSubTab === 'stages' && (
          <div className="flex col g16">
            <div className="flex justify-between items-center">
              <h3 className="rm-title" style={{ fontSize: 20 }}>Sân Khấu Âm Thanh Voice Đang Phát Trực Tiếp</h3>
              <Link href="/world" className="tiny bold gold">Xem tất cả phòng →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 18, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-success tiny"><Radio size={10} /> VOICE LIVE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 148 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 16, marginTop: 10 }}>Minecraft Builders & Architects ⛏️</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>Thảo luận redstone, server sinh tồn và xây dựng thành phố ảo.</div>
                <div className="tiny bold gold" style={{ marginTop: 12 }}>Tham gia trò chuyện →</div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 18, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-gold tiny"><Flame size={10} /> LOUNGE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 112 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 16, marginTop: 10 }}>Anime Lo-Fi & Manga Lounge ✨</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>Nghe nhạc nền thư giãn, bàn luận các bộ anime mùa mới.</div>
                <div className="tiny bold gold" style={{ marginTop: 12 }}>Tham gia trò chuyện →</div>
              </Link>

              <Link href="/world/dev-ai-hub" className="card card-interactive" style={{ padding: 18, textDecoration: 'none' }}>
                <div className="flex justify-between items-start">
                  <span className="badge badge-success tiny"><Radio size={10} /> VOICE LIVE</span>
                  <span className="tiny faint flex items-center g4"><Users size={12} /> 185 thành viên</span>
                </div>
                <div className="semi champagne" style={{ fontSize: 16, marginTop: 10 }}>Dev & AI Creators Space 💻</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>Giao lưu lập trình viên Next.js, Indie Hackers và Supabase AI.</div>
                <div className="tiny bold gold" style={{ marginTop: 12 }}>Tham gia trò chuyện →</div>
              </Link>
            </div>
          </div>
        )}

        {/* TAB 4: TRUST & LEADERBOARD */}
        {activeSubTab === 'trust' && (
          <div className="card" style={{ padding: 24 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 20 }}>
              <div>
                <div className="badge badge-patina tiny" style={{ marginBottom: 6 }}>
                  <ShieldCheck size={12} /> RANMET TRUST ENGINE
                </div>
                <h3 className="rm-title" style={{ fontSize: 22 }}>Bảng Xếp Hạng & Điểm Tín Nhiệm Cá Nhân</h3>
              </div>
              <span className="badge badge-gold tiny" style={{ fontSize: 12, padding: '4px 10px' }}>
                Hạng: {tier.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
              <div className="card" style={{ padding: 16, background: 'var(--lacquer-deep)' }}>
                <div className="tiny faint">Điểm Tín Nhiệm Hiện Tại</div>
                <div className="rm-num bold gold" style={{ fontSize: 32, marginTop: 4 }}>{score} PTS</div>
                {next && (
                  <div className="tiny faint" style={{ marginTop: 8 }}>
                    Cần thêm <b className="champagne">{next.needed}</b> điểm để đạt cấp <b className="gold">{next.label}</b>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 16, background: 'var(--lacquer-deep)' }}>
                <div className="tiny faint">Quyền Lợi Đẳng Cấp {tier.name}</div>
                <div className="flex col g6" style={{ marginTop: 8 }}>
                  <div className="tiny flex items-center g6 champagne">
                    <CheckCircle2 size={13} style={{ color: 'var(--emerald-patina)' }} /> Ưu tiên ghép đôi radar tốc độ cao
                  </div>
                  <div className="tiny flex items-center g6 champagne">
                    <CheckCircle2 size={13} style={{ color: 'var(--emerald-patina)' }} /> Huy hiệu verified uy tín trong phòng Voice
                  </div>
                </div>
              </div>
            </div>

            {/* Top Creators Leaderboard */}
            <div className="tiny faint" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Top Thành Viên Xuất Sắc Tuần Này
            </div>
            <div className="flex col g8">
              {[
                { rank: 1, name: 'VyVy_Anime', score: '2,450 PTS', badge: 'Kim Cương 💎' },
                { rank: 2, name: 'Kaito_Gamer', score: '1,980 PTS', badge: 'Bạch Kim ⭐' },
                { rank: 3, name: 'LinhChi_Dev', score: '1,720 PTS', badge: 'Bạch Kim ⭐' }
              ].map((c) => (
                <div key={c.rank} className="flex justify-between items-center" style={{ padding: '10px 14px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                  <div className="flex items-center g10">
                    <span className="rm-num bold gold" style={{ width: 20 }}>#{c.rank}</span>
                    <span className="semi champagne" style={{ fontSize: 14 }}>{c.name}</span>
                  </div>
                  <div className="flex items-center g10">
                    <span className="badge badge-gold tiny">{c.badge}</span>
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
