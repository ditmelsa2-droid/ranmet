// ============================================================
// RanMet Gemini AI Multi-Key Rotation & Moderation Engine
// Sử dụng Google Gemini 2.5 Flash thông minh, hỗ trợ kiểm duyệt văn bản & thị giác (Vision Multimodal)
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
 * Gọi Google Gemini 2.5 Flash API với cơ chế xoay vòng Keys cho Text
 * @param {string} prompt - Lời nhắc kiểm duyệt
 * @returns {Promise<string|null>}
 */
export async function callGeminiRotating(prompt) {
  const keys = getApiKeys()
  if (keys.length === 0) return null
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
            'Content-Type': 'application/json'
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

      // Kiểm tra safety block từ Gemini
      if (data?.promptFeedback?.blockReason) {
        return `UNSAFE: Vi phạm tiêu chuẩn an toàn (${data.promptFeedback.blockReason})`
      }

      const candidate = data?.candidates?.[0]
      if (candidate?.finishReason === 'SAFETY') {
        return 'UNSAFE: Bị chặn bởi bộ lọc an toàn hình ảnh & nội dung 18+'
      }

      const text = candidate?.content?.parts?.[0]?.text
      if (text) return text.trim()
    } catch (err) {
      console.error('[Gemini Rotator] Error:', err)
    }
  }

  return null
}

/**
 * Gọi Google Gemini 2.5 Flash Multimodal Vision API để kiểm duyệt khung hình Video / Ảnh trực quan
 * @param {string} prompt - Hướng dẫn kiểm duyệt
 * @param {string[]} base64Images - Mảng các ảnh dạng base64 / Data URL
 * @returns {Promise<{ isSafe: boolean, reason?: string }>}
 */
export async function callGeminiVision(prompt, base64Images = []) {
  if (!base64Images || base64Images.length === 0) {
    return { isSafe: true }
  }

  const keys = getApiKeys()
  if (keys.length === 0) return { isSafe: true }
  const maxAttempts = keys.length

  const parts = [{ text: prompt }]

  for (const item of base64Images) {
    const rawData = item.includes(',') ? item.split(',')[1] : item
    if (rawData && rawData.length > 50) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: rawData
        }
      })
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = keys[currentKeyIndex]
    currentKeyIndex = (currentKeyIndex + 1) % keys.length

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
            ]
          })
        }
      )

      if (response.status === 429) {
        console.warn(`[Gemini Vision] Key ${currentKeyIndex} hit 429, trying next key...`)
        continue
      }

      if (!response.ok) {
        console.warn(`[Gemini Vision] API returned ${response.status}`)
        continue
      }

      const data = await response.json()

      // 1. Kiểm tra blockReason từ hệ thống kiểm duyệt Gemini
      if (data?.promptFeedback?.blockReason) {
        return {
          isSafe: false,
          reason: `Phát hiện hình ảnh nhạy cảm / 18+ (${data.promptFeedback.blockReason})`
        }
      }

      const candidate = data?.candidates?.[0]
      if (candidate?.finishReason === 'SAFETY') {
        return {
          isSafe: false,
          reason: 'Phát hiện hình ảnh khiêu dâm, 18+, hoặc vi phạm tiêu chuẩn an toàn cộng đồng!'
        }
      }

      // Kiểm tra safety ratings
      if (candidate?.safetyRatings) {
        for (const rating of candidate.safetyRatings) {
          if (rating.probability === 'HIGH' || rating.probability === 'MEDIUM') {
            if (rating.category === 'HARM_CATEGORY_SEXUALLY_EXPLICIT') {
              return {
                isSafe: false,
                reason: 'Phát hiện nội dung nhạy cảm / tình dục / 18+ trong video!'
              }
            }
          }
        }
      }

      const text = candidate?.content?.parts?.[0]?.text || ''
      if (text.includes('UNSAFE') || text.includes('SEXUAL') || text.includes('NUDITY') || text.includes('HENTAI') || text.includes('PORN')) {
        return {
          isSafe: false,
          reason: text.replace('UNSAFE:', '').trim() || 'Nội dung video chứa hình ảnh 18+ không phù hợp.'
        }
      }

      return { isSafe: true }
    } catch (err) {
      console.error('[Gemini Vision] Error:', err)
    }
  }

  return { isSafe: true }
}
