'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, Video, Globe, User, Zap, 
  ShieldCheck, MessageSquare, Newspaper, DollarSign,
  Languages, ChevronRight
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AppShell({ children, userProfile, trustScore }) {
  const pathname = usePathname()
  const { lang, setLang, t, supportedLanguages } = useLanguage()

  const navItems = [
    { href: '/home', label: t('home'), icon: Home },
    { href: '/chats', label: t('chats'), icon: MessageSquare, badge: t('liveBadge'), badgeType: 'live' },
    { href: '/news', label: t('news'), icon: Newspaper, badge: t('newBadge'), badgeType: 'new' },
    { href: '/videos', label: t('videos'), icon: Video, badge: t('hotBadge'), badgeType: 'hot' },
    { href: '/match', label: t('match'), icon: Compass },
    { href: '/world', label: t('world'), icon: Globe },
    { href: '/creator', label: t('creator'), icon: DollarSign, badge: t('monetizeBadge'), badgeType: 'earn' },
    { href: '/profile', label: t('profile'), icon: User },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="rm-app-layout">
      {/* Ambient background light beam */}
      <div className="bg-ambient">
        <div className="ambient-beam" />
      </div>

      {/* DESKTOP SIDEBAR (Visible on screens >= 960px) */}
      <aside className="rm-desktop-sidebar">
        <div className="flex col g20">
          {/* Brand Logo & Language Switcher */}
          <div className="flex justify-between items-center" style={{ paddingBottom: 16, borderBottom: '1px solid var(--gold-hairline)' }}>
            <Link href="/home" className="flex items-center g10" style={{ textDecoration: 'none' }}>
              <div 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 10, 
                  overflow: 'hidden',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 'var(--brand-glow)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="RanMet Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div className="rm-wordmark" style={{ fontSize: 17, letterSpacing: '0.12em', fontWeight: 800 }}>
                RANMET
              </div>
            </Link>

            {/* Language Selector */}
            <div className="flex items-center g4" style={{ background: 'var(--lacquer-deep)', border: '1px solid var(--gold-hairline)', borderRadius: 8, padding: '2px 6px' }}>
              <Languages size={12} style={{ color: 'var(--kinpaku-gold)' }} />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'var(--champagne)',
                  border: 'none',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '2px 0'
                }}
                title="Chuyển đổi ngôn ngữ / Global Language"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#120f18', color: '#fff' }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex col g4">
            <div className="tiny faint" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 8 }}>
              Điều hướng
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} style={{ color: isActive ? 'var(--kinpaku-gold)' : 'var(--text-muted)' }} />
                  <span className="grow">{item.label}</span>
                  {item.badge && (
                    <span 
                      className="badge tiny"
                      style={{ 
                        fontSize: 10,
                        padding: '1px 6px',
                        background: isActive ? 'oklch(84% 0.19 80.46 / 0.2)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? 'var(--kinpaku-gold)' : 'var(--text-muted)',
                        border: '1px solid var(--gold-hairline)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: User Trust Card & Profile */}
        <div className="flex col g12" style={{ paddingTop: 16, borderTop: '1px solid var(--gold-hairline)' }}>
          {trustScore != null && (
            <div 
              style={{ 
                padding: '12px 14px', 
                borderRadius: 10, 
                background: 'var(--lacquer-deep)',
                border: '1px solid var(--gold-hairline)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span className="tiny faint flex items-center g4">
                  <ShieldCheck size={13} style={{ color: 'var(--emerald-patina)' }} /> {t('trustScore')}
                </span>
                <span className="tiny bold rm-num" style={{ color: 'var(--kinpaku-gold)' }}>
                  {trustScore} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>PTS</span>
                </span>
              </div>
              <div className="compat-bar-track" style={{ height: 4 }}>
                <div 
                  className="compat-bar-fill" 
                  style={{ width: `${Math.min(100, (trustScore / 500) * 100)}%` }} 
                />
              </div>
            </div>
          )}

          <Link href="/profile" className="flex items-center justify-between" style={{ padding: '4px 6px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.2s ease' }}>
            <div className="flex items-center g10">
              <div
                className="avatar"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: 13,
                }}
              >
                {(userProfile?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="semi small champagne" style={{ fontSize: 13.5, lineHeight: 1.2 }}>
                  {userProfile?.display_name || t('profile')}
                </div>
                <div className="tiny faint" style={{ fontSize: 11 }}>
                  {userProfile?.country || 'Global User'}
                </div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
          </Link>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="rm-main-content">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Floating Frosted Glass) */}
      <nav className="rm-mobile-bottom-nav">
        <Link href="/home" className={`mobile-nav-item ${pathname === '/home' ? 'active' : ''}`}>
          <Home size={18} />
          <span>{t('home')}</span>
        </Link>
        <Link href="/news" className={`mobile-nav-item ${pathname.startsWith('/news') ? 'active' : ''}`}>
          <Newspaper size={18} />
          <span>{t('news')}</span>
        </Link>
        <Link href="/match" className={`mobile-nav-item ${pathname.startsWith('/match') ? 'active' : ''}`}>
          <Compass size={18} />
          <span>{t('match')}</span>
        </Link>
        <Link href="/chats" className={`mobile-nav-item ${pathname.startsWith('/chats') ? 'active' : ''}`}>
          <MessageSquare size={18} />
          <span>{t('chats')}</span>
        </Link>
        <Link href="/profile" className={`mobile-nav-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
          <User size={18} />
          <span>{t('profile')}</span>
        </Link>
      </nav>
    </div>
  )
}
