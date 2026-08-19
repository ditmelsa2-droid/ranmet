'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { findMatchAction } from './actions'

export default function MatchPage() {
  const router = useRouter()
  const [stage, setStage] = useState('searching') // searching | error | reveal
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2200))

    Promise.all([findMatchAction(), minDelay]).then(([res]) => {
      if (cancelled) return
      if (res.error) {
        setError(res.error)
        setStage('error')
      } else {
        setResult(res)
        setStage('reveal')
      }
    })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="rm-shell">
      <div className="rm-page flex col items-center" style={{ paddingTop: 60, textAlign: 'center' }}>
        {stage === 'searching' && (
          <>
            <div className="radar-wrap">
              <div className="radar-ring" /><div className="radar-ring" /><div className="radar-ring" />
              <div className="radar-core" />
            </div>
            <div className="small muted" style={{ marginTop: 28 }}>Đang tìm người phù hợp với bạn...</div>
          </>
        )}

        {stage === 'error' && (
          <>
            <div className="card" style={{ marginTop: 20 }}>
              <div className="small" style={{ color: '#fb7185' }}>{error}</div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => router.push('/home')}>Quay lại</button>
          </>
        )}

        {stage === 'reveal' && result && (
          <div style={{ width: '100%' }}>
            <div className="bold" style={{ fontSize: 19, marginBottom: 4 }}>{result.candidate.name || 'Người dùng mới'}</div>
            <div className="tiny faint" style={{ marginBottom: 14 }}>{result.candidate.country}</div>
            <div className="rm-num bold" style={{
              fontSize: 40, marginBottom: 18,
              background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              {result.compat.total}%
            </div>
            <div className="card" style={{ textAlign: 'left', marginBottom: 18 }}>
              {result.compat.breakdown.map((b) => (
                <div key={b.label} style={{ marginBottom: 10 }}>
                  <div className="flex justify-between tiny muted" style={{ marginBottom: 5 }}>
                    <span>{b.label} ({b.pct}%)</span><span>{b.score}%</span>
                  </div>
                  <div className="compat-bar-track"><div className="compat-bar-fill" style={{ width: b.score + '%' }} /></div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => router.push('/chat/' + result.chatId)}>Bắt đầu trò chuyện</button>
          </div>
        )}
      </div>
    </div>
  )
}
