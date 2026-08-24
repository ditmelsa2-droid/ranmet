'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, Video, Globe, User, Zap, 
  LogOut, ShieldCheck, Sparkles, MessageCircle, MessageSquare
} from 'lucide-react'

export default function AppShell({ children, userProfile, trustScore }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'Trang chủ', icon: Home },
    { href: '/chats', label: 'Tin nhắn', icon: MessageSquare, badge: 'Live' },
    { href: '/videos', label: 'RanVideo', icon: Video, badge: 'Hot' },
    { href: '/match', label: 'Ghép đôi', icon: Compass },
    { href: '/world', label: 'RanWorld', icon: Globe },
    { href: '/onboarding', label: 'Hồ sơ', icon: User },
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
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center g10" style={{ textDecoration: 'none', marginBottom: 28 }}>
            <div className="rm-logo" style={{ fontSize: 24 }}>
              <Zap size={24} style={{ color: '#ec4899' }} /> RanMet
            </div>
            <span className="badge tiny" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontSize: 10 }}>
              v1.0
            </span>
          </Link>

          {/* Nav List */}
          <nav className="flex col g6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} />
                  <span className="grow">{item.label}</span>
                  {item.badge && (
                    <span 
                      className="tiny bold" 
                      style={{ 
                        fontSize: 10, 
                        padding: '2px 6px', 
                        borderRadius: 6, 
                        background: item.badge === 'Hot' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: item.badge === 'Hot' ? '#fb7185' : '#34d399'
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
        <div className="flex col g12">
          {trustScore != null && (
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: 14, 
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span className="tiny faint flex items-center g4">
                  <ShieldCheck size={12} style={{ color: '#10b981' }} /> Trust Score
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
            <div className="flex items-center g10">
              <div
                className="avatar"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  background: 'var(--brand-gradient)',
                }}
              >
                {(userProfile?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="semi small" style={{ fontSize: 13.5, lineHeight: 1.2 }}>
                  {userProfile?.display_name || 'Người dùng'}
                </div>
                <div className="tiny faint" style={{ fontSize: 11 }}>Trực tuyến</div>
              </div>
            </div>

            <Link href="/login" className="btn-icon" style={{ width: 34, height: 34 }} title="Tài khoản">
              <User size={15} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="rm-main-content">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Visible on screens < 960px) */}
      <nav className="rm-mobile-bottom-nav">
        {navItems.filter(i => i.href !== '/onboarding').map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <Link
          href="/onboarding"
          className={`mobile-nav-item ${pathname === '/onboarding' ? 'active' : ''}`}
        >
          <User size={19} />
          <span>Hồ sơ</span>
        </Link>
      </nav>
    </div>
  )
}
