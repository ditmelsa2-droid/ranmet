'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap, Video, Globe2, Compass } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--lacquer-black)' }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: 920,
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.85)',
          border: '1px solid var(--gold-hairline-strong)'
        }}
      >
        {/* LEFT BRAND SHOWCASE PANEL */}
        <div 
          style={{
            background: 'var(--raised-lacquer)',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--gold-hairline)'
          }}
        >
          <div>
            <div className="flex items-center g10" style={{ marginBottom: 12 }}>
              <img src="/logo.png" alt="RanMet Logo" style={{ width: 42, height: 42, borderRadius: 12, boxShadow: 'var(--brand-glow)' }} />
              <div className="rm-wordmark" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.1em' }}>
                RANMET
              </div>
            </div>
            <div className="tiny faint flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              <Sparkles size={12} style={{ color: 'var(--kinpaku-gold)' }} />
              CONNECT · DISCOVER · INSPIRE
            </div>

            <h2 className="rm-title" style={{ fontSize: 20, lineHeight: 1.35, marginBottom: 10 }}>
              Không Gian Kết Nối & Mạng Xã Hội Thế Hệ Mới
            </h2>
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 24 }}>
              Khám phá bạn bè cùng sở thích bằng thuật toán AI Matching thông minh, trải nghiệm video ngắn RanVideo và tham gia các phòng cộng đồng RanWorld sôi động.
            </p>

            {/* Feature Highlights Grid */}
            <div className="flex col g10">
              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(245, 192, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kinpaku-gold)' }}>
                  <Compass size={16} />
                </div>
                <div>
                  <div className="semi small champagne">AI Matching Radar</div>
                  <div className="tiny faint">Ghép ngẫu nhiên người có cùng gu</div>
                </div>
              </div>

              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
                  <Video size={16} />
                </div>
                <div>
                  <div className="semi small champagne">RanVideo Short-form</div>
                  <div className="tiny faint">Lướt video, thả tim & bình luận</div>
                </div>
              </div>

              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verdigris-patina)' }}>
                  <Globe2 size={16} />
                </div>
                <div>
                  <div className="semi small champagne">RanWorld Lounges</div>
                  <div className="tiny faint">Phòng Voice & Thảo luận chủ đề</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center g6 tiny faint" style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--gold-hairline)' }}>
            <ShieldCheck size={13} style={{ color: 'var(--emerald-patina)' }} />
            <span>Bảo vệ bởi Trust Engine & Supabase RLS</span>
          </div>
        </div>

        {/* RIGHT AUTH FORM PANEL */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--lacquer-deep)' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="rm-title" style={{ fontSize: 24, marginBottom: 6 }}>Đăng nhập</h1>
            <p className="small muted">Nhập email và mật khẩu của bạn để vào RanMet</p>
          </div>

          <form action={formAction} className="flex col g16">
            <div className="field-group">
              <label className="field-label">
                <Mail size={13} /> Email tài khoản
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
                <Lock size={13} /> Mật khẩu
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
              style={{ marginTop: 8, padding: 13 }}
            >
              {pending ? (
                <>Đang xác thực...</>
              ) : (
                <>
                  Đăng nhập ngay <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Register */}
          <div className="center-text small muted" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gold-hairline)' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--kinpaku-gold)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
