'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between" style={{ minHeight: '100vh', justifyContent: 'space-between' }}>
        <div style={{ paddingTop: 40 }}>
          {/* Header & Logo */}
          <div className="flex col items-center center-text" style={{ marginBottom: 36 }}>
            <div className="rm-logo" style={{ fontSize: 32, marginBottom: 6 }}>
              <Zap size={28} style={{ color: '#ec4899' }} /> RanMet
            </div>
            <div className="tiny muted flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Sparkles size={13} style={{ color: '#a855f7' }} />
              Connect · Create · Inspire
            </div>
          </div>

          {/* Main Auth Card */}
          <div className="card" style={{ padding: 26, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)' }}>
            <div style={{ marginBottom: 22 }}>
              <h1 className="rm-title" style={{ fontSize: 24, marginBottom: 6 }}>Đăng nhập</h1>
              <p className="small muted">Chào mừng bạn trở lại với không gian kết nối RanMet</p>
            </div>

            <form action={formAction} className="flex col g16">
              <div className="field-group">
                <label className="field-label">
                  <Mail size={14} /> Email tài khoản
                </label>
                <div className="input-wrapper">
                  <input
                    className="input"
                    type="email"
                    name="email"
                    placeholder="ban@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">
                  <Lock size={14} /> Mật khẩu
                </label>
                <div className="input-wrapper">
                  <input
                    className="input"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
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
                style={{ marginTop: 8 }}
              >
                {pending ? (
                  <>Đang xác thực...</>
                ) : (
                  <>
                    Đăng nhập <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Feature highlights */}
          <div className="flex justify-between items-center g10" style={{ marginTop: 24, padding: '0 8px' }}>
            <div className="flex items-center g6 tiny faint">
              <ShieldCheck size={14} style={{ color: '#10b981' }} /> Trust Engine RLS
            </div>
            <div className="flex items-center g6 tiny faint">
              <Sparkles size={14} style={{ color: '#06b6d4' }} /> Realtime AI Match
            </div>
          </div>
        </div>

        {/* Footer switch to Register */}
        <div className="center-text small muted" style={{ padding: '24px 0 10px' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: '#c084fc', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  )
}
