'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Lock, CheckCircle2, ArrowRight, Zap, UserPlus } from 'lucide-react'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between" style={{ minHeight: '100vh', justifyContent: 'space-between' }}>
        <div style={{ paddingTop: 36 }}>
          {/* Header & Logo */}
          <div className="flex col items-center center-text" style={{ marginBottom: 30 }}>
            <div className="rm-logo" style={{ fontSize: 30, marginBottom: 4 }}>
              <Zap size={26} style={{ color: '#ec4899' }} /> RanMet
            </div>
            <div className="tiny muted flex items-center g6" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Sparkles size={13} style={{ color: '#a855f7' }} />
              Khởi đầu hành trình mới
            </div>
          </div>

          {/* Main Auth Card */}
          <div className="card" style={{ padding: 24, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)' }}>
            <div style={{ marginBottom: 20 }}>
              <h1 className="rm-title" style={{ fontSize: 23, marginBottom: 6 }}>Tạo tài khoản</h1>
              <p className="small muted">Gia nhập cộng đồng kết nối thông minh & an toàn</p>
            </div>

            <form action={formAction} className="flex col g14">
              <div className="field-group">
                <label className="field-label">
                  <Mail size={14} /> Email
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
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">
                  <CheckCircle2 size={14} /> Xác nhận mật khẩu
                </label>
                <div className="input-wrapper">
                  <input
                    className="input"
                    type="password"
                    name="confirm"
                    placeholder="Nhập lại mật khẩu trên"
                    autoComplete="new-password"
                    required
                    minLength={8}
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
                style={{ marginTop: 10 }}
              >
                {pending ? (
                  <>Đang khởi tạo...</>
                ) : (
                  <>
                    <UserPlus size={18} /> Đăng ký ngay <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer switch to Login */}
        <div className="center-text small muted" style={{ padding: '24px 0 10px' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#c084fc', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
