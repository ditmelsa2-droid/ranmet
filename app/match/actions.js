'use server'

import { createClient } from '@/lib/supabase/server'
import { pickCandidate } from '@/lib/matching'

export async function findMatchAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!me) return { error: 'Không tìm thấy hồ sơ.' }

  // 1. Fetch all existing chats of current user to prevent duplicate matches
  const { data: existingChats } = await supabase
    .from('chats')
    .select('user_a, user_b')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

  const matchedUserIds = new Set(
    (existingChats || []).map((c) => (c.user_a === user.id ? c.user_b : c.user_a))
  )

  // 2. Fetch candidates: everyone who has completed onboarding, excluding me
  const { data: pool, error: poolError } = await supabase
    .from('profiles')
    .select('*, trust_scores(score)')
    .eq('onboarding_complete', true)
    .neq('id', user.id)

  if (poolError) return { error: poolError.message }

  // 3. Filter out anyone who has already been matched before
  const availablePool = (pool || []).filter((p) => !matchedUserIds.has(p.id))

  if (availablePool.length === 0) {
    return { 
      error: 'Chưa có người dùng mới phù hợp với bạn lúc này. Bạn đã kết nối với tất cả người dùng hiện có! Vui lòng thử lại sau hoặc mời thêm bạn bè.' 
    }
  }

  const picked = pickCandidate(me, availablePool)
  if (!picked) {
    return { error: 'Chưa có người dùng phù hợp với bạn lúc này. Vui lòng thử lại sau.' }
  }

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
