// ============================================================
// RanMet Real File & Media Uploader
// Tích hợp Supabase Storage Upload trực tiếp, tối ưu dung lượng và chống SQL Timeout
// ============================================================

/**
 * Upload file nhị phân trực tiếp lên Supabase Storage CDN
 * @param {any} supabase - Supabase Client
 * @param {File} file - File nhị phân từ input
 * @param {string} bucketName - Tên bucket (mặc định: 'videos' hoặc 'media')
 * @param {string} userId - ID người dùng hiện tại
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadMediaToSupabase(supabase, file, bucketName = 'videos', userId = 'public') {
  if (!file) {
    throw new Error('Vui lòng chọn một tệp hợp lệ.')
  }

  // Tách phần mở rộng của file
  const rawExt = file.name.split('.').pop() || 'mp4'
  const fileExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomKey = Math.random().toString(36).substring(2, 9)
  const fileName = `${Date.now()}_${randomKey}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Tự động thử tạo bucket 'videos' nếu chưa có
  try {
    await supabase.storage.createBucket(bucketName, { public: true })
  } catch (createErr) {
    // Bỏ qua nếu bucket đã tồn tại hoặc không đủ quyền
  }

  // Thử upload lên bucket chính
  const targetBuckets = [bucketName, 'videos', 'media', 'public', 'avatars']
  let lastError = null

  for (const b of targetBuckets) {
    try {
      const { data, error } = await supabase.storage
        .from(b)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'video/mp4'
        })

      if (!error && data) {
        const { data: pubUrlData } = supabase.storage.from(b).getPublicUrl(filePath)
        if (pubUrlData?.publicUrl) {
          return { url: pubUrlData.publicUrl, path: filePath }
        }
      } else if (error) {
        lastError = error
      }
    } catch (err) {
      lastError = err
    }
  }

  // Nếu không có bucket nào trong Supabase Storage được tạo sẵn
  const errMsg = lastError?.message || 'Bucket not found'
  throw new Error(`Lỗi Storage: ${errMsg}. Vui lòng tạo Bucket "videos" (chế độ Public) trong Supabase Dashboard -> Storage.`)
}

/**
 * Đọc file từ thiết bị và chuyển đổi thành URL hiển thị trực tiếp (Data URL / Blob Preview)
 * @param {File} file - Tệp được chọn từ input file
 * @param {number} maxSizeMB - Dung lượng tối đa cho phép (MB)
 * @returns {Promise<{ url: string, name: string, size: number, type: string, file: File }>}
 */
export function readFileAsDataUrl(file, maxSizeMB = 50) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Không tìm thấy tệp được chọn.'))
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return reject(new Error(`Tệp quá lớn (${fileSizeMB.toFixed(1)}MB). Vui lòng chọn tệp nhỏ hơn ${maxSizeMB}MB.`))
    }

    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        url: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      })
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
