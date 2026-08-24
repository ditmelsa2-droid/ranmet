'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function registerAction(_prevState, formData) {
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }
  if (password.length < 6) {
    return { error: 'Mật khẩu cần tối thiểu 6 ký tự.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        registered_at: new Date().toISOString()
      }
    }
  })

  if (error) {
    if (error.message?.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
      return { error: 'Email này đã được đăng ký. Hãy đăng nhập.' }
    }
    return { error: 'Không thể tạo tài khoản: ' + error.message }
  }

  // Tự động đăng nhập nếu session chưa được thiết lập tự động
  if (!data?.session) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signInErr) {
      // Nếu Supabase yêu cầu xác thực email qua hòm thư
      return { error: 'Tài khoản đã tạo. Nếu Supabase bật xác thực email, vui lòng kiểm tra hòm thư của bạn.' }
    }
  }

  redirect('/onboarding')
}
