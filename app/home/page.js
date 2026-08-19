import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { logoutAction } from './actions'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: trust }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
  ])

  const score = trust?.score ?? 100
  const tier = trustTier(score)
  const next = nextTierInfo(score)

  return (
    <div className="rm-shell">
      <div className="rm-page">
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div>
            <div className="bold" style={{ fontSize: 19 }}>Chào, {profile?.display_name || 'bạn'} 👋</div>
            <div className="small muted">Hôm nay bạn sẽ gặp ai?</div>
          </div>
          <form action={logoutAction}>
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>Đăng xuất</button>
          </form>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="tiny faint" style={{ marginBottom: 6 }}>TRUST</div>
          <div className="flex items-center g12">
            <div className="bold rm-num" style={{ fontSize: 28, color: tier.color }}>{score}</div>
            <div>
              <div className="semi small" style={{ color: tier.color }}>{tier.name}</div>
              {next && <div className="tiny faint">Còn {next.needed} điểm để lên {next.label}</div>}
            </div>
          </div>
        </div>

        <Link href="/match">
          <div className="card" style={{
            background: 'linear-gradient(160deg, rgba(232,79,224,.14), rgba(34,211,238,.08))',
            border: '1px solid rgba(139,92,246,.35)', cursor: 'pointer',
          }}>
            <div className="tiny semi" style={{ color: '#8b5cf6', marginBottom: 8 }}>RANCHAT · AI MATCHING</div>
            <div className="bold" style={{ fontSize: 19, marginBottom: 5 }}>Ghép ngẫu nhiên</div>
            <div className="small muted">Gặp một người mới, đúng lúc.</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
