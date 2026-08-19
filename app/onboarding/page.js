'use client'

import { useState, useActionState } from 'react'
import { completeOnboardingAction } from './actions'

const COUNTRIES = ['Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Singapore', 'Hoa Kỳ', 'Pháp', 'Brazil', 'Indonesia', 'Thái Lan', 'Đức', 'Vương quốc Anh', 'Ý', 'Mexico', 'Canada', 'Ấn Độ', 'Philippines']
const LANGUAGES = ['Tiếng Việt', 'English', '日本語', '한국어', 'Français', 'Español', 'Português', 'Deutsch', 'ภาษาไทย', 'Bahasa Indonesia', 'Italiano']
const INTERESTS = [
  { id: 'minecraft', label: 'Minecraft' }, { id: 'anime', label: 'Anime' }, { id: 'programming', label: 'Lập trình' },
  { id: 'football', label: 'Bóng đá' }, { id: 'kpop', label: 'KPOP' }, { id: 'ai', label: 'AI' },
  { id: 'travel', label: 'Du lịch' }, { id: 'food', label: 'Ẩm thực' }, { id: 'music', label: 'Âm nhạc' },
  { id: 'photography', label: 'Nhiếp ảnh' }, { id: 'gaming', label: 'Gaming' }, { id: 'technology', label: 'Công nghệ' },
]
const STYLES = ['Hay trò chuyện', 'Trầm tính', 'Hài hước', 'Nghiêm túc', 'Mê Gaming', 'Ham học hỏi', 'Yêu âm nhạc', 'Đam mê công nghệ']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [country, setCountry] = useState('')
  const [languages, setLanguages] = useState([])
  const [interests, setInterests] = useState([])
  const [style, setStyle] = useState('')
  const [state, formAction, pending] = useActionState(completeOnboardingAction, null)

  function toggle(list, setList, value, max) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : max && list.length >= max ? list : [...list, value])
  }

  const stepValid = [
    displayName.trim().length >= 2 && !!birthday,
    !!country && languages.length > 0,
    interests.length >= 3 && !!style,
  ][step]

  return (
    <div className="rm-shell">
      <div className="rm-page">
        <div className="tiny faint" style={{ marginBottom: 20 }}>Bước {step + 1}/3</div>

        {step === 0 && (
          <div>
            <h1 className="bold" style={{ fontSize: 20, marginBottom: 20 }}>Chào bạn 👋</h1>
            <label className="field-label">Tên hiển thị</label>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ marginBottom: 16 }} />
            <label className="field-label">Ngày sinh</label>
            <input className="input" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="bold" style={{ fontSize: 20, marginBottom: 20 }}>Bạn đến từ đâu?</h1>
            <label className="field-label">Quốc gia</label>
            <select className="input" value={country} onChange={(e) => setCountry(e.target.value)} style={{ marginBottom: 16 }}>
              <option value="" disabled>Chọn quốc gia</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="field-label">Ngôn ngữ (tối đa 3)</label>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
              {LANGUAGES.map((l) => (
                <div key={l} className={`chip${languages.includes(l) ? ' selected' : ''}`} onClick={() => toggle(languages, setLanguages, l, 3)}>{l}</div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="bold" style={{ fontSize: 20, marginBottom: 6 }}>Bạn thích điều gì?</h1>
            <div className="small muted" style={{ marginBottom: 14 }}>Chọn ít nhất 3 ({interests.length} đã chọn)</div>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {INTERESTS.map((it) => (
                <div key={it.id} className={`chip${interests.includes(it.id) ? ' selected' : ''}`} onClick={() => toggle(interests, setInterests, it.id, 20)}>{it.label}</div>
              ))}
            </div>
            <label className="field-label">Phong cách trò chuyện</label>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
              {STYLES.map((s) => (
                <div key={s} className={`chip${style === s ? ' selected' : ''}`} onClick={() => setStyle(s)}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {state?.error && <div className="err-text" style={{ marginTop: 16 }}>{state.error}</div>}

        <div className="flex g10" style={{ marginTop: 28 }}>
          {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>Quay lại</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={!stepValid} onClick={() => setStep((s) => s + 1)}>Tiếp tục</button>
          ) : (
            <form action={formAction} style={{ width: '100%' }}>
              <input type="hidden" name="displayName" value={displayName} />
              <input type="hidden" name="birthday" value={birthday} />
              <input type="hidden" name="country" value={country} />
              {languages.map((l) => <input key={l} type="hidden" name="languages" value={l} />)}
              {interests.map((i) => <input key={i} type="hidden" name="interests" value={i} />)}
              <input type="hidden" name="style" value={style} />
              <button className="btn btn-primary" type="submit" disabled={!stepValid || pending}>
                {pending ? 'Đang lưu...' : 'Bắt đầu khám phá RanMet'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
