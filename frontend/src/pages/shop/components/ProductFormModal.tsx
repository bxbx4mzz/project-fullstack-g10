import { useState } from 'react'
import { addCategory, addProduct, useCategories } from './store'
import { FxAlert } from './FxAlert'
import { ImageListEditor } from './ImageListEditor'

type ProductFormModalProps = {
  onClose: () => void
  onCreated: (productName: string) => void
}

export function ProductFormModal({ onClose, onCreated }: ProductFormModalProps) {
  const categories = useCategories()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerDay, setPricePerDay] = useState(0)
  const [icon, setIcon] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [category, setCategory] = useState(categories[0] ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [stock, setStock] = useState(1)
  const [sizes, setSizes] = useState('Free Size')
  const [colors, setColors] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    addCategory(trimmed)
    setCategory(trimmed)
    setNewCategory('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || pricePerDay <= 0 || submitting || uploading) return

    setSubmitting(true)
    setError(null)
    try {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        category,
        imageUrl: icon.trim(),
        imageUrls: images,
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
          <FxAlert onClose={() => setError(null)}>
            {error}
          </FxAlert>
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
            <label>รูปสินค้า</label>
            <ImageListEditor images={images} onChange={setImages} onUploadingChange={setUploading} onError={setError} />
          </div>

          {images.length === 0 && (
            <div className="fx-field">
              <label htmlFor="fx-pf-icon">ไอคอนแทนรูป (ใช้เมื่อไม่มีรูป)</label>
              <input id="fx-pf-icon" type="text" value={icon} placeholder="เช่น 👗" onChange={(e) => setIcon(e.target.value)} />
            </div>
          )}

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

          <button type="submit" className="fx-btn" style={{ width: '100%', marginTop: 20 }} disabled={submitting || uploading}>
            {submitting ? 'กำลังบันทึก...' : uploading ? 'รออัปโหลดรูป...' : 'บันทึกสินค้า'}
          </button>
        </form>
      </div>
    </div>
  )
}
