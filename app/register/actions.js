'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function registerAction(_prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const confirm = formData.get('confirm')

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }
  if (password.length < 8) {
    return { error: 'Mật khẩu cần ít nhất 8 ký tự.' }
  }
  if (password !== confirm) {
    return { error: 'Mật khẩu nhập lại không khớp.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message?.toLowerCase().includes('already registered') || error.code === 'user_already_exists') {
      return { error: 'Email này đã được đăng ký. Hãy đăng nhập.' }
    }
    return { error: 'Không thể tạo tài khoản: ' + error.message }
  }

  redirect('/onboarding')
}
