'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const COUNTRY_TZ = {
  'Việt Nam': 7, 'Nhật Bản': 9, 'Hàn Quốc': 9, 'Singapore': 8, 'Hoa Kỳ': -5,
  'Pháp': 1, 'Brazil': -3, 'Indonesia': 7, 'Thái Lan': 7, 'Đức': 1,
  'Vương quốc Anh': 0, 'Ý': 1, 'Mexico': -6, 'Canada': -5, 'Ấn Độ': 5, 'Philippines': 8,
}

function ageFrom(birthday) {
  const b = new Date(birthday)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

export async function completeOnboardingAction(_prevState, formData) {
  const displayName = formData.get('displayName')?.trim()
  const birthday = formData.get('birthday')
  const country = formData.get('country')
  const languages = formData.getAll('languages')
  const interests = formData.getAll('interests')
  const style = formData.get('style')
  const bio = formData.get('bio')?.trim() || 'Đang khám phá RanMet 🚀'

  if (!displayName || displayName.length < 2) return { error: 'Vui lòng nhập tên hiển thị (ít nhất 2 ký tự).' }
  if (!birthday) return { error: 'Vui lòng nhập ngày sinh.' }
  if (ageFrom(birthday) < 18) return { error: 'RanMet dành cho người dùng từ 18 tuổi trở lên.' }
  if (!country) return { error: 'Vui lòng chọn quốc gia.' }
  if (languages.length === 0) return { error: 'Chọn ít nhất 1 ngôn ngữ.' }
  if (interests.length < 3) return { error: 'Chọn ít nhất 3 sở thích.' }
  if (!style) return { error: 'Chọn phong cách trò chuyện.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      display_name: displayName,
      birthday,
      country,
      tz_offset: COUNTRY_TZ[country] ?? 0,
      languages,
      interests,
      conversation_style: style,
      bio,
      onboarding_complete: true,
    })

  if (updateError) return { error: 'Không thể lưu hồ sơ: ' + updateError.message }

  await supabase.rpc('add_trust', { p_user_id: user.id, p_delta: 15, p_reason: 'Hoàn tất hồ sơ' })

  redirect('/home')
}
