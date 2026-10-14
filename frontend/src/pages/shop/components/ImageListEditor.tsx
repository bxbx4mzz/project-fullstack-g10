import { useState } from 'react'
import { resolveImageUrl, uploadProductImage } from '../../../lib/api'

const MAX_IMAGES = 8
const MAX_BYTES = 5 * 1024 * 1024

type ImageListEditorProps = {
  images: string[]
  onChange: (images: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  onError?: (message: string) => void
}

export function ImageListEditor({ images, onChange, onUploadingChange, onError }: ImageListEditorProps) {
  const [uploading, setUploading] = useState(0)
  const [linkInput, setLinkInput] = useState('')
  const remaining = MAX_IMAGES - images.length - uploading

  function setUploadingCount(update: (n: number) => number) {
    setUploading((n) => {
      const next = update(n)
      onUploadingChange?.(next > 0)
      return next
    })
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList)
    const tooBig = files.filter((f) => f.size > MAX_BYTES)
    const accepted = files.filter((f) => f.size <= MAX_BYTES).slice(0, Math.max(remaining, 0))
    if (tooBig.length) onError?.(`ข้ามไฟล์ที่ใหญ่เกิน 5 MB: ${tooBig.map((f) => f.name).join(', ')}`)
    if (files.length - tooBig.length > accepted.length) onError?.(`ใส่รูปได้ไม่เกิน ${MAX_IMAGES} รูป`)
    if (accepted.length === 0) return

    setUploadingCount((n) => n + accepted.length)
    let current = images
    for (const file of accepted) {
      try {
        const url = await uploadProductImage(file)
        current = [...current, url]
        onChange(current)
      } catch (err) {
        onError?.(`อัปโหลด ${file.name} ไม่สำเร็จ: ${err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'}`)
      } finally {
        setUploadingCount((n) => n - 1)
      }
    }
  }

  function addLink() {
    const url = linkInput.trim()
    if (!url) return
    if (!/^https?:\/\//.test(url)) {
      onError?.('ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://')
      return
    }
    if (url.length > 255) {
      onError?.('ลิงก์รูปภาพยาวเกิน 255 ตัวอักษร')
      return
    }
    if (remaining <= 0) {
      onError?.(`ใส่รูปได้ไม่เกิน ${MAX_IMAGES} รูป`)
      return
    }
    onChange([...images, url])
    setLinkInput('')
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function makeCover(index: number) {
    onChange([images[index], ...images.filter((_, i) => i !== index)])
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="fx-image-grid">
          {images.map((url, i) => (
            <div className={`fx-image-tile${i === 0 ? ' fx-image-cover' : ''}`} key={`${url}-${i}`}>
              <img src={resolveImageUrl(url)} alt={`รูปที่ ${i + 1}`} />
              {i === 0 && <span className="fx-image-badge">รูปหลัก</span>}
              <div className="fx-image-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="เลื่อนไปซ้าย">
                  ‹
                </button>
                {i !== 0 && (
                  <button type="button" onClick={() => makeCover(i)} aria-label="ตั้งเป็นรูปหลัก" title="ตั้งเป็นรูปหลัก">
                    ★
                  </button>
                )}
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="เลื่อนไปขวา">
                  ›
                </button>
                <button
                  type="button"
                  className="fx-image-remove"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  aria-label="ลบรูป"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div className="fx-image-tile fx-image-loading" key={`loading-${i}`}>
              กำลังอัปโหลด...
            </div>
          ))}
        </div>
      )}
      {images.length === 0 && uploading > 0 && <p className="fx-page-subtitle">กำลังอัปโหลด {uploading} รูป...</p>}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={remaining <= 0}
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <span className="fx-page-subtitle" style={{ display: 'block', fontSize: '0.78rem', marginTop: 4 }}>
        เลือกได้หลายรูปพร้อมกัน (JPG, PNG, WebP ไม่เกิน 5 MB ต่อรูป สูงสุด {MAX_IMAGES} รูป) — รูปแรกจะใช้เป็นรูปหน้าร้าน
      </span>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          type="url"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="หรือวางลิงก์ไฟล์รูป https://...jpg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addLink()
            }
          }}
        />
        <button type="button" className="fx-btn fx-btn-ghost" onClick={addLink} disabled={!linkInput.trim()}>
          เพิ่มลิงก์
        </button>
      </div>
    </div>
  )
}
