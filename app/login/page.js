'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between">
        <div style={{ marginTop: 60 }}>
          <div className="rm-logo" style={{ marginBottom: 8 }}>RanMet</div>
          <div className="small faint" style={{ marginBottom: 36 }}>Connect · Create · Inspire</div>

          <h1 className="bold" style={{ fontSize: 22, marginBottom: 24 }}>Đăng nhập</h1>

          <form action={formAction} className="flex col g16">
            <div>
              <label className="field-label">Email</label>
              <input className="input" type="email" name="email" placeholder="ban@email.com" required />
            </div>
            <div>
              <label className="field-label">Mật khẩu</label>
              <input className="input" type="password" name="password" placeholder="••••••••" required />
            </div>
            {state?.error && <div className="err-text">{state.error}</div>}
            <button className="btn btn-primary" type="submit" disabled={pending} style={{ marginTop: 8 }}>
              {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <div className="center-text small muted" style={{ marginTop: 32 }}>
          Chưa có tài khoản? <Link href="/register" style={{ color: '#8b5cf6', fontWeight: 700 }}>Đăng ký</Link>
        </div>
      </div>
    </div>
  )
}
