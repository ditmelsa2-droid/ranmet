// ============================================================
// RanMet AI Realtime Auto-Translation Engine
// Dịch thuật thời gian thực đa ngôn ngữ bằng Google Gemini 2.5 Flash
// ============================================================

import { callGeminiRotating } from './gemini'

const translationCache = new Map()

/**
 * Dịch văn bản sang ngôn ngữ đích
 * @param {string} text - Đoạn văn cần dịch
 * @param {string} targetLangCode - Mã ngôn ngữ (vi, en, ja, ko, zh, fr, es, de, ru, th)
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLangCode = 'vi') {
  if (!text || !text.trim()) return ''
  
  const cacheKey = `${targetLangCode}::${text.trim()}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  const langNames = {
    vi: 'Vietnamese',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    ru: 'Russian',
    th: 'Thai'
  }

  const targetLanguageName = langNames[targetLangCode] || 'English'

  const prompt = `You are RanMet AI Realtime Translator.
Translate the following text accurately, naturally, and conversationally into ${targetLanguageName}.
Keep emojis and formatting intact.
Return ONLY the direct translated text, without any explanations or quotation marks.

Text to translate:
"${text}"`

  try {
    const result = await callGeminiRotating(prompt)
    if (result) {
      const clean = result.replace(/^"|"$/g, '').trim()
      translationCache.set(cacheKey, clean)
      return clean
    }
  } catch (err) {
    console.error('Translation error:', err)
  }

  return text
}
