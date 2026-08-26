'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap, Video, Globe2, Compass } from 'lucide-react'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

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
            <div className="rm-logo" style={{ fontSize: 26, marginBottom: 6 }}>
              <Zap size={24} style={{ color: 'var(--kinpaku-gold)' }} /> RanMet
            </div>
            <div className="tiny faint flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              <Sparkles size={12} style={{ color: 'var(--kinpaku-gold)' }} />
              CONNECT · DISCOVER · INSPIRE
            </div>

            <h2 className="rm-title" style={{ fontSize: 20, lineHeight: 1.35, marginBottom: 10 }}>
              Tham Gia Cộng Đồng RanMet Ngay Hôm Nay
            </h2>
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 24 }}>
              Khởi tạo hồ sơ, nhận ngay 100 điểm Trust khởi đầu và trải nghiệm ngay không gian mạng xã hội thế hệ mới.
            </p>

            <div className="flex col g10">
              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(245, 192, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kinpaku-gold)' }}>
                  <Compass size={16} />
                </div>
                <div>
                  <div className="semi small champagne">AI Matching Đa Chiều</div>
                  <div className="tiny faint">Kết nối theo sở thích & phong cách</div>
                </div>
              </div>

              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
                  <Video size={16} />
                </div>
                <div>
                  <div className="semi small champagne">RanVideo Sáng Tạo</div>
                  <div className="tiny faint">Lướt video ngắn đa chủ đề</div>
                </div>
              </div>

              <div className="flex items-center g10" style={{ padding: '10px 12px', background: 'var(--lacquer-deep)', borderRadius: 8, border: '1px solid var(--gold-hairline)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verdigris-patina)' }}>
                  <Globe2 size={16} />
                </div>
                <div>
                  <div className="semi small champagne">RanWorld Voice Lounges</div>
                  <div className="tiny faint">Hàng chục phòng cộng đồng sôi nổi</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center g6 tiny faint" style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--gold-hairline)' }}>
            <ShieldCheck size={13} style={{ color: 'var(--emerald-patina)' }} />
            <span>Miễn phí 100% · Không chứa quảng cáo rác</span>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--lacquer-deep)' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="rm-title" style={{ fontSize: 24, marginBottom: 6 }}>Tạo tài khoản</h1>
            <p className="small muted">Chỉ mất 30 giây để bắt đầu hành trình kết nối</p>
          </div>

          <form action={formAction} className="flex col g16">
            <div className="field-group">
              <label className="field-label">
                <Mail size={13} /> Email của bạn
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
                <Lock size={13} /> Mật khẩu (tối thiểu 6 ký tự)
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
              style={{ marginTop: 8, padding: 13 }}
            >
              {pending ? (
                <>Đang khởi tạo tài khoản...</>
              ) : (
                <>
                  Tạo tài khoản ngay <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to Login */}
          <div className="center-text small muted" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gold-hairline)' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: 'var(--kinpaku-gold)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
