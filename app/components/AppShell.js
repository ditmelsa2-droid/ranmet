'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Compass, Video, Globe, User, Zap, 
  LogOut, ShieldCheck, Sparkles, MessageSquare, Newspaper, DollarSign
} from 'lucide-react'

export default function AppShell({ children, userProfile, trustScore }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', label: 'Trang chủ', icon: Home },
    { href: '/chats', label: 'Tin nhắn', icon: MessageSquare, badge: 'Live' },
    { href: '/news', label: 'RanNews', icon: Newspaper, badge: 'New' },
    { href: '/videos', label: 'RanVideo', icon: Video, badge: 'Hot' },
    { href: '/match', label: 'Ghép đôi', icon: Compass },
    { href: '/world', label: 'RanWorld', icon: Globe },
    { href: '/creator', label: 'Creator Studio', icon: DollarSign, badge: 'Kiếm tiền' },
    { href: '/profile', label: 'Hồ sơ', icon: User },
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
          <Link href="/home" className="flex items-center g10" style={{ textDecoration: 'none', marginBottom: 20 }}>
            <div className="rm-logo" style={{ fontSize: 24 }}>
              <Zap size={24} style={{ color: '#ec4899' }} /> RanMet
            </div>
            <span className="badge tiny" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontSize: 10 }}>
              v1.0
            </span>
          </Link>

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
                  {userProfile?.display_name || 'Hồ sơ cá nhân'}
                </div>
                <div className="tiny faint" style={{ fontSize: 11 }}>Xem & sửa hồ sơ</div>
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
          <span>Trang chủ</span>
        </Link>
        <Link href="/news" className={`mobile-nav-item ${pathname.startsWith('/news') ? 'active' : ''}`}>
          <Newspaper size={19} />
          <span>RanNews</span>
        </Link>
        <Link href="/match" className={`mobile-nav-item ${pathname.startsWith('/match') ? 'active' : ''}`}>
          <Compass size={19} />
          <span>Ghép đôi</span>
        </Link>
        <Link href="/chats" className={`mobile-nav-item ${pathname.startsWith('/chats') ? 'active' : ''}`}>
          <MessageSquare size={19} />
          <span>Tin nhắn</span>
        </Link>
        <Link href="/profile" className={`mobile-nav-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
          <User size={19} />
          <span>Hồ sơ</span>
        </Link>
      </nav>
    </div>
  )
}
