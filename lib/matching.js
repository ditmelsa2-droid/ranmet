export function computeCompatibility(me, candidate, candidateTrust) {
  const meInterests = me.interests || []
  const candInterests = candidate.interests || []
  const shared = meInterests.filter((i) => candInterests.includes(i))
  const base = meInterests.length || 1
  const interestScore = Math.round(Math.min(100, (shared.length / base) * 100))

  const languageScore = (me.languages || []).some((l) => (candidate.languages || []).includes(l))
    ? 100
    : 25

  const countryScore = me.country === candidate.country ? 100 : 55

  const tzDiff = Math.min(
    Math.abs((me.tz_offset ?? 0) - (candidate.tz_offset ?? 0)),
    24 - Math.abs((me.tz_offset ?? 0) - (candidate.tz_offset ?? 0))
  )
  const timezoneScore = Math.max(10, Math.round(100 - tzDiff * 10))

  const ageDiff = Math.abs(ageFromBirthday(me.birthday) - ageFromBirthday(candidate.birthday))
  const ageScore = Math.max(15, Math.round(100 - ageDiff * 7))

  const styleScore = me.conversation_style === candidate.conversation_style ? 100 : 55

  const trustScore = Math.round(100 - Math.min(100, Math.abs((me.trust ?? 100) - (candidateTrust ?? 100)) / 9))

  const randomScore = Math.round(Math.random() * 100)

  const total = Math.round(
    interestScore * 0.25 +
      languageScore * 0.2 +
      countryScore * 0.1 +
      timezoneScore * 0.1 +
      ageScore * 0.1 +
      styleScore * 0.1 +
      trustScore * 0.1 +
      randomScore * 0.05
  )

  return {
    total,
    shared,
    breakdown: [
      { label: 'Sở thích', pct: 25, score: interestScore },
      { label: 'Ngôn ngữ', pct: 20, score: languageScore },
      { label: 'Quốc gia', pct: 10, score: countryScore },
      { label: 'Múi giờ', pct: 10, score: timezoneScore },
      { label: 'Độ tuổi', pct: 10, score: ageScore },
      { label: 'Phong cách trò chuyện', pct: 10, score: styleScore },
      { label: 'Trust', pct: 10, score: trustScore },
      { label: 'Yếu tố ngẫu nhiên', pct: 5, score: randomScore },
    ],
  }
}

export function ageFromBirthday(birthday) {
  if (!birthday) return 25
  const b = new Date(birthday)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

export function pickCandidate(me, pool) {
  const scored = pool.map((p) => ({
    profile: p,
    compat: computeCompatibility(me, p, p.trust_scores?.score),
  }))
  scored.sort((a, b) => b.compat.total - a.compat.total)
  const top = scored.slice(0, 3)
  return top[Math.floor(Math.random() * top.length)] || scored[0] || null
}
