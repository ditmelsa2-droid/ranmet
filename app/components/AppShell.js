'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, Video, Globe, User, Zap, 
  LogOut, ShieldCheck, Sparkles, MessageSquare, Newspaper, DollarSign,
  Languages
} from 'lucide-react'
import { TRANSLATIONS, detectBrowserLanguage } from '@/lib/i18n'

export default function AppShell({ children, userProfile, trustScore }) {
  const pathname = usePathname()
  const [lang, setLang] = useState('vi')

  useEffect(() => {
    // Auto-detect browser language or load from localStorage
    const saved = localStorage.getItem('ranmet_lang')
    if (saved && TRANSLATIONS[saved]) {
      setLang(saved)
    } else {
      const detected = detectBrowserLanguage()
      setLang(detected)
      localStorage.setItem('ranmet_lang', detected)
    }
  }, [])

  function handleLanguageChange(newLang) {
    setLang(newLang)
    localStorage.setItem('ranmet_lang', newLang)
  }

  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi

  const navItems = [
    { href: '/home', label: t.home, icon: Home },
    { href: '/chats', label: t.chats, icon: MessageSquare, badge: 'Live' },
    { href: '/news', label: t.news, icon: Newspaper, badge: 'New' },
    { href: '/videos', label: t.videos, icon: Video, badge: 'Hot' },
    { href: '/match', label: t.match, icon: Compass },
    { href: '/world', label: t.world, icon: Globe },
    { href: '/creator', label: t.creator, icon: DollarSign, badge: 'Kiếm tiền' },
    { href: '/profile', label: t.profile, icon: User },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="rm-app-layout">
      {/* DESKTOP SIDEBAR (Visible on screens >= 960px) */}
      <aside className="rm-desktop-sidebar">
        <div>
          {/* Brand Logo & Language Switcher */}
          <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
            <Link href="/home" className="flex items-center g10" style={{ textDecoration: 'none' }}>
              <div className="rm-logo" style={{ fontSize: 24 }}>
                <Zap size={24} style={{ color: '#ec4899' }} /> RanMet
              </div>
              <span className="badge tiny" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontSize: 10 }}>
                v1.0
              </span>
            </Link>

            {/* Language Dropdown Selector */}
            <select
              value={lang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '3px 6px',
                fontSize: 11,
                cursor: 'pointer'
              }}
              title="Chuyển đổi ngôn ngữ / Language"
            >
              <option value="vi" style={{ background: '#161320' }}>🇻🇳 VI</option>
              <option value="en" style={{ background: '#161320' }}>🇺🇸 EN</option>
              <option value="ja" style={{ background: '#161320' }}>🇯🇵 JA</option>
              <option value="ko" style={{ background: '#161320' }}>🇰🇷 KO</option>
            </select>
          </div>

          {/* Nav List */}
          <nav className="flex col g4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span className="grow">{item.label}</span>
                  {item.badge && (
                    <span 
                      className="tiny bold" 
                      style={{ 
                        fontSize: 10, 
                        padding: '1px 6px', 
                        borderRadius: 6, 
                        background: item.badge === 'Hot' ? 'rgba(244, 63, 94, 0.2)' : item.badge === 'Kiếm tiền' ? 'rgba(245, 158, 11, 0.2)' : item.badge === 'New' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: item.badge === 'Hot' ? '#fb7185' : item.badge === 'Kiếm tiền' ? '#f59e0b' : item.badge === 'New' ? '#22d3ee' : '#34d399'
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

        {/* Bottom Sidebar: User & Trust mini-card */}
        <div className="flex col g10">
          {trustScore != null && (
            <div 
              style={{ 
                padding: '12px 14px', 
                borderRadius: 14, 
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span className="tiny faint flex items-center g4">
                  <ShieldCheck size={12} style={{ color: '#10b981' }} /> {t.trustScore}
                </span>
                <span className="tiny bold rm-num" style={{ color: '#ec4899' }}>
                  {trustScore} pts
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

          <div className="flex items-center justify-between" style={{ padding: '0 4px' }}>
            <Link href="/profile" className="flex items-center g10" style={{ textDecoration: 'none' }}>
              <div
                className="avatar"
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  background: 'var(--brand-gradient)',
                }}
              >
                {(userProfile?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="semi small" style={{ fontSize: 13.5, lineHeight: 1.2, color: '#fff' }}>
                  {userProfile?.display_name || t.profile}
                </div>
                <div className="tiny faint" style={{ fontSize: 11 }}>{t.saveProfile}</div>
              </div>
            </Link>

            <Link href="/profile" className="btn-icon" style={{ width: 34, height: 34 }} title="Hồ sơ">
              <User size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="rm-main-content">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <nav className="rm-mobile-bottom-nav">
        <Link href="/home" className={`mobile-nav-item ${pathname === '/home' ? 'active' : ''}`}>
          <Home size={19} />
          <span>{t.home}</span>
        </Link>
        <Link href="/news" className={`mobile-nav-item ${pathname.startsWith('/news') ? 'active' : ''}`}>
          <Newspaper size={19} />
          <span>{t.news}</span>
        </Link>
        <Link href="/match" className={`mobile-nav-item ${pathname.startsWith('/match') ? 'active' : ''}`}>
          <Compass size={19} />
          <span>{t.match}</span>
        </Link>
        <Link href="/chats" className={`mobile-nav-item ${pathname.startsWith('/chats') ? 'active' : ''}`}>
          <MessageSquare size={19} />
          <span>{t.chats}</span>
        </Link>
        <Link href="/profile" className={`mobile-nav-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
          <User size={19} />
          <span>{t.profile}</span>
        </Link>
      </nav>
    </div>
  )
}
