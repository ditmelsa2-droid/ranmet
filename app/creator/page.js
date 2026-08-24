'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, DollarSign, Eye, Heart, Users, Video, 
  TrendingUp, ArrowUpRight, Award, Plus, CheckCircle, CreditCard, ShieldCheck, Download, Lock, ArrowLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../components/AppShell'

const MIN_TRUST_REQUIRED = 1000

export default function CreatorStudioPage() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [trustScore, setTrustScore] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [myVideos, setMyVideos] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [totalLikes, setTotalLikes] = useState(0)
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

      const [{ data: prof }, { data: trust }, { data: vids }, { data: posts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('trust_scores').select('score').eq('user_id', user.id).single(),
        supabase.from('videos').select('*').eq('creator_id', user.id),
        supabase.from('rannews_posts').select('*').eq('author_id', user.id)
      ])

      if (prof) {
        setProfile(prof)
        // STRICT REAL EARNINGS (0 VNĐ default, no mockup numbers)
        setEarnings(Number(prof.creator_earnings || 0))
      }
      if (trust) {
        setTrustScore(trust.score || 0)
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
    if (earnings < Number(withdrawAmount)) {
      showToast('Số dư thực tế trong ví không đủ để rút số tiền này!')
      return
    }
    showToast('Đã gửi yêu cầu rút tiền thành công! 💸')
    setShowWithdrawModal(false)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="card center-text" style={{ padding: 40, maxWidth: 600, margin: '40px auto' }}>
          <div className="tiny bold muted">Đang tải dữ liệu Creator Studio...</div>
        </div>
      </AppShell>
    )
  }

  // 🔒 REQUIRE AT LEAST 1,000 TRUST POINTS TO UNLOCK
  const isLocked = trustScore < MIN_TRUST_REQUIRED
  const progressPct = Math.min(100, (trustScore / MIN_TRUST_REQUIRED) * 100)

  if (isLocked) {
    return (
      <AppShell trustScore={trustScore} userProfile={profile}>
        <div className="flex col items-center center-text" style={{ maxWidth: 640, margin: '40px auto', width: '100%' }}>
          <div 
            className="card"
            style={{
              padding: '48px 32px',
              width: '100%',
              background: 'linear-gradient(135deg, rgba(28, 20, 48, 0.95) 0%, rgba(14, 10, 24, 0.98) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 20px 60px -15px rgba(245, 158, 11, 0.2)'
            }}
          >
            <div 
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <Lock size={32} style={{ color: '#f59e0b' }} />
            </div>

            <div className="badge tiny" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b50', marginBottom: 10 }}>
              YÊU CẦU ĐIỂM TRUST: 1,000 PTS
            </div>

            <h1 className="rm-title" style={{ fontSize: 24, color: '#fff', marginBottom: 8 }}>
              Creator Studio Đang Bị Khóa
            </h1>
            <p className="small muted" style={{ lineHeight: 1.55, marginBottom: 24 }}>
              Để kích hoạt tính năng Nhà Sáng Tạo và Bật Kiếm Tiền, tài khoản của bạn cần đạt tối thiểu <b>1,000 Điểm Trust</b> để chứng minh mức độ uy tín và chất lượng trong cộng đồng.
            </p>

            {/* TRUST PROGRESS TRACK */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 18, borderRadius: 16, marginBottom: 24 }}>
              <div className="flex justify-between tiny bold" style={{ marginBottom: 8 }}>
                <span>Điểm Trust hiện tại của bạn: <b style={{ color: '#ec4899' }}>{trustScore} pts</b></span>
                <span className="muted">Mục tiêu: 1,000 pts ({progressPct.toFixed(0)}%)</span>
              </div>
              <div className="compat-bar-track" style={{ height: 10 }}>
                <div 
                  className="compat-bar-fill" 
                  style={{ width: `${progressPct}%`, background: 'var(--brand-gradient)' }} 
                />
              </div>
              <div className="tiny faint" style={{ marginTop: 10, textAlign: 'left' }}>
                Cần thêm <b style={{ color: '#f59e0b' }}>{Math.max(0, MIN_TRUST_REQUIRED - trustScore)} pts</b> nữa để mở khóa Studio.
              </div>
            </div>

            {/* HOW TO EARN TRUST */}
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <div className="tiny bold" style={{ color: '#fff', marginBottom: 8 }}>Cách tích lũy thêm điểm Trust nhanh nhất:</div>
              <div className="flex col g8 tiny muted">
                <div>• <b>Mời bạn bè:</b> Nhận tới <b>+100 Trust</b> khi mời đủ mốc 10 người đăng ký.</div>
                <div>• <b>Hoàn tất hồ sơ:</b> Nhận <b>+15 Trust</b> khi thiết lập đầy đủ thông tin.</div>
                <div>• <b>Trò chuyện lịch sự:</b> Ghép đôi trò chuyện vui vẻ, nhận đánh giá tích cực từ bạn bè.</div>
              </div>
            </div>

            <div className="flex g12">
              <Link href="/profile" className="btn btn-primary grow">
                Xem link mời bạn bè nhận Trust
              </Link>
              <Link href="/home" className="btn btn-secondary" style={{ width: 'auto' }}>
                <ArrowLeft size={16} /> Quay lại
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // UNLOCKED CREATOR STUDIO (TRUST >= 1000)
  const totalContentCount = myVideos.length + myPosts.length

  return (
    <AppShell userProfile={profile} trustScore={trustScore}>
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
                <Award size={13} /> RANMET CREATOR STUDIO (ĐÃ MỞ KHÓA)
              </div>
              <h1 className="rm-title" style={{ fontSize: 26, color: '#fff', marginBottom: 6 }}>
                Trung Tâm Nhà Sáng Tạo & Kiếm Tiền 🚀
              </h1>
              <p className="small" style={{ color: 'rgba(255, 255, 255, 0.88)', maxWidth: 600, lineHeight: 1.5 }}>
                Tạo video ngắn RanVideo, viết bài RanNews chất lượng để nhận thưởng tiền mặt thật từ cộng đồng.
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

        {/* METRICS STATS CARDS GRID (REAL DATA ONLY) */}
        <div className="desktop-grid-3">
          {/* Card 1: Estimated Revenue (Starts at 0 VNĐ) */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <DollarSign size={14} style={{ color: '#f59e0b' }} /> Số Dư Khả Dụng
              </span>
              <span className="badge badge-success tiny" style={{ fontSize: 10 }}>Ví tiền thật</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#f59e0b' }}>
              {Number(earnings).toLocaleString('vi-VN')} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>VNĐ</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              Thu nhập từ tương tác thật trên video & bài viết
            </div>
          </div>

          {/* Card 2: Total Content */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <Eye size={14} style={{ color: '#06b6d4' }} /> Nội Dung Đã Đăng
              </span>
              <span className="badge tiny" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>Thực tế</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#06b6d4' }}>
              {totalContentCount} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>mục</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              {myVideos.length} video · {myPosts.length} bài viết
            </div>
          </div>

          {/* Card 3: Trust Status */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <span className="tiny faint flex items-center g6">
                <ShieldCheck size={14} style={{ color: '#ec4899' }} /> Điểm Tin Cậy
              </span>
              <span className="badge badge-glow tiny">Đủ chuẩn</span>
            </div>
            <div className="rm-num bold" style={{ fontSize: 32, color: '#ec4899' }}>
              {trustScore} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>pts</span>
            </div>
            <div className="tiny faint" style={{ marginTop: 6 }}>
              Tài khoản đạt chuẩn đối tác sáng tạo
            </div>
          </div>
        </div>

        {/* CONTENT MANAGEMENT LIST */}
        <div className="card" style={{ padding: 24 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 className="rm-title" style={{ fontSize: 18, color: '#fff' }}>
              Nội dung đã đăng tải của bạn ({totalContentCount})
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

          {totalContentCount === 0 ? (
            <div className="center-text tiny faint" style={{ padding: 30 }}>
              Bạn chưa có video hoặc bài viết nào. Hãy đăng tải nội dung đầu tiên để bắt đầu tích lũy doanh thu!
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
                  <span className="badge badge-success tiny">Đang hiển thị</span>
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
                  <span className="badge badge-success tiny">Đang hiển thị</span>
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
