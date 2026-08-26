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
    { href: '/home', label: 'TRANG CHỦ', shortLabel: 'Home', icon: Home },
    { href: '/videos', label: 'RANVIDEO', shortLabel: 'Videos', icon: Video, badge: 'HOT' },
    { href: '/news', label: 'RANNEWS', shortLabel: 'News', icon: Newspaper, badge: 'MỚI' },
    { href: '/match', label: 'AI RADAR', shortLabel: 'Radar', icon: Compass },
    { href: '/world', label: 'RANWORLD', shortLabel: 'World', icon: Globe },
    { href: '/creator', label: 'CREATOR', shortLabel: 'Studio', icon: DollarSign, badge: 'EARN' },
    { href: '/chats', label: 'TIN NHẮN', shortLabel: 'Chats', icon: MessageSquare, badge: 'LIVE' },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ln-black)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. ULTRA-SLEEK TOP NAVIGATION (Lando Norris Minimalist Luxury) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6, 6, 8, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div 
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          {/* Brand Identity */}
          <Link href="/home" className="flex items-center g12" style={{ textDecoration: 'none' }}>
            <div 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 10, 
                overflow: 'hidden',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--brand-aurora-glow)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}
            >
              <img 
                src="/logo.png" 
                alt="RanMet Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div className="flex items-center g8">
              <span className="rm-title bold" style={{ fontSize: 20, letterSpacing: '0.08em', color: '#ffffff' }}>
                RANMET
              </span>
              <span className="badge badge-lime" style={{ fontSize: 9.5, padding: '2px 6px' }}>
                LIVE
              </span>
            </div>
          </Link>

          {/* Minimalist Desktop Navigation Links */}
          <nav 
            className="flex items-center g6"
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: 14,
              padding: '4px 8px'
            }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`subtab-btn ${isActive ? 'active-lime' : ''}`}
                  style={{ 
                    textDecoration: 'none', 
                    padding: '7px 14px', 
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span 
                      className="badge tiny" 
                      style={{ 
                        fontSize: 8.5, 
                        padding: '1px 5px',
                        background: isActive ? 'rgba(0,0,0,0.8)' : 'rgba(210, 255, 0, 0.15)',
                        color: isActive ? 'var(--ln-lime)' : 'var(--ln-lime)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: Language + User Profile Capsule */}
          <div className="flex items-center g14">
            {/* Language Switcher */}
            <div className="flex items-center g4" style={{ background: 'var(--ln-dark-2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px' }}>
              <Languages size={13} style={{ color: 'var(--ln-lime)' }} />
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
                title="Ngôn ngữ"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#0a0a0f', color: '#fff' }}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Capsule */}
            <Link 
              href="/profile" 
              className="card-glass flex items-center g8" 
              style={{ 
                textDecoration: 'none', 
                padding: '4px 12px 4px 6px', 
                borderRadius: 20,
                border: '1px solid var(--gold-hairline-strong)',
                transition: 'all 0.2s ease'
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
        </div>
      </header>

      {/* 2. FULL-WIDTH CANVAS CONTENT */}
      <main style={{ flex: '1 1 0%', width: '100%' }}>
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
