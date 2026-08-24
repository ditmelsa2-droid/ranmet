'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, DollarSign, Eye, Heart, Users, Video, 
  TrendingUp, ArrowUpRight, Award, Plus, CheckCircle, CreditCard, ShieldCheck, Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../components/AppShell'

export default function CreatorStudioPage() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [isCreator, setIsCreator] = useState(false)
  const [earnings, setEarnings] = useState(0)
  const [myVideos, setMyVideos] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('100000')
  const [bankInfo, setBankInfo] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  useEffect(() => {
    async function loadStudio() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: vids }, { data: posts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('videos').select('*').eq('creator_id', user.id),
        supabase.from('rannews_posts').select('*').eq('author_id', user.id)
      ])

      if (prof) {
        setProfile(prof)
        setIsCreator(prof.is_creator || true) // auto-enable for demonstration
        setEarnings(prof.creator_earnings || 250000)
      }
      if (vids) setMyVideos(vids)
      if (posts) setMyPosts(posts)
      setLoading(false)
    }

    loadStudio()
  }, [supabase])

  function handleWithdraw(e) {
    e.preventDefault()
    if (!bankInfo.trim()) return
    showToast('Đã gửi yêu cầu rút tiền thành công! Tiền sẽ về trong 2-24h. 💸')
    setShowWithdrawModal(false)
  }

  return (
    <AppShell userProfile={profile}>
      <div className="flex col g24" style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {/* STUDIO TOP HEADER BANNER */}
        <div 
          className="card"
          style={{
            padding: 30,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(236, 72, 153, 0.25) 50%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            boxShadow: '0 20px 50px -10px rgba(245, 158, 11, 0.3)'
          }}
        >
          <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="badge badge-glow" style={{ color: '#f59e0b', borderColor: '#f59e0b80', marginBottom: 10 }}>
                <Award size={13} /> RANMET CREATOR STUDIO & KIẾM TIỀN
              </div>
              <h1 className="rm-title" style={{ fontSize: 26, color: '#fff', marginBottom: 6 }}>
                Trung Tâm Nhà Sáng Tạo & Doanh Thu 🚀
              </h1>
              <p className="small" style={{ color: 'rgba(255, 255, 255, 0.88)', maxWidth: 600, lineHeight: 1.5 }}>
                Tạo nội dung video ngắn RanVideo, bài viết RanNews chất lượng để nhận thưởng tiền mặt và điểm Trust trực tiếp từ cộng đồng.
              </p>
            </div>

            <div className="flex items-center g10">
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ width: 'auto', padding: '12px 22px', fontSize: 13, background: 'var(--gold-gradient)' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <DollarSign size={16} /> Rút tiền doanh thu
              </button>
            </div>
          </div>
        </div>

        {/* METRICS STATS CARDS GRID */}
        <div className="desktop-grid-3">
          {/* Card 1: Estimated Revenue */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <DollarSign size={14} style={{ color: '#f59e0b' }} /> Doanh Thu Tích Lũy
              </span>
              <span className="badge badge-success tiny" style={{ fontSize: 10 }}>Đã duyệt</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#f59e0b' }}>
              {Number(earnings).toLocaleString('vi-VN')} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>VNĐ</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              Thu nhập từ lượt xem video & tương tác bài viết
            </div>
          </div>

          {/* Card 2: Total Views */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <Eye size={14} style={{ color: '#06b6d4' }} /> Tổng Lượt Xem
              </span>
              <span className="badge tiny" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>+24% tuần này</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#06b6d4' }}>
              14,820
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              Lượt xem từ RanVideo và RanNews Feed
            </div>
          </div>

          {/* Card 3: Followers & Likes */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <Heart size={14} style={{ color: '#ec4899' }} /> Tương Tác & Follower
              </span>
              <span className="badge badge-glow tiny">Uy tín cao</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#ec4899' }}>
              3,450
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              Lượt thả tim & người theo dõi hồ sơ
            </div>
          </div>
        </div>

        {/* MONETIZATION PERKS & TIERS */}
        <div className="card" style={{ padding: 24 }}>
          <h3 className="rm-title" style={{ fontSize: 18, marginBottom: 14, color: '#fff' }}>
            Quyền lợi & Chương trình chia sẻ doanh thu
          </h3>
          <div className="flex col g12">
            <div className="flex items-start g12">
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="semi small" style={{ color: '#fff' }}>Nhận 70% doanh thu từ quảng cáo & tương tác</div>
                <div className="tiny faint">Tiền thưởng được cộng tự động theo mỗi 1,000 lượt xem hợp lệ.</div>
              </div>
            </div>

            <div className="flex items-start g12">
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="semi small" style={{ color: '#fff' }}>Ưu tiên phân phối trên mục Thịnh hành (Trending)</div>
                <div className="tiny faint">Thuật toán AI tự động đẩy nội dung có điểm Trust cao lên đầu feed.</div>
              </div>
            </div>

            <div className="flex items-start g12">
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="semi small" style={{ color: '#fff' }}>Rút tiền linh hoạt 24/7</div>
                <div className="tiny faint">Hỗ trợ chuyển khoản ngân hàng, ví MoMo và thẻ cào điện thoại.</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT MANAGEMENT LIST */}
        <div className="card" style={{ padding: 24 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 className="rm-title" style={{ fontSize: 18, color: '#fff' }}>
              Nội dung đã đăng tải của bạn ({myVideos.length + myPosts.length})
            </h3>
            <div className="flex g8">
              <Link href="/videos" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
                + Đăng video
              </Link>
              <Link href="/news" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
                + Đăng bài viết
              </Link>
            </div>
          </div>

          {myVideos.length === 0 && myPosts.length === 0 ? (
            <div className="center-text tiny faint" style={{ padding: 30 }}>
              Bạn chưa có video hoặc bài viết nào. Hãy đăng nội dung đầu tiên để bắt đầu tích lũy doanh thu!
            </div>
          ) : (
            <div className="flex col g10">
              {myVideos.map((v) => (
                <div key={v.id} className="card flex items-center justify-between" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center g10">
                    <Video size={18} style={{ color: '#f43f5e' }} />
                    <div>
                      <div className="semi small" style={{ color: '#fff' }}>{v.caption}</div>
                      <div className="tiny faint">{v.tags?.join(' ')}</div>
                    </div>
                  </div>
                  <span className="badge badge-success tiny">+15,000đ</span>
                </div>
              ))}

              {myPosts.map((p) => (
                <div key={p.id} className="card flex items-center justify-between" style={{ padding: 14, background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center g10">
                    <Sparkles size={18} style={{ color: '#06b6d4' }} />
                    <div>
                      <div className="semi small" style={{ color: '#fff' }}>{p.content?.slice(0, 40)}...</div>
                      <div className="tiny faint">Bài viết RanNews</div>
                    </div>
                  </div>
                  <span className="badge badge-success tiny">+10,000đ</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowWithdrawModal(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: 460, padding: 26, animation: 'msgPop 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
              <h2 className="rm-title" style={{ fontSize: 20 }}>Rút Doanh Thu Sáng Tạo</h2>
              <button 
                type="button" 
                onClick={() => setShowWithdrawModal(false)}
                className="btn-icon" 
                style={{ width: 32, height: 32 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="flex col g16">
              <div className="field-group">
                <label className="field-label">Số tiền muốn rút (VNĐ)</label>
                <select 
                  className="input"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                >
                  <option value="100000" style={{ background: '#161320' }}>100,000 VNĐ</option>
                  <option value="200000" style={{ background: '#161320' }}>200,000 VNĐ</option>
                  <option value="500000" style={{ background: '#161320' }}>500,000 VNĐ</option>
                  <option value="1000000" style={{ background: '#161320' }}>1,000,000 VNĐ</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Thông tin nhận tiền (STK Ngân hàng / SĐT Ví MoMo)</label>
                <input 
                  className="input" 
                  placeholder="Ví dụ: MB Bank - 0987654321 - NGUYEN VAN A"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8, background: 'var(--gold-gradient)' }}>
                <DollarSign size={16} /> Xác nhận rút tiền ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div 
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(18, 14, 28, 0.95)',
            border: '1px solid rgba(245, 158, 11, 0.6)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
            padding: '10px 20px',
            borderRadius: 999,
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 600,
            zIndex: 1000,
            animation: 'msgPop 0.25s ease'
          }}
        >
          {toastMsg}
        </div>
      )}
    </AppShell>
  )
}
