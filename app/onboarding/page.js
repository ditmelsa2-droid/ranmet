'use client'

import { useState, useActionState } from 'react'
import { 
  Sparkles, User, Calendar, Globe, Languages, 
  Heart, MessageSquare, ArrowLeft, ArrowRight, Rocket, Check, Flame, Plus, X, AlertCircle, ShieldCheck
} from 'lucide-react'
import { completeOnboardingAction } from './actions'
import { checkContent, checkTags } from '@/lib/moderation'

const COUNTRIES = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Singapore', 'Hoa Kỳ', 'Pháp',
  'Brazil', 'Indonesia', 'Thái Lan', 'Đức', 'Vương quốc Anh', 'Ý',
  'Mexico', 'Canada', 'Ấn Độ', 'Philippines'
]

const LANGUAGES = [
  'Tiếng Việt', 'English', '日本語', '한국어', 'Français', 'Español',
  'Português', 'Deutsch', 'ภาษาไทย', 'Bahasa Indonesia', 'Italiano'
]

const SUGGESTED_INTERESTS = [
  'Minecraft', 'Anime & Manga', 'Lập trình / Dev', 'Thể thao & Bóng đá',
  'KPOP / Idol', 'Trí tuệ nhân tạo (AI)', 'Du lịch & Phượt', 'Ẩm thực & Cafe',
  'Âm nhạc', 'Nhiếp ảnh', 'Esports & Gaming', 'Công nghệ & Setup'
]

const SUGGESTED_STYLES = [
  'Nhiệt tình, vui vẻ, hướng ngoại',
  'Trầm tính, thích lắng nghe sâu sắc',
  'Hài hước, thích meme & pha trò',
  'Nghiêm túc, tôn trọng thời gian',
  'Đam mê công nghệ, thích chia sẻ kiến thức'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [country, setCountry] = useState('Việt Nam')
  const [languages, setLanguages] = useState(['Tiếng Việt'])
  const [interests, setInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [style, setStyle] = useState('')
  const [moderationError, setModerationError] = useState('')
  const [state, formAction, pending] = useActionState(completeOnboardingAction, null)

  function toggle(list, setList, value, max) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value))
    } else {
      if (max && list.length >= max) return
      setList([...list, value])
    }
  }

  function addCustomInterest() {
    const clean = customInterest.trim()
    if (!clean) return

    // AI CONTENT MODERATION CHECK
    const modCheck = checkContent(clean)
    if (!modCheck.isSafe) {
      setModerationError(`Từ khóa "${clean}" vi phạm tiêu chuẩn cộng đồng hoặc chứa nội dung độc hại! ⚠️`)
      return
    }

    setModerationError('')
    if (!interests.includes(clean)) {
      setInterests([...interests, clean])
    }
    setCustomInterest('')
  }

  function removeInterest(tag) {
    setInterests(interests.filter((t) => t !== tag))
  }

  const stepValid = [
    displayName.trim().length >= 2 && !!birthday,
    !!country && languages.length > 0,
    interests.length >= 1 && !!style.trim(),
  ][step]

  const progressPct = ((step + 1) / 3) * 100

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 640, padding: 32, animation: 'msgPop 0.3s ease' }}>
        {/* Header Step Progress */}
        <div style={{ marginBottom: 28 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <div className="tiny faint flex items-center g6" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Sparkles size={13} style={{ color: '#ec4899' }} /> Thiết lập hồ sơ cá nhân
            </div>
            <div className="tiny bold rm-num" style={{ color: '#c084fc' }}>
              Bước {step + 1}/3
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: '100%',
                background: 'var(--gold-gradient)',
                borderRadius: 999,
                transform: `scaleX(${progressPct / 100})`,
                transformOrigin: 'left center',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 12px rgba(245, 192, 66, 0.3)',
              }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Info */}
        {step === 0 && (
          <div className="flex col g20">
            <div>
              <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4, color: '#fff' }}>Chào bạn 👋</h1>
              <p className="small muted">Cho mọi người biết danh tính và ngày sinh của bạn.</p>
            </div>

            {/* Avatar Preview */}
            <div className="flex items-center g16" style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
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
                <div className="semi small" style={{ color: '#fff' }}>{displayName.trim() || 'Tên của bạn'}</div>
                <div className="tiny faint">+15 Trust Score sau khi hoàn tất</div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label"><User size={14} /> Tên hiển thị (Nickname)</label>
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
              <label className="field-label"><Calendar size={14} /> Ngày sinh</label>
              <input
                className="input"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: Location & Languages */}
        {step === 1 && (
          <div className="flex col g20">
            <div>
              <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4, color: '#fff' }}>Khu vực & Ngôn ngữ 🌍</h1>
              <p className="small muted">Hệ thống sẽ tối ưu hóa múi giờ và ngôn ngữ khi ghép đôi.</p>
            </div>

            <div className="field-group">
              <label className="field-label"><Globe size={14} /> Quốc gia / Khu vực</label>
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
              <label className="field-label"><Languages size={14} /> Ngôn ngữ giao tiếp</label>
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
        )}

        {/* STEP 3: Free-form Interests & Style */}
        {step === 2 && (
          <div className="flex col g20">
            <div>
              <h1 className="rm-title" style={{ fontSize: 22, marginBottom: 4, color: '#fff' }}>Sở thích & Phong cách (Tự do) ⚡</h1>
              <p className="small muted">
                Bạn hoàn toàn tự do nhập bất kỳ sở thích hay tính cách nào của mình.
              </p>
            </div>

            {moderationError && (
              <div className="err-text">
                <AlertCircle size={16} /> {moderationError}
              </div>
            )}

            {/* Custom Interests input */}
            <div className="field-group">
              <div className="flex justify-between items-center">
                <label className="field-label"><Heart size={14} /> Sở thích của bạn (Nhập tự do)</label>
                <span className="tiny faint flex items-center g4"><ShieldCheck size={12} style={{ color: '#10b981' }} /> AI Protected</span>
              </div>
              
              <div className="flex g8 items-center" style={{ marginBottom: 10 }}>
                <input
                  className="input"
                  placeholder="Nhập sở thích bất kỳ rồi bấm Thêm..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomInterest()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '12px 18px', flexShrink: 0 }}
                  onClick={addCustomInterest}
                >
                  <Plus size={16} /> Thêm
                </button>
              </div>

              {/* Selected tags */}
              <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {interests.map((it) => (
                  <span key={it} className="chip selected" style={{ padding: '6px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>{it}</span>
                    <X size={13} style={{ cursor: 'pointer' }} onClick={() => removeInterest(it)} />
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div>
                <div className="tiny faint" style={{ marginBottom: 6 }}>Gợi ý nhanh (Bấm để chọn):</div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_INTERESTS.filter(s => !interests.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => {
                        if (!interests.includes(s)) setInterests([...interests, s])
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Conversation Style */}
            <div className="field-group">
              <label className="field-label"><MessageSquare size={14} /> Phong cách trò chuyện & Tính cách</label>
              <input
                className="input"
                placeholder="Ví dụ: Thích pha trò hài hước, Hướng nội ít nói, Thích nghe kể chuyện..."
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                required
              />

              {/* Suggestions */}
              <div style={{ marginTop: 8 }}>
                <div className="tiny faint" style={{ marginBottom: 6 }}>Gợi ý nhanh:</div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_STYLES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className="chip"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setStyle(st)}
                    >
                      {st}
                    </button>
                  ))}
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

        {/* Action Buttons */}
        <div className="flex g12" style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
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
                {pending ? <>Đang hoàn tất...</> : <><Rocket size={18} /> Hoàn tất & Bắt đầu</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
