// ============================================================
// RanMet Video & Image Multimodal AI Inspector (18+ NSFW Age-Gate & Safety)
// Trích xuất khung hình video (Keyframes) và phân loại 18+ NSFW để làm mờ & giới hạn độ tuổi
// ============================================================

import { callGeminiVision } from './gemini'

/**
 * Trích xuất các khung hình chính (keyframes) từ tệp video hoặc URL video
 * @param {File|string} videoSource - File video hoặc URL video
 * @param {number} frameCount - Số lượng khung hình cần trích xuất (mặc định 4)
 * @returns {Promise<string[]>} Mảng các ảnh base64 JPEG
 */
export function extractVideoKeyframes(videoSource, frameCount = 4) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve([])
    }

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    let srcUrl = ''
    if (typeof videoSource === 'string') {
      srcUrl = videoSource
    } else if (videoSource instanceof File || videoSource instanceof Blob) {
      srcUrl = URL.createObjectURL(videoSource)
    }

    if (!srcUrl) {
      return resolve([])
    }

    video.src = srcUrl

    const frames = []
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const cleanup = () => {
      if (typeof videoSource !== 'string' && srcUrl) {
        URL.revokeObjectURL(srcUrl)
      }
      video.remove()
      canvas.remove()
    }

    video.onloadedmetadata = async () => {
      const duration = video.duration || 5
      const intervals = []

      // Lấy các mốc thời gian trải đều toàn bộ video
      for (let i = 1; i <= frameCount; i++) {
        intervals.push((duration * i) / (frameCount + 1))
      }

      const maxWidth = 360
      const scale = Math.min(1, maxWidth / (video.videoWidth || 360))
      canvas.width = (video.videoWidth || 360) * scale
      canvas.height = (video.videoHeight || 360) * scale

      for (const time of intervals) {
        await new Promise((seekResolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const base64 = canvas.toDataURL('image/jpeg', 0.7)
              frames.push(base64)
            } catch (err) {
              console.warn('Frame capture error:', err)
            }
            seekResolve()
          }

          video.addEventListener('seeked', onSeeked)
          video.currentTime = Math.min(time, duration - 0.1)
        })
      }

      cleanup()
      resolve(frames)
    }

    video.onerror = () => {
      console.warn('Video load error for frame inspection')
      cleanup()
      resolve([])
    }

    setTimeout(() => {
      if (frames.length === 0) {
        cleanup()
        resolve([])
      }
    }, 8000)
  })
}

/**
 * Kiểm duyệt và phân loại nội dung Video bằng Google Gemini 2.5 Flash Vision
 * Nhận diện 18+ / NSFW để tự động gắn nhãn làm mờ (Blur) và giới hạn chỉ người dùng >= 18 tuổi mới xem được
 * @param {File|string} videoSource
 * @returns {Promise<{ isAllowed: boolean, isNsfw: boolean, reason?: string }>}
 */
export async function checkVideoVisualSafety(videoSource) {
  try {
    const frames = await extractVideoKeyframes(videoSource, 4)
    if (!frames || frames.length === 0) {
      return { isAllowed: true, isNsfw: false }
    }

    const prompt = `You are RanMet AI Visual Safety Classifier.
Analyze these video frames.
Classify into:
1. "NSFW: [reason]" - if it contains adult 18+ sexual content, hentai, anime nudity, erotic acts, sexual intercourse. (These will be age-gated and blurred).
2. "ILLEGAL: [reason]" - if it contains extreme real-world violence, terrorism, or child abuse (strictly prohibited).
3. "SAFE" - normal safe video.

Respond with ONLY one classification.`

    const visionResult = await callGeminiVision(prompt, frames)

    // Nếu bị Gemini Safety filter chặn hoặc trả về 18+/NSFW
    if (!visionResult.isSafe || visionResult.reason?.includes('18+') || visionResult.reason?.includes('nhạy cảm') || visionResult.reason?.includes('khiêu dâm') || visionResult.reason?.includes('NSFW')) {
      return {
        isAllowed: true,
        isNsfw: true,
        reason: 'Nội dung 18+ / NSFW (Tự động làm mờ và giới hạn người dùng trên 18 tuổi)'
      }
    }

    return { isAllowed: true, isNsfw: false }
  } catch (err) {
    console.error('Visual moderation error:', err)
    return { isAllowed: true, isNsfw: false }
  }
}

/**
 * Kiểm duyệt tệp ảnh: Phân loại 18+ NSFW
 * @param {string} imageBase64OrUrl
 * @returns {Promise<{ isAllowed: boolean, isNsfw: boolean, reason?: string }>}
 */
export async function checkImageVisualSafety(imageBase64OrUrl) {
  if (!imageBase64OrUrl) return { isAllowed: true, isNsfw: false }

  try {
    const prompt = `You are RanMet AI Visual Safety Classifier.
Analyze this uploaded image. Check if it contains 18+ nudity, sexual organs, hentai, or adult content.
If NSFW/18+, respond "NSFW: [reason]". Otherwise respond "SAFE".`

    const visionResult = await callGeminiVision(prompt, [imageBase64OrUrl])
    if (!visionResult.isSafe || visionResult.reason?.includes('18+') || visionResult.reason?.includes('nhạy cảm') || visionResult.reason?.includes('khiêu dâm') || visionResult.reason?.includes('NSFW')) {
      return {
        isAllowed: true,
        isNsfw: true,
        reason: 'Hình ảnh 18+ / NSFW (Đã làm mờ bảo vệ)'
      }
    }

    return { isAllowed: true, isNsfw: false }
  } catch (err) {
    console.error('Image visual moderation error:', err)
    return { isAllowed: true, isNsfw: false }
  }
}
