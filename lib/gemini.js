// ============================================================
// RanMet Gemini AI Multi-Key Rotation & Moderation Engine
// Sử dụng Google Gemini 2.5 Flash thông minh, nhận diện tiếng lóng Việt Nam
// ============================================================

let currentKeyIndex = 0

function getApiKeys() {
  const keysStr = 
    process.env.NEXT_PUBLIC_GEMINI_API_KEYS || 
    process.env.GEMINI_API_KEYS || 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
    process.env.GEMINI_API_KEY || 
    ''

  return keysStr
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
}

/**
 * Gọi Google Gemini 2.5 Flash API với cơ chế xoay vòng Keys (Round-Robin & Retry on 429 Quota)
 * @param {string} prompt - Lời nhắc kiểm duyệt
 * @returns {Promise<string|null>}
 */
export async function callGeminiRotating(prompt) {
  const keys = getApiKeys()
  if (keys.length === 0) {
    return null
  }

  const maxAttempts = keys.length
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = keys[currentKeyIndex]
    currentKeyIndex = (currentKeyIndex + 1) % keys.length

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': key
          },
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
        continue
      }

      if (!response.ok) {
        console.warn(`[Gemini Rotator] Key returned status ${response.status}`)
        continue
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text.trim()
    } catch (err) {
      console.error('[Gemini Rotator] Error:', err)
    }
  }

  return null
}
