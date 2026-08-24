import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeView from './HomeView'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: trust }, { count: refCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
    supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
  ])

  return <HomeView profile={profile} trust={trust} refCount={refCount} />
}
