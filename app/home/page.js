import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  ShieldCheck, Sparkles, Compass, LogOut, Video, 
  Globe2, Lock, ArrowUpRight, Zap, Award, ArrowRight, Flame, Users, Radio, Newspaper, Share2, Copy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { trustTier, nextTierInfo } from '@/lib/trust'
import { logoutAction } from './actions'
import AppShell from '../components/AppShell'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: trust }, { count: refCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
    supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
  ])

  const score = trust?.score ?? 100
  const tier = trustTier(score)
  const next = nextTierInfo(score)
  const name = profile?.display_name || 'Bạn mới'
  const initial = name.charAt(0).toUpperCase()
  const referrals = refCount || 0

  return (
    <AppShell userProfile={profile} trustScore={score}>
      <div className="desktop-grid-2">
        {/* MAIN COLUMN */}
        <div className="flex col g24">
          {/* Top User Greeting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center g14">
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div
                  className="avatar"
                  style={{
                    width: 52,
                    height: 52,
                    fontSize: 20,
                    background: 'var(--brand-gradient)',
                    cursor: 'pointer'
                  }}
                >
                  {initial}
                </div>
              </Link>
              <div>
                <div className="flex items-center g8">
                  <span className="rm-title" style={{ fontSize: 22 }}>Xin chào, {name} 👋</span>
                  <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                    ONLINE
                  </span>
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>
                  {profile?.country || 'Việt Nam'} · {profile?.interests?.length || 0} sở thích · Phong cách: {profile?.conversation_style || 'Tự do'}
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                className="btn-icon"
                title="Đăng xuất"
                type="submit"
              >
                <LogOut size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </form>
          </div>

          {/* MAIN HERO ACTION: AI Matching Radar */}
          <Link href="/match" style={{ textDecoration: 'none' }}>
            <div
              className="card card-interactive"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(6, 182, 212, 0.2) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                boxShadow: '0 20px 50px -10px rgba(236, 72, 153, 0.35)',
                padding: '28px 24px',
                overflow: 'hidden',
              }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
                <div className="badge" style={{ background: 'rgba(236, 72, 153, 0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px' }}>
                  <Zap size={14} style={{ color: '#facc15' }} /> RANCHAT · AI MATCHING RADAR
                </div>
                <div 
                  style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <ArrowUpRight size={20} style={{ color: '#fff' }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <h2 className="rm-title" style={{ fontSize: 26, marginBottom: 8, color: '#fff' }}>
                  Ghép ngẫu nhiên người có gu ✨
                </h2>
                <p className="small" style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5, maxWidth: 520 }}>
                  Thuật toán đa chiều tự động tính toán điểm tương thích về sở thích, phong cách và múi giờ để tìm người bạn trò chuyện ăn ý nhất.
                </p>
              </div>

              <div className="flex items-center g10 tiny bold" style={{ color: '#fbcfe8', marginTop: 18 }}>
                <Compass size={18} /> Bắt đầu quét radar tìm kiếm ngay <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* REFERRAL / TRUST REWARDS BANNER */}
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div 
              className="card card-interactive"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(236, 72, 153, 0.15) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                padding: '20px 22px'
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <span className="badge tiny" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#f59e0b', border: '1px solid #f59e0b60' }}>
                  🎁 MỜI BẠN BÈ NHẬN TRUST (MỐC 3, 5, 10 BẠN)
                </span>
                <span className="tiny bold" style={{ color: '#f59e0b' }}>Nhận tối đa +100 Trust →</span>
              </div>
              <div className="semi small" style={{ color: '#fff', marginBottom: 4 }}>
                Mời bạn bè tham gia RanMet — Tích lũy Trust để ưu tiên hàng đợi kết nối!
              </div>
              <div className="tiny faint">
                Tiến độ: <b>{referrals}/10</b> người đã mời · Bấm để lấy link giới thiệu
              </div>
            </div>
          </Link>

          {/* TRUST SCORE HERO CARD */}
          <div 
            className="card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(26, 20, 48, 0.9) 0%, rgba(16, 13, 28, 0.95) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 12px 32px -8px rgba(168, 85, 247, 0.25)'
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
              <div className="flex items-center g6 tiny faint" style={{ letterSpacing: '0.06em' }}>
                <ShieldCheck size={16} style={{ color: tier.color }} />
                HỆ THỐNG ĐIỂM TIN CẬY (TRUST ENGINE)
              </div>
              <div className="badge badge-glow" style={{ color: tier.color, borderColor: tier.color }}>
                <Award size={13} /> {tier.name}
              </div>
            </div>

            <div className="flex items-end justify-between" style={{ marginBottom: 14 }}>
              <div>
                <div className="rm-num bold" style={{ fontSize: 40, color: tier.color, lineHeight: 1 }}>
                  {score} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>pts</span>
                </div>
                <div className="tiny muted" style={{ marginTop: 6 }}>
                  {score >= 200 ? 'Hồ sơ uy tín cao, ưu tiên hàng đợi kết nối' : 'Tương tác lịch sự và hoàn thành hồ sơ để nâng hạng'}
                </div>
              </div>

              {next && (
                <div className="tiny faint center-text" style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: 12 }}>
                  Cần <b style={{ color: '#fff' }}>{next.needed}</b> điểm để lên <b style={{ color: '#ec4899' }}>{next.label}</b>
                </div>
              )}
            </div>

            {/* Progress to next tier */}
            {next && (
              <div className="compat-bar-track" style={{ height: 8 }}>
                <div 
                  className="compat-bar-fill" 
                  style={{ 
                    width: `${Math.min(100, (score / (score + next.needed)) * 100)}%`,
                    background: 'var(--brand-gradient)'
                  }} 
                />
              </div>
            )}
          </div>

          {/* ECOSYSTEM ACCESS (RanNews, RanVideo, RanWorld) */}
          <div>
            <div className="tiny faint" style={{ marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Hệ sinh thái tính năng RanMet
            </div>
            <div className="flex col g12">
              <Link href="/news" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 18 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={22} style={{ color: '#06b6d4' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi" style={{ fontSize: 16, color: '#fff' }}>RanNews Bảng Tin</span>
                        <span className="badge badge-glow tiny" style={{ fontSize: 10, padding: '2px 8px' }}>MỚI</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>Đăng bài viết chia sẻ, hình ảnh, like & bình luận như Facebook</div>
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>

              <Link href="/videos" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 18 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={22} style={{ color: '#f43f5e' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi" style={{ fontSize: 16, color: '#fff' }}>RanVideo Short-form</span>
                        <span className="badge badge-glow tiny" style={{ fontSize: 10, padding: '2px 8px' }}>🔥 HOT</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>Lướt video ngắn sáng tạo chuẩn TikTok, đăng clip của bạn</div>
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>

              <Link href="/world" style={{ textDecoration: 'none' }}>
                <div className="card card-interactive flex items-center justify-between" style={{ padding: 18 }}>
                  <div className="flex items-center g14">
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe2 size={22} style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                      <div className="flex items-center g8">
                        <span className="semi" style={{ fontSize: 16, color: '#fff' }}>RanWorld Lounges</span>
                        <span className="badge badge-success tiny" style={{ fontSize: 10, padding: '2px 8px' }}>🎙️ LIVE</span>
                      </div>
                      <div className="tiny muted" style={{ marginTop: 2 }}>Phòng cộng đồng chủ đề Minecraft, Anime, Dev & Voice Stage</div>
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT DESKTOP SIDEBAR WIDGETS */}
        <div className="flex col g20">
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="flex items-center g8">
                <Radio size={16} style={{ color: '#10b981' }} />
                <span className="semi small">Phòng Voice đang Live</span>
              </div>
              <Link href="/world" className="tiny bold" style={{ color: '#ec4899' }}>Xem tất cả</Link>
            </div>

            <div className="flex col g10">
              <Link href="/world/minecraft-builders" className="card card-interactive" style={{ padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                <div className="semi small" style={{ color: '#fff' }}>Minecraft Builders ⛏️</div>
                <div className="flex items-center justify-between tiny faint" style={{ marginTop: 4 }}>
                  <span>148 thành viên</span>
                  <span className="badge badge-success tiny" style={{ padding: '1px 6px' }}>Voice</span>
                </div>
              </Link>

              <Link href="/world/anime-lounge" className="card card-interactive" style={{ padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                <div className="semi small" style={{ color: '#fff' }}>Góc Wibu & Anime ✨</div>
                <div className="flex items-center justify-between tiny faint" style={{ marginTop: 4 }}>
                  <span>112 thành viên</span>
                  <span className="badge tiny" style={{ padding: '1px 6px' }}>Chat</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center g8" style={{ marginBottom: 10 }}>
              <ShieldCheck size={16} style={{ color: '#ec4899' }} />
              <span className="semi small">Quy tắc cộng đồng</span>
            </div>
            <p className="tiny muted" style={{ lineHeight: 1.5, marginBottom: 10 }}>
              • Tôn trọng người lạ khi ghép đôi ngẫu nhiên.<br />
              • Không phát ngôn thù địch hoặc spam.<br />
              • Báo cáo vi phạm để bảo vệ điểm Trust.
            </p>
            <div className="tiny faint center-text" style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              RanMet Social v1.0 · Bản phát hành chính thức
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
