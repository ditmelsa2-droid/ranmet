'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap, Video, Globe2, Compass } from 'lucide-react'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: 960,
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 60px -10px rgba(168, 85, 247, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* LEFT BRAND SHOWCASE PANEL */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(28, 18, 48, 0.95) 0%, rgba(14, 10, 24, 0.98) 100%)',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <div className="rm-logo" style={{ fontSize: 32, marginBottom: 8 }}>
              <Zap size={30} style={{ color: '#ec4899' }} /> RanMet
            </div>
            <div className="tiny muted flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
              <Sparkles size={13} style={{ color: '#a855f7' }} />
              Connect · Create · Inspire
            </div>

            <h2 className="rm-title" style={{ fontSize: 24, lineHeight: 1.35, marginBottom: 14, color: '#fff' }}>
              Tham Gia Cộng Đồng RanMet Ngay Hôm Nay
            </h2>
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 32 }}>
              Khởi tạo hồ sơ, nhận ngay 100 điểm Trust khởi đầu và trải nghiệm ngay không gian mạng xã hội thế hệ mới.
            </p>

            <div className="flex col g12">
              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={18} style={{ color: '#ec4899' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>AI Matching Đa Chiều</div>
                  <div className="tiny faint">Kết nối theo sở thích & phong cách</div>
                </div>
              </div>

              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} style={{ color: '#f43f5e' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>RanVideo Sáng Tạo</div>
                  <div className="tiny faint">Lướt video ngắn đa chủ đề</div>
                </div>
              </div>

              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe2 size={18} style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>RanWorld Voice Lounges</div>
                  <div className="tiny faint">Hàng chục phòng cộng đồng sôi nổi</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center g8 tiny faint" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Miễn phí 100% · Không chứa quảng cáo rác</span>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 className="rm-title" style={{ fontSize: 26, marginBottom: 8, color: '#fff' }}>Tạo tài khoản</h1>
            <p className="small muted">Chỉ mất 30 giây để bắt đầu hành trình kết nối</p>
          </div>

          <form action={formAction} className="flex col g18">
            <div className="field-group">
              <label className="field-label">
                <Mail size={14} /> Email của bạn
              </label>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="ban@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                <Lock size={14} /> Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <input
                className="input"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {state?.error && (
              <div className="err-text">
                {state.error}
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={pending}
              style={{ marginTop: 10, padding: 15 }}
            >
              {pending ? (
                <>Đang khởi tạo tài khoản...</>
              ) : (
                <>
                  Tạo tài khoản ngay <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Login */}
          <div className="center-text small muted" style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: '#c084fc', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
