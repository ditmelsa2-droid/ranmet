export function trustTier(score) {
  if (score >= 750) return { key: 'elite', name: 'Elite', color: '#e84fe0' }
  if (score >= 500) return { key: 'verified', name: 'Verified', color: '#8b5cf6' }
  if (score >= 250) return { key: 'trusted', name: 'Trusted', color: '#22d3ee' }
  if (score >= 100) return { key: 'basic', name: 'Basic', color: '#4f7cff' }
  return { key: 'new', name: 'New User', color: '#726a8a' }
}

export function nextTierInfo(score) {
  const bounds = [100, 250, 500, 750, 1001]
  const next = bounds.find((b) => b > score)
  if (!next || next > 1000) return null
  const tier = trustTier(next)
  return { needed: next - score, label: tier.name }
}
