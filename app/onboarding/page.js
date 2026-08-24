'use client'

import { useState, useActionState } from 'react'
import { 
  Sparkles, User, Calendar, Globe, Languages, 
  Heart, MessageSquare, ArrowLeft, ArrowRight, Rocket, Check, Flame
} from 'lucide-react'
import { completeOnboardingAction } from './actions'

const COUNTRIES = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Singapore', 'Hoa Kỳ', 'Pháp',
  'Brazil', 'Indonesia', 'Thái Lan', 'Đức', 'Vương quốc Anh', 'Ý',
  'Mexico', 'Canada', 'Ấn Độ', 'Philippines'
]

const LANGUAGES = [
  'Tiếng Việt', 'English', '日本語', '한국어', 'Français', 'Español',
  'Português', 'Deutsch', 'ภาษาไทย', 'Bahasa Indonesia', 'Italiano'
]

const INTERESTS = [
  { id: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { id: 'anime', label: 'Anime & Manga', icon: '✨' },
  { id: 'programming', label: 'Lập trình / Dev', icon: '💻' },
  { id: 'football', label: 'Thể thao & Bóng đá', icon: '⚽' },
  { id: 'kpop', label: 'KPOP / Idol', icon: '🎤' },
  { id: 'ai', label: 'Trí tuệ nhân tạo (AI)', icon: '🤖' },
  { id: 'travel', label: 'Du lịch & Phượt', icon: '✈️' },
  { id: 'food', label: 'Ẩm thực & Cafe', icon: '🍜' },
  { id: 'music', label: 'Âm nhạc & Nhạc cụ', icon: '🎵' },
  { id: 'photography', label: 'Nhiếp ảnh & Phim', icon: '📸' },
  { id: 'gaming', label: 'Esports & Gaming', icon: '🎮' },
  { id: 'technology', label: 'Công nghệ & Gadget', icon: '🚀' },
]

const STYLES = [
  { id: 'Hay trò chuyện', desc: 'Nhiệt tình, hướng ngoại, thích chia sẻ', icon: '💬' },
  { id: 'Trầm tính', desc: 'Lắng nghe, sâu sắc, chọn lọc từ ngữ', icon: '☕' },
  { id: 'Hài hước', desc: 'Meme lord, vui vẻ, tạo tiếng cười', icon: '🎭' },
  { id: 'Nghiêm túc', desc: 'Thảo luận sâu, tôn trọng thời gian', icon: '🎯' },
  { id: 'Ham học hỏi', desc: 'Thích trao đổi kiến thức, sách vở', icon: '💡' },
  { id: 'Đam mê công nghệ', desc: 'Cùng chí hướng phát triển & xây dựng', icon: '⚡' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [country, setCountry] = useState('Việt Nam')
  const [languages, setLanguages] = useState(['Tiếng Việt'])
  const [interests, setInterests] = useState([])
  const [style, setStyle] = useState('')
  const [state, formAction, pending] = useActionState(completeOnboardingAction, null)

  function toggle(list, setList, value, max) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value))
    } else {
      if (max && list.length >= max) return
      setList([...list, value])
    }
  }

  const stepValid = [
    displayName.trim().length >= 2 && !!birthday,
    !!country && languages.length > 0,
    interests.length >= 3 && !!style,
  ][step]

  const progressPct = ((step + 1) / 3) * 100

  return (
    <div className="rm-shell">
      <div className="rm-page flex col justify-between" style={{ minHeight: '100vh', paddingBottom: 32 }}>
        <div>
          {/* Header Step Progress */}
          <div style={{ marginBottom: 28, paddingTop: 16 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <div className="tiny faint flex items-center g6" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Sparkles size={13} style={{ color: '#ec4899' }} /> Thiết lập hồ sơ
              </div>
              <div className="tiny bold rm-num" style={{ color: '#c084fc' }}>
                Bước {step + 1}/3
              </div>
            </div>
            {/* Progress bar track */}
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--brand-gradient)',
                  borderRadius: 999,
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 0 12px rgba(236, 72, 153, 0.5)',
                }}
              />
            </div>
          </div>

          {/* STEP 1: Basic Info */}
          {step === 0 && (
            <div className="card" style={{ padding: 24, animation: 'msgPop 0.3s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4 }}>Chào bạn 👋</h1>
                <p className="small muted">Cho mọi người biết danh tính và ngày sinh của bạn.</p>
              </div>

              {/* Avatar Preview */}
              <div className="flex items-center g16" style={{ marginBottom: 22, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                <div
                  className="avatar"
                  style={{
                    width: 56,
                    height: 56,
                    fontSize: 22,
                    background: 'var(--brand-gradient)',
                  }}
                >
                  {displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="semi small">{displayName.trim() || 'Tên của bạn'}</div>
                  <div className="tiny faint">+15 Trust Score sau khi hoàn tất</div>
                </div>
              </div>

              <div className="flex col g16">
                <div className="field-group">
                  <label className="field-label">
                    <User size={14} /> Tên hiển thị (Nickname)
                  </label>
                  <input
                    className="input"
                    placeholder="Ví dụ: Alex Nguyen"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={30}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Calendar size={14} /> Ngày sinh
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                  />
                  <div className="tiny faint">Yêu cầu từ 18 tuổi trở lên để tham gia kết nối.</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Languages */}
          {step === 1 && (
            <div className="card" style={{ padding: 24, animation: 'msgPop 0.3s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4 }}>Khu vực & Ngôn ngữ 🌍</h1>
                <p className="small muted">Hệ thống sẽ tối ưu hóa múi giờ và ghép bạn với người phù hợp.</p>
              </div>

              <div className="flex col g20">
                <div className="field-group">
                  <label className="field-label">
                    <Globe size={14} /> Quốc gia / Khu vực
                  </label>
                  <select
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} style={{ background: '#161320', color: '#fff' }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <div className="flex justify-between items-center">
                    <label className="field-label">
                      <Languages size={14} /> Ngôn ngữ giao tiếp
                    </label>
                    <span className="tiny faint">Tối đa 3</span>
                  </div>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
                    {LANGUAGES.map((l) => {
                      const isSel = languages.includes(l)
                      return (
                        <button
                          key={l}
                          type="button"
                          className={`chip ${isSel ? 'selected' : ''}`}
                          onClick={() => toggle(languages, setLanguages, l, 3)}
                        >
                          {isSel && <Check size={13} style={{ color: '#ec4899' }} />}
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interests & Style */}
          {step === 2 && (
            <div className="card" style={{ padding: 24, animation: 'msgPop 0.3s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4 }}>Sở thích & Phong cách ⚡</h1>
                <p className="small muted">
                  Chọn ít nhất 3 sở thích ({interests.length} đã chọn) và 1 phong cách trò chuyện.
                </p>
              </div>

              <div className="flex col g20">
                <div className="field-group">
                  <label className="field-label">
                    <Heart size={14} /> Chủ đề bạn quan tâm (ít nhất 3)
                  </label>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
                    {INTERESTS.map((it) => {
                      const isSel = interests.includes(it.id)
                      return (
                        <button
                          key={it.id}
                          type="button"
                          className={`chip ${isSel ? 'selected' : ''}`}
                          onClick={() => toggle(interests, setInterests, it.id, 20)}
                        >
                          <span>{it.icon}</span>
                          <span>{it.label}</span>
                          {isSel && <Check size={13} style={{ color: '#ec4899' }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <MessageSquare size={14} /> Phong cách trò chuyện
                  </label>
                  <div className="flex col g8">
                    {STYLES.map((st) => {
                      const isSel = style === st.id
                      return (
                        <div
                          key={st.id}
                          onClick={() => setStyle(st.id)}
                          className="flex items-center justify-between"
                          style={{
                            padding: '12px 16px',
                            borderRadius: 14,
                            background: isSel ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSel ? '#ec4899' : 'rgba(255, 255, 255, 0.07)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div className="flex items-center g10">
                            <span style={{ fontSize: 18 }}>{st.icon}</span>
                            <div>
                              <div className="semi small" style={{ color: isSel ? '#fff' : 'var(--text)' }}>
                                {st.id}
                              </div>
                              <div className="tiny faint">{st.desc}</div>
                            </div>
                          </div>
                          {isSel && <Check size={16} style={{ color: '#ec4899' }} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {state?.error && (
            <div className="err-text" style={{ marginTop: 18 }}>
              {state.error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex g12" style={{ marginTop: 24 }}>
          {step > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', minWidth: 100 }}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              className="btn btn-primary grow"
              disabled={!stepValid}
              onClick={() => setStep((s) => s + 1)}
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          ) : (
            <form action={formAction} className="grow">
              <input type="hidden" name="displayName" value={displayName} />
              <input type="hidden" name="birthday" value={birthday} />
              <input type="hidden" name="country" value={country} />
              {languages.map((l) => (
                <input key={l} type="hidden" name="languages" value={l} />
              ))}
              {interests.map((i) => (
                <input key={i} type="hidden" name="interests" value={i} />
              ))}
              <input type="hidden" name="style" value={style} />
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!stepValid || pending}
              >
                {pending ? (
                  <>Đang hoàn tất...</>
                ) : (
                  <>
                    <Rocket size={18} /> Bắt đầu khám phá RanMet
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
