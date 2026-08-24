'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap, Video, Globe2, Compass } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

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
        {/* LEFT BRAND SHOWCASE PANEL (Desktop & Tablet) */}
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
              Không Gian Kết Nối & Mạng Xã Hội Thế Hệ Mới
            </h2>
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 32 }}>
              Khám phá bạn bè cùng sở thích bằng thuật toán AI Matching thông minh, trải nghiệm video ngắn RanVideo và tham gia các phòng cộng đồng RanWorld sôi động.
            </p>

            {/* Feature Highlights Grid */}
            <div className="flex col g12">
              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={18} style={{ color: '#ec4899' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>AI Matching Radar</div>
                  <div className="tiny faint">Ghép ngẫu nhiên người có cùng gu</div>
                </div>
              </div>

              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} style={{ color: '#f43f5e' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>RanVideo Short-form</div>
                  <div className="tiny faint">Lướt video, thả tim & bình luận</div>
                </div>
              </div>

              <div className="flex items-center g12" style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe2 size={18} style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <div className="semi small" style={{ color: '#fff' }}>RanWorld Lounges</div>
                  <div className="tiny faint">Phòng Voice & Thảo luận chủ đề</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center g8 tiny faint" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Hệ thống bảo vệ bởi Trust Engine & Supabase RLS</span>
          </div>
        </div>

        {/* RIGHT AUTH FORM PANEL */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 className="rm-title" style={{ fontSize: 26, marginBottom: 8, color: '#fff' }}>Đăng nhập</h1>
            <p className="small muted">Nhập email và mật khẩu của bạn để vào RanMet</p>
          </div>

          <form action={formAction} className="flex col g18">
            <div className="field-group">
              <label className="field-label">
                <Mail size={14} /> Email tài khoản
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
                <Lock size={14} /> Mật khẩu
              </label>
              <input
                className="input"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
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
                <>Đang xác thực...</>
              ) : (
                <>
                  Đăng nhập ngay <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Register */}
          <div className="center-text small muted" style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: '#c084fc', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
