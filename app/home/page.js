import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, Lock, ArrowUpRight, Zap, Award, Home, MessageSquare, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { logoutAction } from './actions'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: trust }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
  ])

  const score = trust?.score ?? 100
  const tier = trustTier(score)
  const next = nextTierInfo(score)
  const name = profile?.display_name || 'Bạn mới'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="rm-shell">
      <div className="rm-page flex col g20">
        {/* Top Navigation / User Profile Header */}
        <div className="flex items-center justify-between" style={{ paddingTop: 8 }}>
          <div className="flex items-center g12">
            <div
              className="avatar"
              style={{
                width: 46,
                height: 46,
                fontSize: 18,
                background: 'var(--brand-gradient)',
              }}
            >
              {initial}
            </div>
            <div>
              <div className="flex items-center g6">
                <span className="bold" style={{ fontSize: 17 }}>{name}</span>
                <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                  Online
                </span>
              </div>
              <div className="tiny muted">{profile?.country || 'Việt Nam'} · {profile?.interests?.length || 3} sở thích</div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              className="btn-icon"
              title="Đăng xuất"
              type="submit"
            >
              <LogOut size={17} style={{ color: 'var(--text-muted)' }} />
            </button>
          </form>
        </div>

        {/* Trust Score Hero Card */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(26, 20, 48, 0.9) 0%, rgba(16, 13, 28, 0.95) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            boxShadow: '0 12px 32px -8px rgba(168, 85, 247, 0.25)'
          }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <div className="flex items-center g6 tiny faint" style={{ letterSpacing: '0.06em' }}>
              <ShieldCheck size={14} style={{ color: tier.color }} />
              HỆ THỐNG ĐIỂM TIN CẬY (TRUST ENGINE)
            </div>
            <div className="badge badge-glow" style={{ color: tier.color, borderColor: tier.color }}>
              <Award size={12} /> {tier.name}
            </div>
          </div>

          <div className="flex items-end justify-between" style={{ marginBottom: 14 }}>
            <div>
              <div className="rm-num bold" style={{ fontSize: 36, color: tier.color, lineHeight: 1 }}>
                {score}
              </div>
              <div className="tiny muted" style={{ marginTop: 4 }}>
                {score >= 200 ? 'Hồ sơ uy tín cao, ưu tiên ghép đôi' : 'Tương tác lịch sự để tăng điểm Trust'}
              </div>
            </div>

            {next && (
              <div className="tiny faint center-text" style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 10 }}>
                Cần <b style={{ color: '#fff' }}>{next.needed}</b> điểm để lên <b style={{ color: '#ec4899' }}>{next.label}</b>
              </div>
            )}
          </div>

          {/* Progress to next tier */}
          {next && (
            <div className="compat-bar-track" style={{ height: 6 }}>
              <div 
                className="compat-bar-fill" 
                style={{ 
                  width: `${Math.min(100, (score / (score + next.needed)) * 100)}%`,
                  background: 'var(--brand-gradient)'
                }} 
              />
            </div>
          )}
        </div>

        {/* MAIN ACTION: Random Match Card */}
        <Link href="/match">
          <div
            className="card card-interactive"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.28) 50%, rgba(6, 182, 212, 0.18) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.45)',
              boxShadow: '0 16px 40px -10px rgba(236, 72, 153, 0.38)',
              padding: 24,
              overflow: 'hidden',
            }}
          >
            <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
              <div className="badge" style={{ background: 'rgba(236, 72, 153, 0.28)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                <Zap size={12} style={{ color: '#facc15' }} /> RANCHAT · AI MATCHING
              </div>
              <div 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.12)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <ArrowUpRight size={18} style={{ color: '#fff' }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <h2 className="rm-title" style={{ fontSize: 24, marginBottom: 6, color: '#fff' }}>
                Ghép ngẫu nhiên ngay
              </h2>
              <p className="small" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.45 }}>
                Thuật toán AI tự động tìm người phù hợp nhất dựa trên sở thích và phong cách trò chuyện.
              </p>
            </div>

            <div className="flex items-center g8 tiny bold" style={{ color: '#fbcfe8', marginTop: 16 }}>
              <Compass size={16} /> Bắt đầu tìm kiếm người lạ có gu ✨
            </div>
          </div>
        </Link>

        {/* Feature Ecosystem Grid (RanVideo, RanWorld, Secret Chat) */}
        <div>
          <div className="tiny faint" style={{ marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Hệ sinh thái RanMet
          </div>
          <div className="flex col g12">
            <div className="card flex items-center justify-between" style={{ opacity: 0.75 }}>
              <div className="flex items-center g12">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} style={{ color: '#f43f5e' }} />
                </div>
                <div>
                  <div className="semi small">RanVideo</div>
                  <div className="tiny faint">Lướt video ngắn sáng tạo</div>
                </div>
              </div>
              <span className="badge tiny" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)' }}>Sắp ra mắt</span>
            </div>

            <div className="card flex items-center justify-between" style={{ opacity: 0.75 }}>
              <div className="flex items-center g12">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe2 size={18} style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <div className="semi small">RanWorld</div>
                  <div className="tiny faint">Phòng cộng đồng theo chủ đề</div>
                </div>
              </div>
              <span className="badge tiny" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)' }}>Sắp ra mắt</span>
            </div>

            <div className="card flex items-center justify-between" style={{ opacity: 0.75 }}>
              <div className="flex items-center g12">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <div className="semi small">Chat Bí Mật E2E</div>
                  <div className="tiny faint">Mã hóa đầu cuối bảo mật tuyệt đối</div>
                </div>
              </div>
              <span className="badge tiny" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)' }}>Sắp ra mắt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock Navigation Bar */}
      <div className="bottom-nav">
        <Link href="/home" className="nav-item active">
          <Home size={20} className="nav-icon" />
          <span>Trang chủ</span>
        </Link>
        <Link href="/match" className="nav-item">
          <Compass size={20} className="nav-icon" />
          <span>Ghép đôi</span>
        </Link>
        <Link href="/onboarding" className="nav-item">
          <User size={20} className="nav-icon" />
          <span>Hồ sơ</span>
        </Link>
      </div>
    </div>
  )
}
