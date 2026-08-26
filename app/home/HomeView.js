'use client'

import Link from 'next/link'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, ArrowUpRight, Zap, Award, ArrowRight, Radio, Newspaper, Gift, Flame
} from 'lucide-react'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { useLanguage } from '@/lib/LanguageContext'
import { logoutAction } from './actions'
import AppShell from '../components/AppShell'

export default function HomeView({ profile, trust, refCount }) {
  const { t } = useLanguage()

  const score = trust?.score ?? 100
  const tier = trustTier(score)
  const next = nextTierInfo(score)
  const name = profile?.display_name || 'Bạn mới'
  const initial = name.charAt(0).toUpperCase()
  const referrals = refCount || 0

  return (
    <AppShell userProfile={profile} trustScore={score}>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 24,
          maxWidth: 1100,
          margin: '0 auto'
        }}
      >
        {/* MAIN FEED COLUMN */}
        <div className="flex col g24">
          {/* Top User Greeting with Official Brand Accent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center g14">
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div
                  className="avatar"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    cursor: 'pointer',
                    border: '1.5px solid var(--gold-hairline-strong)',
                    background: 'var(--lacquer-deep)'
                  }}
                >
                  {initial}
                </div>
              </Link>
              <div>
                <div className="flex items-center g8">
                  <h1 className="rm-title" style={{ fontSize: 20, margin: 0 }}>{t('welcome')}, {name}</h1>
                  <span className="badge badge-success tiny">
                    {t('online')}
                  </span>
                </div>
                <div className="tiny faint" style={{ marginTop: 2 }}>
                  {profile?.country || 'Việt Nam'} · {profile?.interests?.length || 0} {t('interestsCount')} · {t('styleLabel')}: {profile?.conversation_style || 'Tự do'}
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                className="btn-icon"
                title="Đăng xuất"
                type="submit"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>

          {/* MAIN HERO ACTION: AI Matching Radar Banner with Looping Anime/Cyberpunk Visual */}
          <Link href="/match" style={{ textDecoration: 'none' }}>
            <div
              className="card card-interactive"
              style={{
                background: 'linear-gradient(135deg, rgba(28, 22, 38, 0.96) 0%, rgba(14, 11, 19, 0.98) 100%)',
                border: '1px solid var(--gold-hairline-strong)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 16
              }}
            >
              {/* Background Aesthetic Subtle GIF */}
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '45%',
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

              <div className="flex justify-between items-start" style={{ marginBottom: 14, position: 'relative', zIndex: 2 }}>
                <div className="flex items-center g8">
                  <img src="/logo.png" alt="Logo" style={{ width: 22, height: 22, borderRadius: 6 }} />
                  <span className="badge badge-gold tiny">
                    <Zap size={11} /> AI MATCHING RADAR
                  </span>
                </div>
                <div 
                  style={{ 
                    width: 34, 
                    height: 34, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--gold-hairline)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--kinpaku-gold)'
                  }} 
                >
                  <ArrowUpRight size={17} />
                </div>
              </div>

              <div style={{ marginBottom: 14, position: 'relative', zIndex: 2 }}>
                <h2 className="rm-title" style={{ fontSize: 22, marginBottom: 6 }}>
                  {t('matchBannerTitle')}
                </h2>
                <p className="small muted" style={{ lineHeight: 1.55, maxWidth: 460 }}>
                  {t('matchBannerSub')}
                </p>
              </div>

              <div className="flex items-center g8 tiny bold gold" style={{ position: 'relative', zIndex: 2 }}>
                <Compass size={15} /> {t('startScan')} <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* TRUST SCORE & REFERRAL METER (2-Col Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Trust Engine Card */}
            <div className="card" style={{ padding: 18 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                <div className="flex items-center g6 tiny faint">
                  <ShieldCheck size={14} style={{ color: 'var(--emerald-patina)' }} />
                  {t('trustEngine')}
                </div>
                <span className="badge badge-gold tiny">
                  <Award size={11} /> {tier.name}
                </span>
              </div>

              <div className="flex items-end justify-between" style={{ marginBottom: 8 }}>
                <div className="rm-num bold" style={{ fontSize: 28, color: 'var(--kinpaku-gold)', lineHeight: 1 }}>
                  {score} <span className="tiny faint">PTS</span>
                </div>
                {next && (
                  <div className="tiny faint">
                    {t('neededToRank')} <b className="champagne">{next.needed}</b> {t('ptsToRank')} <b className="gold">{next.label}</b>
                  </div>
                )}
              </div>

              {next && (
                <div className="compat-bar-track">
                  <div 
                    className="compat-bar-fill" 
                    style={{ transform: `scaleX(${Math.min(1, score / (score + next.needed))})` }} 
                  />
                </div>
              )}
            </div>

            {/* Referral Card */}
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div className="card card-interactive" style={{ padding: 18, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                  <span className="badge badge-gold tiny">
                    <Gift size={11} /> {t('referralTitle')}
                  </span>
                  <span className="tiny bold gold">+100 Trust →</span>
                </div>
                <div className="semi small champagne" style={{ marginBottom: 2 }}>
                  {t('referralSub')}
                </div>
                <div className="tiny faint">
                  {t('referralProgress')}: <b className="champagne">{referrals}/10</b>
                </div>
              </div>
            </Link>
          </div>

          {/* VIBRANT ECOSYSTEM MEDIA TILES (RanVideo, RanNews, RanWorld) */}
          <div>
            <div className="tiny faint" style={{ marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('ecosystemTitle')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {/* RanVideo Card with Animated GIF Thumbnail */}
              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 14,
                    height: 180,
                    position: 'relative'
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JldmhzYWRlZHRrOXB1czVlbm1xcmR2eHBoNTNyMGx1c2o3eW1xZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kigKjAJryWTZK/giphy.gif" 
                    alt="RanVideo Vibe" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 14, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.9) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-gold tiny"><Flame size={10} /> HOT</span>
                      <Video size={16} style={{ color: 'var(--kinpaku-gold)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 16 }}>RanVideo Cinema</div>
                      <div className="tiny faint">TikTok & Shorts Theater</div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* RanNews Card */}
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 14,
                    height: 180,
                    position: 'relative'
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" 
                    alt="RanNews Vibe" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 14, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.9) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-success tiny">MỚI</span>
                      <Newspaper size={16} style={{ color: 'var(--verdigris-patina)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 16 }}>RanNews Bảng Tin</div>
                      <div className="tiny faint">Cộng đồng & AI Dịch thuật</div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* RanWorld Card */}
              <Link href="/world" style={{ textDecoration: 'none' }}>
                <div 
                  className="card card-interactive flex col justify-between" 
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    borderRadius: 14,
                    height: 180,
                    position: 'relative'
                  }}
                >
                  <img 
                    src="https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" 
                    alt="RanWorld Vibe" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      padding: 14, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      background: 'linear-gradient(to top, rgba(10,8,14,0.9) 0%, rgba(10,8,14,0.2) 60%, transparent 100%)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="badge badge-success tiny">LIVE</span>
                      <Globe2 size={16} style={{ color: 'var(--emerald-patina)' }} />
                    </div>
                    <div>
                      <div className="semi champagne" style={{ fontSize: 16 }}>RanWorld Âm Thanh</div>
                      <div className="tiny faint">Spatial Voice Lounges</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR WIDGETS */}
        <div className="flex col g20">
          {/* Voice Lounge Widget */}
          <div className="card" style={{ padding: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div className="flex items-center g8">
                <Radio size={15} style={{ color: 'var(--emerald-patina)' }} />
                <span className="semi small champagne">{t('voiceLive')}</span>
              </div>
              <Link href="/world" className="tiny bold gold">{t('viewAll')}</Link>
            </div>

            <div className="flex col g8">
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                <div className="semi small champagne">Minecraft Builders ⛏️</div>
                <div className="flex items-center justify-between tiny faint" style={{ marginTop: 4 }}>
                  <span>148 thành viên</span>
                  <span className="badge badge-success tiny" style={{ padding: '1px 6px', fontSize: 10 }}>Voice</span>
                </div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                <div className="semi small champagne">Anime Lo-Fi Lounge ✨</div>
                <div className="flex items-center justify-between tiny faint" style={{ marginTop: 4 }}>
                  <span>112 thành viên</span>
                  <span className="badge badge-gold tiny" style={{ padding: '1px 6px', fontSize: 10 }}>Stage</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Official RanMet Safety Badge */}
          <div className="card" style={{ padding: 18, background: 'var(--lacquer-deep)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 8 }}>
              <ShieldCheck size={16} style={{ color: 'var(--kinpaku-gold)' }} />
              <span className="semi small champagne">Bảo Vệ & An Toàn RanMet</span>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.55, marginBottom: 10 }}>
              Không gian tương tác an toàn với bộ lọc AI Vision & Gemini Guard thế hệ mới.
            </p>
            <div className="tiny faint center-text" style={{ paddingTop: 8, borderTop: '1px solid var(--gold-hairline)' }}>
              RanMet Official Platform
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
