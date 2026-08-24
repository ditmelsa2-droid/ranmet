// ============================================================
// RanMet AI Content Moderation & Online Safety Guard
// Kết hợp Google Gemini AI và bộ lọc từ lóng tiếng Việt chuyên sâu
// ============================================================

import { callGeminiRotating } from './gemini'

// Danh sách từ lóng thô tục, 18+, gợi dục, quấy rối và bạo lực tiếng Việt & Tiếng Anh
const DEEP_PROHIBITED_PATTERNS = [
  // Bộ phận sinh dục & tiếng lóng
  /c[aặâ]c/i, /c4c/i, /k4k/i, /con\s*c[aặâ]c/i, /concac/i,
  /d[aá]i/i, /d4i/i, /d4y/i, /biu/i, /b[iì]u/i,
  /l[oôò]n/i, /l0n/i, /b[uù]oi/i, /b[uù]ồi/i, /bu0i/i,
  /v[uú]/i, /b[oó]p\s*v[uú]/i, /khoai\s*to/i,
  /pussy/i, /dick/i, /cock/i, /boobs/i, /vagina/i, /penis/i, /tits/i,

  // Hành vi tình dục, gợi dục, quấy rối, 18+
  /b[uú]/i, /m[uú]t/i, /mut\s*cac/i, /m[uú]t\s*c[aặâ]c/i, /thich\s*bu/i, /th[ií]ch\s*b[uú]/i,
  /mutcac/i, /ch[iị]ch/i, /d[uụ]/i, /d[iị]t/i, /d1t/i, /n[eệ]n/i, /phang/i,
  /th[aả]m\s*du/i, /th[uủ]\s*d[aâ]m/i, /quay\s*tay/i, /x[eế]p\s*h[iì]nh/i, /m[oó]c\s*l[oố]p/i,
  /b[aắ]n\s*tinh/i, /tinh\s*tr[uù]ng/i, /porn/i, /sex/i, /xxx/i, /hentai/i, /nsfw/i,
  /g[aá]i\s*g[oọ]i/i, /m[aạ]i\s*d[aâ]m/i, /khieu\s*dam/i, /khi[eê]u\s*d[aâ]m/i, /blowjob/i, /horny/i, /cum/i,

  // Bạo lực, bắt cóc, xâm hại, ấu dâm, đe dọa
  /kidnap/i, /b[aắ]t\s*c[oó]c/i, /bat\s*coc/i, /gi[eê]t/i, /ch[eé]m/i, /b[aắ]n\s*s[uú]ng/i,
  /s[aá]t\s*h[aạ]i/i, /t[uự]\s*t[uử]/i, /t[uự]\s*s[aá]t/i, /x[aâ]m\s*h[aạ]i/i, /xam\s*hai/i,
  /qu[aá]y\s*r[oố]i/i, /d[eê]\s*d[oạ]a/i, /t[oố]ng\s*ti[eề]n/i, /b[aạ]o\s*l[uự]c/i,
  /hi[eê]p\s*d[aâ]m/i, /h[aấ]p\s*di[eê]m/i, /[aấ]u\s*d[aâ]m/i, /d[uụ]\s*d[oỗ]\s*tr[eẻ]/i,
  /murder/i, /rape/i, /suicide/i, /abuse/i, /assault/i,

  // Ma túy, lừa đảo, cờ bạc
  /ma\s*t[uú]y/i, /c[aâ]n\s*sa/i, /thu[oố]c\s*l[aắ]c/i, /k[eê]\s*[dđ][aá]/i,
  /[dđ][aá]nh\s*b[aạ]c/i, /t[aà]i\s*x[iỉ]u/i, /l[oô]\s*[dđ][eề]/i, /scam/i, /l[uừ]a\s*[dđ][aả]o/i,

  // Xúc phạm, thù địch
  /[oó]c\s*l[aạ]nh\s*nh[uư]\s*d[aá]i/i, /[oó]c\s*ch[oó]/i, /[oó]c\s*l[oợ]n/i,
  /s[uú]c\s*v[aậ]t/i, /ch[oó]\s*[dđ][eẻ]/i
]

/**
 * Kiểm tra nhanh qua bộ lọc Regex tiếng Việt chuyên sâu
 * @param {string} text
 * @returns {{ isSafe: boolean, reason?: string, flaggedWord?: string }}
 */
function checkLocalRegex(text) {
  if (!text || typeof text !== 'string') return { isSafe: true }

  // Chuẩn hóa loại bỏ dấu đặc biệt và khoảng cách rải rác (ví dụ: c.a.c hoặc c a c)
  const cleanSpaced = text.replace(/[\s\.\-_,]+/g, '').toLowerCase()

  for (const pattern of DEEP_PROHIBITED_PATTERNS) {
    if (pattern.test(text) || pattern.test(cleanSpaced)) {
      return {
        isSafe: false,
        reason: 'Nội dung chứa từ ngữ nhạy cảm, tiếng lóng thô tục hoặc có dấu hiệu xâm hại trực tuyến.',
        flaggedWord: text.slice(0, 30)
      }
    }
  }

  return { isSafe: true }
}

/**
 * Kiểm tra nội dung kết hợp cả Google Gemini AI và bộ lọc Realtime
 * @param {string} text - Văn bản cần kiểm duyệt
 * @returns {Promise<{ isSafe: boolean, reason?: string, flaggedWord?: string }>}
 */
export async function checkContent(text) {
  if (!text || typeof text !== 'string') return { isSafe: true }

  // 1. Kiểm tra nhanh qua bộ luật Regex tiếng Việt
  const localResult = checkLocalRegex(text)
  if (!localResult.isSafe) {
    return localResult
  }

  // 2. Nếu có Gemini API Keys thì hỏi AI để phát hiện các ẩn ý hoặc tiếng lóng biến thể tinh vi
  try {
    const prompt = `Bạn là hệ thống kiểm duyệt an toàn mạng RanMet AI Safety.
Nhiệm vụ: Đánh giá xem câu/từ sau có chứa nội dung khiêu dâm 18+, gợi dục, quấy rối tình dục, từ lóng bộ phận sinh dục (cặc, dái, lồn, bú, mút cặc...), bạo lực, bắt cóc, hoặc xúc phạm nghiêm trọng hay không.

Nội dung: "${text}"

Hãy trả lời duy nhất:
- "SAFE" nếu an toàn và lành mạnh.
- "UNSAFE: [Lý do ngắn]" nếu vi phạm hoặc độc hại.`

    const aiRes = await callGeminiRotating(prompt)
    if (aiRes && aiRes.startsWith('UNSAFE')) {
      return {
        isSafe: false,
        reason: aiRes.replace('UNSAFE:', '').trim() || 'Hệ thống Gemini AI phát hiện nội dung không phù hợp với tiêu chuẩn an toàn.',
        flaggedWord: text.slice(0, 30)
      }
    }
  } catch (err) {
    console.error('Gemini check error:', err)
  }

  return { isSafe: true }
}

/**
 * Kiểm tra danh sách tags
 * @param {string[]} tags
 * @returns {Promise<{ safeTags: string[], hasBlocked: boolean, blockedWords: string[] }>}
 */
export async function checkTags(tags) {
  if (!Array.isArray(tags)) return { safeTags: [], hasBlocked: false, blockedWords: [] }

  const safeTags = []
  const blockedWords = []

  for (const tag of tags) {
    const check = await checkContent(tag)
    if (check.isSafe) {
      safeTags.push(tag)
    } else {
      blockedWords.push(tag)
    }
  }

  return {
    safeTags,
    hasBlocked: blockedWords.length > 0,
    blockedWords
  }
}
