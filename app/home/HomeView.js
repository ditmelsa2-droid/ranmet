'use client'

import Link from 'next/link'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, ArrowUpRight, Zap, Award, ArrowRight, Radio, Newspaper, Gift
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
      <div className="desktop-grid-2">
        {/* MAIN COLUMN */}
        <div className="flex col g24">
          {/* Top User Greeting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center g14">
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div
                  className="avatar"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    cursor: 'pointer'
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

          {/* MAIN HERO ACTION: AI Matching Radar Console */}
          <Link href="/match" style={{ textDecoration: 'none' }}>
            <div
              className="card card-interactive"
              style={{
                background: 'linear-gradient(135deg, rgba(28, 22, 36, 0.95) 0%, rgba(16, 13, 22, 0.98) 100%)',
                border: '1px solid var(--gold-hairline-strong)',
                padding: '28px 26px',
                overflow: 'hidden',
              }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
                <div className="badge badge-gold tiny">
                  <Zap size={13} /> RANCHAT · AI RADAR
                </div>
                <div 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 8, 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    border: '1px solid var(--gold-hairline)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--kinpaku-gold)'
                  }} 
                >
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h2 className="rm-title" style={{ fontSize: 24, marginBottom: 8 }}>
                  {t('matchBannerTitle')}
                </h2>
                <p className="small muted" style={{ lineHeight: 1.6, maxWidth: 540 }}>
                  {t('matchBannerSub')}
                </p>
              </div>

              <div className="flex items-center g8 tiny bold gold">
                <Compass size={16} /> {t('startScan')} <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* TRUST SCORE & REFERRAL METER (Asymmetric 2-Col Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Trust Engine Card */}
            <div className="card" style={{ padding: 20 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <div className="flex items-center g6 tiny faint">
                  <ShieldCheck size={15} style={{ color: 'var(--emerald-patina)' }} />
                  {t('trustEngine')}
                </div>
                <span className="badge badge-gold tiny">
                  <Award size={12} /> {tier.name}
                </span>
              </div>

              <div className="flex items-end justify-between" style={{ marginBottom: 10 }}>
                <div className="rm-num bold" style={{ fontSize: 32, color: 'var(--kinpaku-gold)', lineHeight: 1 }}>
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
                    style={{ width: `${Math.min(100, (score / (score + next.needed)) * 100)}%` }} 
                  />
                </div>
              )}
            </div>

            {/* Referral Card */}
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div className="card card-interactive" style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                  <span className="badge badge-patina tiny">
                    <Gift size={12} /> {t('referralTitle')}
                  </span>
                  <span className="tiny bold gold">+100 Trust →</span>
                </div>
                <div className="semi small champagne" style={{ marginBottom: 4 }}>
                  {t('referralSub')}
                </div>
                <div className="tiny faint">
                  {t('referralProgress')}: <b className="champagne">{referrals}/10</b>
                </div>
              </div>
            </Link>
          </div>

          {/* ECOSYSTEM ACCESS (RanNews, RanVideo, RanWorld) */}
          <div>
            <div className="tiny faint" style={{ marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('ecosystemTitle')}
            </div>
            <div className="flex col g12">
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 16 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--patina-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={20} style={{ color: 'var(--verdigris-patina)' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi champagne" style={{ fontSize: 15 }}>RanNews</span>
                        <span className="badge badge-patina tiny" style={{ fontSize: 9 }}>MỚI</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>{t('news')}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>

              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 16 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 192, 66, 0.1)', border: '1px solid var(--gold-hairline-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={20} style={{ color: 'var(--kinpaku-gold)' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi champagne" style={{ fontSize: 15 }}>RanVideo</span>
                        <span className="badge badge-gold tiny" style={{ fontSize: 9 }}>HOT</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>{t('videos')}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>

              <Link href="/world" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 16 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe2 size={20} style={{ color: 'var(--emerald-patina)' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi champagne" style={{ fontSize: 15 }}>RanWorld</span>
                        <span className="badge badge-success tiny" style={{ fontSize: 9 }}>LIVE</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>{t('world')}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR WIDGETS */}
        <div className="flex col g20">
          {/* Voice Lounge Widget */}
          <div className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
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
                  <span>148 members</span>
                  <span className="badge badge-success tiny" style={{ padding: '1px 6px', fontSize: 10 }}>Voice</span>
                </div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 12, background: 'var(--lacquer-deep)' }}>
                <div className="semi small champagne">Anime Lounge ✨</div>
                <div className="flex items-center justify-between tiny faint" style={{ marginTop: 4 }}>
                  <span>112 members</span>
                  <span className="badge badge-patina tiny" style={{ padding: '1px 6px', fontSize: 10 }}>Chat</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Community Standards Card */}
          <div className="card" style={{ padding: 20, background: 'var(--lacquer-deep)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 10 }}>
              <ShieldCheck size={16} style={{ color: 'var(--kinpaku-gold)' }} />
              <span className="semi small champagne">{t('communityRules')}</span>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.6, marginBottom: 12 }}>
              • {t('rule1')}<br />
              • {t('rule2')}<br />
              • {t('rule3')}
            </p>
            <div className="tiny faint center-text" style={{ paddingTop: 8, borderTop: '1px solid var(--gold-hairline)' }}>
              RanMet Social v1.0 · Impeccable Craft
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
