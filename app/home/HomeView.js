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
      <div className="flex col g24" style={{ width: '100%' }}>
        
        {/* 1. INFINITE RUNNING MARQUEE TICKER (Lando Norris Signature) */}
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="flex items-center g8">
              <span className="telemetry-dot" />
              <b className="lime">RANMET TELEMETRY //</b> LIVE USERS: 1,840 ONLINE
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Activity size={14} style={{ color: 'var(--ln-cyan)' }} />
              AI RADAR MATCH ACCURACY: <b className="champagne">98.6%</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Flame size={14} style={{ color: 'var(--ln-magenta)' }} />
              TRENDING: <b className="champagne">#SpatialVoice · #RanVideoCinema · #AnimeLoFi</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <ShieldCheck size={14} style={{ color: 'var(--ln-lime)' }} />
              AI VISION CONTENT GUARD: <b className="lime">ACTIVE 24/7</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Trophy size={14} style={{ color: 'var(--kinpaku-gold)' }} />
              COMMUNITY TRUST POOL: <b className="gold">52,400 PTS</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <span className="telemetry-dot" />
              <b className="lime">RANMET TELEMETRY //</b> LIVE USERS: 1,840 ONLINE
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Activity size={14} style={{ color: 'var(--ln-cyan)' }} />
              AI RADAR MATCH ACCURACY: <b className="champagne">98.6%</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Flame size={14} style={{ color: 'var(--ln-magenta)' }} />
              TRENDING: <b className="champagne">#SpatialVoice · #RanVideoCinema · #AnimeLoFi</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <ShieldCheck size={14} style={{ color: 'var(--ln-lime)' }} />
              AI VISION CONTENT GUARD: <b className="lime">ACTIVE 24/7</b>
            </span>
            <span>•</span>
            <span className="flex items-center g8">
              <Trophy size={14} style={{ color: 'var(--kinpaku-gold)' }} />
              COMMUNITY TRUST POOL: <b className="gold">52,400 PTS</b>
            </span>
          </div>
        </div>

        {/* 2. GRAND FULL-BLEED HERO STAGE (Lando Norris Impact Editorial) */}
        <div 
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'linear-gradient(135deg, #0d0d14 0%, #060608 100%)',
            padding: '48px 40px',
            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.85)'
          }}
        >
          {/* Ambient Video Loop Glow */}
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '55%',
              backgroundImage: 'url(https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.22,
              mixBlendMode: 'screen',
              maskImage: 'linear-gradient(to right, transparent, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 50%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 36, alignItems: 'center' }}>
            
            {/* Left Column: Hero Display Headline */}
            <div>
              <div className="flex items-center g8" style={{ marginBottom: 16 }}>
                <span className="badge badge-lime">
                  HIGH-OCTANE // 01
                </span>
                <span className="badge badge-gold">
                  {tier.name} TIER
                </span>
              </div>

              <div className="ln-impact-title" style={{ marginBottom: 16 }}>
                TỐC ĐỘ KẾT NỐI KHÔNG GIỚI HẠN
              </div>

              <p className="ln-sub-hero" style={{ marginBottom: 28 }}>
                Chào mừng <b className="champagne">{name}</b>. Khám phá mạng xã hội AI thế hệ mới: Radar đối soát thông minh, rạp phim ngắn 60FPS RanVideo và sân khấu âm thanh đa chiều Spatial Voice.
              </p>

              <div className="flex items-center g14" style={{ flexWrap: 'wrap' }}>
                <Link href="/match" className="btn btn-lime">
                  <Zap size={16} /> Bắt Đầu AI Radar Scan <ArrowRight size={15} />
                </Link>
                <Link href="/videos" className="btn btn-secondary">
                  <Play size={15} style={{ color: 'var(--brand-aurora)' }} /> Xem RanVideo Cinema
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Telemetry Cockpit Box */}
            <div className="card-glass" style={{ padding: 24, border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
                <span className="tiny faint rm-num bold" style={{ letterSpacing: '0.08em' }}>
                  TELEMETRY COCKPIT // SYS.01
                </span>
                <div className="equalizer-wave">
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ background: 'var(--ln-dark-2)', padding: 14, borderRadius: 12 }}>
                  <div className="tiny faint">ĐỘ TRỄ ENGINE</div>
                  <div className="rm-num bold lime" style={{ fontSize: 24, marginTop: 4 }}>12ms</div>
                </div>
                <div style={{ background: 'var(--ln-dark-2)', padding: 14, borderRadius: 12 }}>
                  <div className="tiny faint">AI RADAR ACCURACY</div>
                  <div className="rm-num bold champagne" style={{ fontSize: 24, marginTop: 4 }}>98.6%</div>
                </div>
              </div>

              <div className="flex justify-between items-center" style={{ background: 'var(--ln-dark-2)', padding: 14, borderRadius: 12 }}>
                <div className="flex items-center g8">
                  <ShieldCheck size={18} style={{ color: 'var(--ln-lime)' }} />
                  <div className="flex col">
                    <span className="tiny bold champagne">BẢO MẬT & KIỂM DUYỆT 18+</span>
                    <span className="tiny faint">{profile?.age_verified ? 'Đã kích hoạt chế độ Adult' : 'Chế độ an toàn tự động'}</span>
                  </div>
                </div>
                <Link href="/profile" className="tiny bold gold">Cài đặt →</Link>
              </div>
            </div>

          </div>
        </div>

        {/* 3. SUB-TAB SELECTOR BAR */}
        <div className="subtab-bar">
          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'overview' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <Flame size={15} /> 01 // BENTO SPOTLIGHT
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'radar' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('radar')}
          >
            <Zap size={15} /> 02 // AI RADAR SCAN HUD
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'stages' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('stages')}
          >
            <Radio size={15} /> 03 // LIVE VOICE STAGES (3)
          </button>

          <button 
            type="button" 
            className={`subtab-btn ${activeSubTab === 'trust' ? 'active-lime' : ''}`}
            onClick={() => setActiveSubTab('trust')}
          >
            <Trophy size={15} /> 04 // BẢNG VÀNG TRUST ({score} PTS)
          </button>
        </div>

        {/* 4. SUB-TAB VIEW CONTENT */}

        {/* ================================================================= */}
        {/* VIEW 1: ASYMMETRIC BENTO SPOTLIGHT */}
        {/* ================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="flex col g24">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
              
              {/* Tile 1: RanVideo Cinema */}
              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    height: 320, 
                    position: 'relative' 
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
                      padding: 24, 
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
                      <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 4 }}>RanVideo Cinema</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Rạp chiếu video ngắn 60FPS chuẩn điện ảnh, bình luận thời gian thực và bộ lọc kiểm duyệt 18+ tự động.</div>
                      <div className="tiny bold lime flex items-center g6" style={{ marginTop: 12 }}>
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
                    height: 320, 
                    position: 'relative' 
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
                      padding: 24, 
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
                      <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 4 }}>RanNews & AI Dịch</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Dòng thời gian tương tác đa phương tiện, kho sticker GIF phong phú và dịch thuật tự động hơn 50 ngôn ngữ.</div>
                      <div className="tiny bold lime flex items-center g6" style={{ marginTop: 12 }}>
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
                    height: 320, 
                    position: 'relative' 
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
                      padding: 24, 
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
                      <div className="rm-title bold champagne" style={{ fontSize: 24, marginBottom: 4 }}>RanWorld Spatial Audio</div>
                      <div className="tiny muted" style={{ lineHeight: 1.5 }}>Phòng voice không gian đa chiều theo chủ đề Gaming, Anime Lo-Fi và không gian sáng tạo Dev AI.</div>
                      <div className="tiny bold lime flex items-center g6" style={{ marginTop: 12 }}>
                        Vào sân khấu voice <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: RADAR SCAN HUD */}
        {/* ================================================================= */}
        {activeSubTab === 'radar' && (
          <div className="card" style={{ padding: 36 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 32, alignItems: 'center' }}>
              <div className="radar-hud">
                <div className="radar-ring radar-ring-1" />
                <div className="radar-ring radar-ring-2" />
                <div className="radar-ring radar-ring-3" />
                <div className="radar-sweep-beam" />
                <div className="center-text flex col items-center">
                  <div className="rm-num bold lime" style={{ fontSize: 22 }}>98.6%</div>
                  <div className="tiny faint">MATCH RATE</div>
                </div>
              </div>

              <div className="flex col g12">
                <div className="card" style={{ padding: 18, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>🎯 Tương Đồng Sở Thích Cao Nhất</div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {profile?.interests?.length > 0 ? profile.interests.join(' · ') : 'Gaming · Anime · Lập trình · Âm nhạc'}
                  </div>
                </div>
                <div className="card" style={{ padding: 18, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>💬 Phong Cách Đối Thoại Tối Ưu</div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {profile?.conversation_style || 'Thoải mái, vui vẻ và tự do'}
                  </div>
                </div>
                <div className="card" style={{ padding: 18, background: 'var(--ln-dark-2)' }}>
                  <div className="semi champagne" style={{ fontSize: 16 }}>🛡️ Bộ Lọc Xác Thực Độ Tuổi 18+</div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
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
          <div className="flex col g18">
            <div className="flex justify-between items-center">
              <h3 className="rm-title" style={{ fontSize: 24 }}>Sân Khấu Âm Thanh Voice Đang Phát Trực Tiếp</h3>
              <Link href="/world" className="tiny bold gold">Xem tất cả 12 phòng →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 24, textDecoration: 'none' }}>
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
                <div className="rm-title bold champagne" style={{ fontSize: 19, marginTop: 14 }}>Minecraft Builders & Architects ⛏️</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Thảo luận redstone, server sinh tồn và chia sẻ công trình xây dựng ảo.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 16 }}>
                  Vào nghe trực tiếp <ArrowRight size={13} />
                </div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 24, textDecoration: 'none' }}>
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
                <div className="rm-title bold champagne" style={{ fontSize: 19, marginTop: 14 }}>Anime Lo-Fi & Manga Chill ✨</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Nghe nhạc nền thư giãn, trò chuyện về các bộ anime và manga hot nhất mùa này.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 16 }}>
                  Vào nghe trực tiếp <ArrowRight size={13} />
                </div>
              </Link>

              <Link href="/world/dev-ai-hub" className="card card-interactive" style={{ padding: 24, textDecoration: 'none' }}>
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
                <div className="rm-title bold champagne" style={{ fontSize: 19, marginTop: 14 }}>Dev & AI Creators Space 💻</div>
                <div className="tiny muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Giao lưu lập trình viên Next.js, Indie Hackers, mô hình AI và Supabase.</div>
                <div className="tiny bold lime flex items-center g4" style={{ marginTop: 16 }}>
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
          <div className="card" style={{ padding: 36 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="badge badge-lime" style={{ marginBottom: 8 }}>
                  <ShieldCheck size={12} /> RANMET TRUST ENGINE
                </span>
                <h3 className="rm-title" style={{ fontSize: 28 }}>Bảng Vàng Tín Nhiệm & Quyền Lợi</h3>
              </div>
              <span className="badge badge-gold" style={{ fontSize: 14, padding: '6px 14px' }}>
                Hạng hiện tại: {tier.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div className="card" style={{ padding: 22, background: 'var(--ln-dark-2)' }}>
                <div className="tiny faint">ĐIỂM TÍN NHIỆM HIỆN TẠI</div>
                <div className="rm-num bold gold" style={{ fontSize: 40, marginTop: 6 }}>{score} PTS</div>
                {next && (
                  <div className="tiny faint" style={{ marginTop: 8 }}>
                    Cần thêm <b className="champagne">{next.needed}</b> điểm để nâng cấp lên <b className="gold">{next.label}</b>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 22, background: 'var(--ln-dark-2)' }}>
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

            <div className="tiny faint rm-num bold" style={{ letterSpacing: '0.08em', marginBottom: 14 }}>
              TOP CREATORS XUẤT SẮC TRONG TUẦN
            </div>

            <div className="flex col g10">
              {[
                { rank: 1, name: 'VyVy_Anime', score: '2,450 PTS', badge: 'Kim Cương 💎' },
                { rank: 2, name: 'Kaito_Gamer', score: '1,980 PTS', badge: 'Bạch Kim ⭐' },
                { rank: 3, name: 'LinhChi_Dev', score: '1,720 PTS', badge: 'Bạch Kim ⭐' }
              ].map((c) => (
                <div key={c.rank} className="flex justify-between items-center" style={{ padding: '14px 20px', background: 'var(--ln-dark-2)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="flex items-center g14">
                    <span className="rm-num bold lime" style={{ width: 28, fontSize: 16 }}>#{c.rank}</span>
                    <span className="semi champagne" style={{ fontSize: 16 }}>{c.name}</span>
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
