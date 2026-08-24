// ============================================================
// RanMet Real File & Media Uploader
// Đọc và chuyển đổi tệp từ thiết bị (PC/Mobile) trực tiếp
// ============================================================

/**
 * Đọc file từ thiết bị và chuyển đổi thành URL hiển thị trực tiếp (Data URL / Blob)
 * @param {File} file - Tệp được chọn từ input file
 * @param {number} maxSizeMB - Dung lượng tối đa cho phép (MB)
 * @returns {Promise<{ url: string, name: string, size: number, type: string }>}
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
        type: file.type
      })
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
