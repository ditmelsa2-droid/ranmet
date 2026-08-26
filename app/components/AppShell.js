'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, Video, Globe, User, Zap, 
  ShieldCheck, MessageSquare, Newspaper, DollarSign,
  Languages, Flame, Sparkles
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AppShell({ children, userProfile, trustScore }) {
  const pathname = usePathname()
  const { lang, setLang, t, supportedLanguages } = useLanguage()

  const navItems = [
    { href: '/home', label: '01 // TRANG CHỦ', shortLabel: 'Home', icon: Home },
    { href: '/videos', label: '02 // RANVIDEO', shortLabel: 'Videos', icon: Video, badge: 'HOT' },
    { href: '/news', label: '03 // RANNEWS', shortLabel: 'News', icon: Newspaper, badge: 'MỚI' },
    { href: '/match', label: '04 // AI RADAR', shortLabel: 'Radar', icon: Compass },
    { href: '/world', label: '05 // RANWORLD', shortLabel: 'World', icon: Globe },
    { href: '/creator', label: '06 // CREATOR', shortLabel: 'Studio', icon: DollarSign, badge: 'EARN' },
    { href: '/chats', label: '07 // TIN NHẮN', shortLabel: 'Chats', icon: MessageSquare, badge: 'LIVE' },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ln-black)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. FLOATING LANDO NORRIS CINEMATIC TOP HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6, 6, 8, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        {/* Left: Brand Logo + Telemetry Tag */}
        <div className="flex items-center g12">
          <Link href="/home" className="flex items-center g10" style={{ textDecoration: 'none' }}>
            <div 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                overflow: 'hidden',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--brand-aurora-glow)',
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
            <div className="flex col">
              <span className="rm-title bold" style={{ fontSize: 18, letterSpacing: '0.12em', color: '#ffffff' }}>
                RANMET
              </span>
              <span className="tiny faint rm-num" style={{ fontSize: 9.5, letterSpacing: '0.08em' }}>
                HIGH-OCTANE // SOCIAL
              </span>
            </div>
          </Link>

          <div className="telemetry-item" style={{ display: 'none', md: 'inline-flex' }}>
            <span className="telemetry-dot" />
            <span className="badge badge-lime tiny">F1 ENGINE</span>
          </div>
        </div>

        {/* Center: High-Fashion Horizontal Capsule Navigation */}
        <nav 
          className="subtab-bar" 
          style={{ 
            maxWidth: '100%', 
            padding: '4px 8px', 
            background: 'rgba(14, 14, 20, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`subtab-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', padding: '6px 14px', fontSize: 12.5 }}
              >
                <Icon size={14} style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
                {item.badge && (
                  <span 
                    className="badge tiny" 
                    style={{ 
                      fontSize: 9, 
                      padding: '1px 5px',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(210, 255, 0, 0.15)',
                      color: isActive ? '#ffffff' : 'var(--ln-lime)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Language Selector + Trust Badge + User Avatar */}
        <div className="flex items-center g12">
          {/* Language Switcher */}
          <div className="flex items-center g4" style={{ background: 'var(--ln-dark-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 8px' }}>
            <Languages size={13} style={{ color: 'var(--kinpaku-gold)' }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--champagne)',
                border: 'none',
                fontSize: 11.5,
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Chuyển đổi ngôn ngữ / Global Language"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#0a0a0f', color: '#fff' }}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Trust & Profile Capsule */}
          <Link 
            href="/profile" 
            className="card-glass flex items-center g8" 
            style={{ 
              textDecoration: 'none', 
              padding: '4px 12px 4px 6px', 
              borderRadius: 20,
              border: '1px solid var(--gold-hairline-strong)',
              transition: 'transform 0.2s ease'
            }}
          >
            <div
              className="avatar"
              style={{
                width: 28,
                height: 28,
                fontSize: 11,
                border: '1.5px solid var(--kinpaku-gold)'
              }}
            >
              {(userProfile?.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex col">
              <span className="semi champagne" style={{ fontSize: 12, lineHeight: 1.1 }}>
                {userProfile?.display_name || 'Hồ sơ'}
              </span>
              <span className="gold rm-num tiny bold" style={{ fontSize: 10 }}>
                {trustScore || 100} PTS
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* 2. FULL-WIDTH CANVAS CONTENT (NO RESTRICTIVE SIDEBAR) */}
      <main style={{ flex: '1 1 0%', padding: '24px 28px 60px', width: '100%', maxWidth: 1440, margin: '0 auto' }}>
        {children}
      </main>

      {/* 3. MOBILE FLOATING CAPSULE DOCK */}
      <nav className="mobile-dock">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-dock-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.shortLabel}</span>
            </Link>
          )
        })}
        <Link
          href="/profile"
          className={`mobile-dock-btn ${pathname.startsWith('/profile') ? 'active' : ''}`}
        >
          <User size={18} />
          <span>Hồ sơ</span>
        </Link>
      </nav>

    </div>
  )
}
