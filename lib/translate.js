// ============================================================
// RanMet AI Realtime Auto-Translation Engine
// Dịch thuật thời gian thực đa ngôn ngữ không giới hạn bằng Google Gemini 2.5 Flash
// ============================================================

import { callGeminiRotating } from './gemini'

const translationCache = new Map()

export const GLOBAL_LANG_NAMES = {
  vi: 'Vietnamese',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  ru: 'Russian',
  th: 'Thai',
  pt: 'Portuguese',
  id: 'Indonesian',
  hi: 'Hindi',
  ar: 'Arabic',
  it: 'Italian',
  fil: 'Filipino / Tagalog',
  tr: 'Turkish',
  nl: 'Dutch',
  pl: 'Polish',
  ms: 'Malay',
  uk: 'Ukrainian',
  sv: 'Swedish',
  el: 'Greek',
  bn: 'Bengali',
  ur: 'Urdu',
  ta: 'Tamil',
  my: 'Burmese',
  lo: 'Lao',
  km: 'Khmer',
  he: 'Hebrew',
  cs: 'Czech',
  hu: 'Hungarian',
  ro: 'Romanian',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
}

/**
 * Dịch văn bản đơn lẻ sang bất kỳ ngôn ngữ nào trên thế giới
 * @param {string} text - Đoạn văn cần dịch
 * @param {string} targetLangCode - Mã ngôn ngữ bất kỳ (ví dụ: 'pt', 'id', 'hi', 'ar',...)
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLangCode = 'en') {
  if (!text || !text.trim()) return ''
  
  const cacheKey = `${targetLangCode}::${text.trim()}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  const targetLanguageName = GLOBAL_LANG_NAMES[targetLangCode] || targetLangCode

  const prompt = `You are RanMet AI Realtime Global Translator.
Translate the following text accurately, naturally, and conversationally into ${targetLanguageName}.
Keep emojis and markdown formatting intact.
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

/**
 * Dịch tự động toàn bộ từ điển giao diện UI sang ngôn ngữ mới bằng Gemini 2.5 Flash
 * @param {Object} baseDict - Từ điển gốc (EN)
 * @param {string} targetLangCode - Mã ngôn ngữ bất kỳ
 * @returns {Promise<Object>}
 */
export async function translateUiDictionary(baseDict, targetLangCode) {
  const targetLanguageName = GLOBAL_LANG_NAMES[targetLangCode] || targetLangCode
  
  const prompt = `You are an expert UI localization AI for the modern web app RanMet.
Translate the following JSON key-value dictionary into natural, polished ${targetLanguageName}.
Keep all keys exactly unchanged. Keep emojis, placeholders, and punctuation formatting intact.
Return ONLY valid JSON format with no markdown blocks or surrounding text.

JSON to translate:
${JSON.stringify(baseDict, null, 2)}`

  try {
    const raw = await callGeminiRotating(prompt)
    if (raw) {
      const jsonStr = raw.replace(/```json\s*|```/gi, '').trim()
      const parsed = JSON.parse(jsonStr)
      return parsed
    }
  } catch (err) {
    console.error('Batch dictionary translation error:', err)
  }

  return baseDict
}
