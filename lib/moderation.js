// ============================================================
// RanMet AI Content Moderation & Safety Guard (Auto-Moderator)
// Tự động kiểm duyệt, ngăn chặn nội dung độc hại, xâm hại online & 18+
// ============================================================

const PROHIBITED_KEYWORDS = [
  // 18+ / NSFW / Tình dục / Mại dâm
  'sex', 'porn', 'nsfw', 'xxx', 'hentai', 'lon', 'buoi', 'dit', 'cu', 'dam', 
  'mai dam', 'gai goi', 'khieu dam', 'lo loan', 'hiep dam', 'thau dam', 'vú', 'bóp', 
  'nude', 'naked', 'dick', 'pussy', 'boobs', 'vagina', 'penis', 'blowjob', 'horny',
  'fuck', 'fucking', 'shacking',

  // Bạo lực / Bắt cóc / Xâm hại trực tuyến / Đe dọa
  'kidnap', 'bat coc', 'giet', 'chem', 'ban sung', 'sat hai', 'tu tu', 'tu sat',
  'xam hai', 'quay roi', 'de doa', 'tong tien', 'bao luc', 'khung bo', 'tra tan',
  'abuse', 'kill', 'murder', 'rape', 'suicide', 'assault', 'harass', 'terror',

  // Lừa đảo / Đánh bạc / Ma túy / Chất cấm
  'ma tuy', 'can sa', 'thuoc lac', 'heroine', 'ke da', 'danh bac', 'tai xiu', 
  'lo de', 'cobac', 'scam', 'lua dao', 'hack acc', 'trom cap', 'drug', 'cocaine',

  // Ngôn từ thù địch / Xúc phạm nhân phẩm nặng
  'suc vat', 'cho de', 'do dien', 'thang dien', 'con dien'
]

/**
 * Kiểm tra chuỗi văn bản có chứa từ khóa vi phạm tiêu chuẩn cộng đồng hay không
 * @param {string} text - Văn bản cần kiểm tra
 * @returns {{ isSafe: boolean, reason?: string, flaggedWord?: string }}
 */
export function checkContent(text) {
  if (!text || typeof text !== 'string') return { isSafe: true }

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics for normalization
    .replace(/[^a-z0-9\s]/g, ' ') // replace special chars with spaces

  for (const keyword of PROHIBITED_KEYWORDS) {
    const normKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // Check whole word or substring match
    const regex = new RegExp(`\\b${normKeyword}\\b`, 'i')
    if (regex.test(normalized) || normalized.includes(normKeyword)) {
      return {
        isSafe: false,
        reason: 'Nội dung chứa từ khóa vi phạm tiêu chuẩn cộng đồng hoặc có dấu hiệu xâm hại trực tuyến.',
        flaggedWord: keyword
      }
    }
  }

  return { isSafe: true }
}

/**
 * Kiểm tra và lọc danh sách tags sở thích
 * @param {string[]} tags - Danh sách các thẻ
 * @returns {{ safeTags: string[], hasBlocked: boolean, blockedWords: string[] }}
 */
export function checkTags(tags) {
  if (!Array.isArray(tags)) return { safeTags: [], hasBlocked: false, blockedWords: [] }

  const safeTags = []
  const blockedWords = []

  for (const tag of tags) {
    const check = checkContent(tag)
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
