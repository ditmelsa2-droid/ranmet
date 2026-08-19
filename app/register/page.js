'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between">
        <div style={{ marginTop: 60 }}>
          <div className="rm-logo" style={{ marginBottom: 8 }}>RanMet</div>
          <div className="small faint" style={{ marginBottom: 36 }}>Connect · Create · Inspire</div>

          <h1 className="bold" style={{ fontSize: 22, marginBottom: 24 }}>Tạo tài khoản</h1>

          <form action={formAction} className="flex col g16">
            <div>
              <label className="field-label">Email</label>
              <input className="input" type="email" name="email" placeholder="ban@email.com" required />
            </div>
            <div>
              <label className="field-label">Mật khẩu</label>
              <input className="input" type="password" name="password" placeholder="Ít nhất 8 ký tự" required minLength={8} />
            </div>
            <div>
              <label className="field-label">Nhập lại mật khẩu</label>
              <input className="input" type="password" name="confirm" placeholder="••••••••" required minLength={8} />
            </div>
            {state?.error && <div className="err-text">{state.error}</div>}
            <button className="btn btn-primary" type="submit" disabled={pending} style={{ marginTop: 8 }}>
              {pending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
        </div>

        <div className="center-text small muted" style={{ marginTop: 32 }}>
          Đã có tài khoản? <Link href="/login" style={{ color: '#8b5cf6', fontWeight: 700 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
