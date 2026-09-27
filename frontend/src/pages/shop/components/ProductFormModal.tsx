import { useState } from 'react'
import { addCategory, addProduct, useCategories } from './store'

type ProductFormModalProps = {
  onClose: () => void
  onCreated: (productName: string) => void
}

export function ProductFormModal({ onClose, onCreated }: ProductFormModalProps) {
  const categories = useCategories()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [category, setCategory] = useState(categories[0] ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [stock, setStock] = useState(1)
  const [sizes, setSizes] = useState('Free Size')
  const [colors, setColors] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    addCategory(trimmed)
    setCategory(trimmed)
    setNewCategory('')
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImageUrl(dataUrl)
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || pricePerDay <= 0 || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        category,
        imageUrl: imageUrl.trim(),
        pricePerDay,
        stock,
        sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
      })
      onCreated(name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกสินค้าไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fx-modal-backdrop" onClick={onClose}>
      <div className="fx-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>

        <h2 style={{ marginTop: 0 }}>Add product</h2>

        {error && (
          <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fx-field" style={{ marginTop: 0 }}>
            <label htmlFor="fx-pf-name">ชื่อชุด</label>
            <input id="fx-pf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-desc">รายละเอียด</label>
            <input id="fx-pf-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-price">ราคาเช่าต่อวัน (บาท)</label>
            <input
              id="fx-pf-price"
              type="number"
              min={1}
              value={pricePerDay || ''}
              onChange={(e) => setPricePerDay(Number(e.target.value))}
              required
            />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-image-file">รูปสินค้า (อัปโหลดจากเครื่อง)</label>
            <input
              id="fx-pf-image-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="ตัวอย่างรูปสินค้า"
                style={{ marginTop: 10, width: 96, height: 96, objectFit: 'cover', borderRadius: 10 }}
              />
            )}
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-icon">หรือใส่ emoji / URL รูปภาพแทน</label>
            <input
              id="fx-pf-icon"
              type="text"
              value={imagePreview ? '' : imageUrl}
              placeholder={imagePreview ? 'ใช้รูปที่อัปโหลดไว้ด้านบนแล้ว' : '👕 หรือ https://...'}
              disabled={!!imagePreview}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-stock">จำนวนคงเหลือ</label>
            <input
              id="fx-pf-stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-sizes">ไซส์ (คั่นด้วยจุลภาค)</label>
            <input id="fx-pf-sizes" type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-colors">สี (คั่นด้วยจุลภาค)</label>
            <input id="fx-pf-colors" type="text" value={colors} onChange={(e) => setColors(e.target.value)} />
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-category">หมวดหมู่</label>
            <select id="fx-pf-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="fx-field">
            <label htmlFor="fx-pf-new-category">เพิ่มหมวดหมู่ใหม่</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="fx-pf-new-category"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="เช่น accessories"
              />
              <button type="button" className="fx-btn fx-btn-ghost" onClick={handleAddCategory}>
                Add tag
              </button>
            </div>
          </div>

          <button type="submit" className="fx-btn" style={{ width: '100%', marginTop: 20 }} disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
          </button>
        </form>
      </div>
    </div>
  )
}
