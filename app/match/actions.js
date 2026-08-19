'use server'

import { createClient } from '@/lib/supabase/server'
import { pickCandidate } from '@/lib/matching'

export async function findMatchAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!me) return { error: 'Không tìm thấy hồ sơ.' }

  // Candidates: everyone except me who has finished onboarding, with their
  // current Trust score joined in (used by the compatibility formula).
  const { data: pool, error: poolError } = await supabase
    .from('profiles')
    .select('*, trust_scores(score)')
    .eq('onboarding_complete', true)
    .neq('id', user.id)

  if (poolError) return { error: poolError.message }
  if (!pool || pool.length === 0) {
    return { error: 'Chưa có người dùng nào khác để ghép. Hãy mời bạn bè đăng ký thử!' }
  }

  const picked = pickCandidate(me, pool)
  if (!picked) return { error: 'Không tìm được ai phù hợp lúc này.' }

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({
      user_a: user.id,
      user_b: picked.profile.id,
      compatibility: picked.compat.total,
      compatibility_breakdown: picked.compat.breakdown,
    })
    .select()
    .single()

  if (chatError) return { error: chatError.message }

  return {
    chatId: chat.id,
    candidate: { id: picked.profile.id, name: picked.profile.display_name, country: picked.profile.country },
    compat: picked.compat,
  }
}
