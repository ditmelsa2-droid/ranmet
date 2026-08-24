// ============================================================
// RanMet Gemini AI Multi-Key Rotation & Moderation Engine
// Tự động luân phiên đổi API Keys của Google Gemini để không bao giờ hết quota
// ============================================================

// Danh sách các API Keys (Được phân cách bằng dấu phẩy trong biến môi trường GEMINI_API_KEYS)
let currentKeyIndex = 0

function getApiKeys() {
  const keysStr = 
    process.env.GEMINI_API_KEYS || 
    process.env.NEXT_PUBLIC_GEMINI_API_KEYS || 
    process.env.GEMINI_API_KEY || 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
    ''

  return keysStr
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
}

/**
 * Gọi Google Gemini API với cơ chế xoay vòng Keys (Round-Robin & Retry on 429 Quota)
 * @param {string} prompt - Lời nhắc kiểm duyệt
 * @returns {Promise<string|null>}
 */
export async function callGeminiRotating(prompt) {
  const keys = getApiKeys()
  if (keys.length === 0) {
    return null // Không có API key, sẽ dùng bộ lọc Local Rule-based
  }

  const maxAttempts = keys.length
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = keys[currentKeyIndex]
    currentKeyIndex = (currentKeyIndex + 1) % keys.length

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 150
            }
          })
        }
      )

      if (response.status === 429) {
        console.warn(`[Gemini Rotator] Key index ${currentKeyIndex} hit 429 Quota, switching to next key...`)
        continue // Thử key tiếp theo
      }

      if (!response.ok) {
        console.warn(`[Gemini Rotator] Key index ${currentKeyIndex} failed with status ${response.status}`)
        continue
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text.trim()
    } catch (err) {
      console.error('[Gemini Rotator] Network error:', err)
    }
  }

  return null
}
