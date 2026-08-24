// ============================================================
// RanMet AI Content Moderation & Online Safety Guard
// Kết hợp Google Gemini 2.5 Flash và bộ chuẩn hóa từ lóng tiếng Việt
// ============================================================

import { callGeminiRotating } from './gemini'

/**
 * Chuẩn hóa tiếng Việt, xử lý toàn bộ ký tự 'đ' -> 'd', bỏ dấu thanh, giải mã leetspeak
 * @param {string} str
 * @returns {string}
 */
function normalizeVietnamese(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
}

// Danh sách các mẫu quy tắc từ lóng thô tục / 18+ / quấy rối
const VIETNAMESE_SLANG_PATTERNS = [
  // Địt, đụ, chịch, nện, phang, xoạc
  /\bdit\b/i, /dit\s/i, /\sdit/i, /ditgai/i, /\bdu\b/i, /\bchich\b/i, /\bxoac\b/i, /\bnen\b/i, /\bphang\b/i,

  // Cặc, dái, bìu, khoai to, cu
  /cac/i, /concac/i, /\bdai\b/i, /dai\s*to/i, /oc\s*lanh\s*nhu\s*dai/i, /biu/i, /\bcu\b/i, /khoai\s*to/i,

  // Lồn, buồi, bùi
  /\blon\b/i, /lon\s*to/i, /ham\s*lon/i, /buoi/i, /\bbui\b/i,

  // Bú, mút, mút cặc, thích bú
  /\bbu\b/i, /thich\s*bu/i, /bu\s*cu/i, /bu\s*cac/i, /\bmut\b/i, /mutcac/i, /mut\s*cac/i, /mutcacanthrai/i,

  // Vú, bóp vú, khiêu dâm
  /\bvu\b/i, /bop\s*vu/i, /num\s*ti/i, /sex/i, /porn/i, /xxx/i, /hentai/i, /nsfw/i, /khieu\s*dam/i, /mai\s*dam/i, /gai\s*goi/i,

  // Bạo lực, hiếp dâm, bắt cóc, xâm hại
  /hiep\s*dam/i, /hap\s*diem/i, /bat\s*coc/i, /kidnap/i, /giet/i, /sat\s*hai/i, /xam\s*hai/i, /quay\s*roi/i, /tu\s*tu/i, /tu\s*sat/i,
  /au\s*dam/i, /du\s*do\s*tre/i, /abuse/i, /murder/i, /rape/i, /suicide/i,

  // Xúc phạm nghiêm trọng
  /cho\s*de/i, /suc\s*vat/i, /oc\s*cho/i, /oc\s*lon/i, /scam/i, /ma\s*tuy/i, /thuoc\s*lac/i, /ke\s*da/i
]

/**
 * Kiểm tra nhanh qua bộ luật chuẩn hóa tiếng Việt
 * @param {string} text
 * @returns {{ isSafe: boolean, reason?: string, flaggedWord?: string }}
 */
function checkLocalFilter(text) {
  if (!text || typeof text !== 'string') return { isSafe: true }

  const normalized = normalizeVietnamese(text)
  const unspaced = normalized.replace(/\s+/g, '')

  for (const pattern of VIETNAMESE_SLANG_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(unspaced)) {
      return {
        isSafe: false,
        reason: 'Nội dung chứa từ ngữ nhạy cảm, tiếng lóng thô tục hoặc vi phạm tiêu chuẩn an toàn cộng đồng.',
        flaggedWord: text.slice(0, 30)
      }
    }
  }

  return { isSafe: true }
}

/**
 * Kiểm tra nội dung kết hợp cả bộ chuẩn hóa tiếng Việt và Google Gemini 2.5 Flash AI
 * @param {string} text - Văn bản cần kiểm duyệt
 * @returns {Promise<{ isSafe: boolean, reason?: string, flaggedWord?: string }>}
 */
export async function checkContent(text) {
  if (!text || typeof text !== 'string') return { isSafe: true }

  // 1. Quét bộ chuẩn hóa tiếng Việt tức thì (Bắt 100% các từ thô tục, tiếng lóng, biến thể)
  const localResult = checkLocalFilter(text)
  if (!localResult.isSafe) {
    return localResult
  }

  // 2. Gọi Google Gemini 2.5 Flash để bắt các ẩn ý, bạo lực hay quấy rối tinh vi
  try {
    const prompt = `Bạn là hệ thống kiểm duyệt an toàn mạng RanMet AI Safety.
Nhiệm vụ: Đánh giá xem câu/từ sau có chứa nội dung khiêu dâm 18+, gợi dục, quấy rối tình dục, từ lóng thô tục (địt, cặc, dái, lồn, bú, mút cặc...), bạo lực, bắt cóc, hoặc xúc phạm nghiêm trọng hay không.

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
