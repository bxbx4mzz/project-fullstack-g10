import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import {
  addCategory,
  isImageUrl,
  refreshProduct,
  removeProductLocally,
  useCategories,
  useEnsureProductsLoaded,
  useProducts,
  useProductsError,
  type Product,
} from './components/store'
import { ProductFormModal } from './components/ProductFormModal'
import { ImageListEditor } from './components/ImageListEditor'
import {
  createVariant,
  deleteProduct,
  deleteVariant,
  updateProduct,
  updateVariant,
  type ApiProductVariant,
  type CreateProductVariantInput,
} from '../../lib/api'
import { FxAlert } from './components/FxAlert'

type VariantDraft = CreateProductVariantInput & { id?: number }

const PRICE_FIELDS: { key: keyof CreateProductVariantInput; label: string }[] = [
  { key: 'price3Day', label: '3 วัน' },
  { key: 'price5Day', label: '5 วัน' },
  { key: 'price7Day', label: '7 วัน' },
  { key: 'extraDayPrice', label: 'วันเกิน' },
]

function parsePricePerDay(display: string): number {
  const match = display.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function toDraft(v: ApiProductVariant): VariantDraft {
  return {
    id: v.id,
    size: v.size ?? '',
    color: v.color ?? '',
    stockQty: v.stockQty,
    price3Day: Number(v.price3Day),
    price5Day: Number(v.price5Day),
    price7Day: Number(v.price7Day),
    extraDayPrice: Number(v.extraDayPrice),
  }
}

function newDraft(pricePerDay: number): VariantDraft {
  return {
    size: '',
    color: '',
    stockQty: 1,
    price3Day: pricePerDay * 3,
    price5Day: pricePerDay * 5,
    price7Day: pricePerDay * 7,
    extraDayPrice: pricePerDay,
  }
}

function sameVariant(a: VariantDraft, b: VariantDraft): boolean {
  return (
    a.size === b.size &&
    a.color === b.color &&
    a.stockQty === b.stockQty &&
    PRICE_FIELDS.every(({ key }) => Number(a[key]) === Number(b[key]))
  )
}

type AdminEditPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminEditPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminEditPageProps) {
  useEnsureProductsLoaded()
  const products = useProducts()
  const productsError = useProductsError()
  const categories = useCategories()
  const [searchParams] = useSearchParams()
  const idFromUrl = Number(searchParams.get('id'))

  const [activeId, setActiveId] = useState<number | undefined>(undefined)
  const [showAddForm, setShowAddForm] = useState(false)
  const active = products.find((p) => p.id === activeId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [pricePerDay, setPricePerDay] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [icon, setIcon] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [newVariant, setNewVariant] = useState<VariantDraft | null>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [busyVariant, setBusyVariant] = useState<number | 'new' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (products.length === 0) return
    if (products.some((p) => p.id === activeId)) return
    const fromUrl = products.find((p) => p.id === idFromUrl)
    loadForm((fromUrl ?? products[0]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  function loadForm(p: Product) {
    setActiveId(p.id)
    setName(p.name)
    setDescription(p.description)
    setCategory(p.category)
    setPricePerDay(parsePricePerDay(p.price))
    setImages(p.images)
    setIcon(isImageUrl(p.icon) ? '' : p.icon)
    setVariants(p.variants.map(toDraft))
    setNewVariant(null)
    setError(null)
    setNotice(null)
  }

  function selectProduct(id: number) {
    const p = products.find((x) => x.id === id)
    if (p) loadForm(p)
  }

  function handleProductCreated(productName: string) {
    setShowAddForm(false)
    const created = products.find((p) => p.name === productName)
    if (created) loadForm(created)
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    addCategory(trimmed)
    setCategory(trimmed)
    setNewCategory('')
  }

  async function reloadActive(message: string, keepVariantDrafts = false) {
    if (!active) return
    const fresh = await refreshProduct(active.id)
    if (!keepVariantDrafts) setVariants(fresh.variants.map(toDraft))
    setNotice(message)
  }

  async function handleSave() {
    if (!active) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      await updateProduct(active.id, {
        name: name.trim(),
        description: description.trim(),
        price: pricePerDay,
        imageUrl: images.length > 0 ? images[0] : icon.trim(),
        imageUrls: images,
        category,
        stock: active.stock,
      })
      await reloadActive('บันทึกข้อมูลสินค้าเรียบร้อย', true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกการแก้ไขไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  function updateDraft(index: number, patch: Partial<VariantDraft>) {
    setVariants((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  function variantPayload(v: VariantDraft): CreateProductVariantInput {
    return {
      size: v.size.trim(),
      color: v.color.trim(),
      stockQty: v.stockQty,
      price3Day: v.price3Day,
      price5Day: v.price5Day,
      price7Day: v.price7Day,
      extraDayPrice: v.extraDayPrice,
    }
  }

  async function saveVariant(v: VariantDraft) {
    if (!active || v.id === undefined) return
    setBusyVariant(v.id)
    setError(null)
    setNotice(null)
    try {
      await updateVariant(active.id, v.id, variantPayload(v))
      await reloadActive(`บันทึกไซซ์ ${v.size || 'Free Size'} / สี ${v.color || '-'} เรียบร้อย`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไซซ์/สีไม่สำเร็จ')
    } finally {
      setBusyVariant(null)
    }
  }

  async function removeVariant(v: VariantDraft) {
    if (!active || v.id === undefined) return
    if (!window.confirm(`ลบไซซ์ ${v.size || 'Free Size'} / สี ${v.color || '-'} ใช่ไหม?`)) return
    setBusyVariant(v.id)
    setError(null)
    setNotice(null)
    try {
      await deleteVariant(active.id, v.id)
      await reloadActive('ลบไซซ์/สีเรียบร้อย')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบไซซ์/สีไม่สำเร็จ')
    } finally {
      setBusyVariant(null)
    }
  }

  async function addVariant() {
    if (!active || !newVariant) return
    setBusyVariant('new')
    setError(null)
    setNotice(null)
    try {
      await createVariant(active.id, variantPayload(newVariant))
      setNewVariant(null)
      await reloadActive('เพิ่มไซซ์/สีเรียบร้อย')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มไซซ์/สีไม่สำเร็จ')
    } finally {
      setBusyVariant(null)
    }
  }

  async function handleDelete() {
    if (!active) return
    if (!window.confirm(`ลบสินค้า "${active.name}" ใช่ไหม? ลบแล้วกู้คืนไม่ได้`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteProduct(active.id)
      removeProductLocally(active.id)
      setActiveId(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบสินค้าไม่สำเร็จ')
    } finally {
      setDeleting(false)
    }
  }

  const categoryOptions = category && !categories.includes(category) ? [...categories, category] : categories
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0)
  const originalVariants = active?.variants.map(toDraft) ?? []

  function renderVariantInputs(v: VariantDraft, onPatch: (patch: Partial<VariantDraft>) => void) {
    return (
      <>
        <td>
          <input type="text" value={v.size} placeholder="Free Size" onChange={(e) => onPatch({ size: e.target.value })} />
        </td>
        <td>
          <input type="text" value={v.color} placeholder="-" onChange={(e) => onPatch({ color: e.target.value })} />
        </td>
        <td>
          <input type="number" min={0} value={v.stockQty} onChange={(e) => onPatch({ stockQty: Number(e.target.value) })} />
        </td>
        {PRICE_FIELDS.map(({ key }) => (
          <td key={key}>
            <input type="number" min={0} value={v[key]} onChange={(e) => onPatch({ [key]: Number(e.target.value) })} />
          </td>
        ))}
      </>
    )
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div>
          <h1>แก้ไขสินค้า</h1>
          <p className="fx-page-subtitle">เลือกชุดจากรายการ แล้วแก้ไขรายละเอียดด้านขวา</p>
        </div>
        <button type="button" className="fx-btn" onClick={() => setShowAddForm(true)}>
          + Add product
        </button>
      </div>

      {productsError && <FxAlert>{productsError}</FxAlert>}

      {products.length === 0 && !productsError && <p className="fx-page-subtitle">กำลังโหลดสินค้า...</p>}

      {products.length > 0 && (
        <div className="fx-edit-layout">
          <div className="fx-edit-list">
            {products.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`fx-edit-list-item${p.id === activeId ? ' active' : ''}`}
                onClick={() => selectProduct(p.id)}
              >
                <span>{p.name}</span>
                <span>{p.price}</span>
              </button>
            ))}
          </div>

          {active && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              {error && <FxAlert onClose={() => setError(null)}>{error}</FxAlert>}
              {notice && (
                <FxAlert tone="success" title="สำเร็จ" onClose={() => setNotice(null)}>
                  {notice}
                </FxAlert>
              )}

              <div className="fx-card">
                <h2 className="fx-edit-section-title">ข้อมูลสินค้า</h2>
                <div className="fx-field" style={{ marginTop: 0 }}>
                  <label htmlFor="fx-edit-name">ชื่อชุด</label>
                  <input id="fx-edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="fx-field">
                  <label htmlFor="fx-edit-desc">รายละเอียด</label>
                  <textarea id="fx-edit-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="fx-field">
                  <label htmlFor="fx-edit-category">หมวดหมู่</label>
                  <select id="fx-edit-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="เพิ่มหมวดหมู่ใหม่ เช่น accessories"
                    />
                    <button type="button" className="fx-btn fx-btn-ghost" onClick={handleAddCategory} disabled={!newCategory.trim()}>
                      Add tag
                    </button>
                  </div>
                </div>
                <div className="fx-field">
                  <label htmlFor="fx-edit-price">ราคาเช่าต่อวัน (บาท) — ใช้แสดงหน้าร้าน</label>
                  <input
                    id="fx-edit-price"
                    type="number"
                    min={0}
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                  />
                </div>

                <div className="fx-field">
                  <label>รูปสินค้า</label>
                  <ImageListEditor images={images} onChange={setImages} onUploadingChange={setUploading} onError={setError} />
                </div>
                {images.length === 0 && (
                  <div className="fx-field">
                    <label htmlFor="fx-edit-icon">ไอคอนแทนรูป (ใช้เมื่อไม่มีรูป)</label>
                    <input id="fx-edit-icon" type="text" value={icon} placeholder="เช่น 👗" onChange={(e) => setIcon(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button type="button" className="fx-btn" onClick={handleSave} disabled={saving || uploading || deleting}>
                    {saving ? 'กำลังบันทึก...' : uploading ? 'รออัปโหลดรูป...' : 'บันทึกข้อมูลสินค้า'}
                  </button>
                </div>
              </div>

              <div className="fx-card">
                <h2 className="fx-edit-section-title">
                  ไซซ์ / สี / จำนวน / ราคา
                  <span className="fx-page-subtitle" style={{ fontWeight: 400, marginLeft: 8, fontSize: '0.85rem' }}>
                    รวมคงเหลือ {totalStock} ชิ้น
                  </span>
                </h2>
                <div className="fx-variant-table-wrap">
                  <table className="fx-table fx-variant-table">
                    <thead>
                      <tr>
                        <th>ไซซ์</th>
                        <th>สี</th>
                        <th>จำนวน</th>
                        {PRICE_FIELDS.map(({ key, label }) => (
                          <th key={key}>ราคา {label}</th>
                        ))}
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => {
                        const original = originalVariants.find((o) => o.id === v.id)
                        const changed = !original || !sameVariant(original, v)
                        return (
                          <tr key={v.id}>
                            {renderVariantInputs(v, (patch) => updateDraft(i, patch))}
                            <td className="fx-variant-actions">
                              <button
                                type="button"
                                className="fx-btn"
                                onClick={() => saveVariant(v)}
                                disabled={!changed || busyVariant !== null}
                              >
                                {busyVariant === v.id ? '...' : 'บันทึก'}
                              </button>
                              <button
                                type="button"
                                className="fx-btn fx-btn-ghost"
                                onClick={() => removeVariant(v)}
                                disabled={busyVariant !== null || variants.length <= 1}
                                title={variants.length <= 1 ? 'ต้องมีไซซ์/สีอย่างน้อย 1 แบบ' : undefined}
                              >
                                ลบ
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {newVariant && (
                        <tr className="fx-variant-new">
                          {renderVariantInputs(newVariant, (patch) => setNewVariant((d) => (d ? { ...d, ...patch } : d)))}
                          <td className="fx-variant-actions">
                            <button type="button" className="fx-btn" onClick={addVariant} disabled={busyVariant !== null}>
                              {busyVariant === 'new' ? '...' : 'เพิ่ม'}
                            </button>
                            <button type="button" className="fx-btn fx-btn-ghost" onClick={() => setNewVariant(null)}>
                              ยกเลิก
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {!newVariant && (
                  <button
                    type="button"
                    className="fx-btn fx-btn-ghost"
                    style={{ marginTop: 12 }}
                    onClick={() => setNewVariant(newDraft(pricePerDay))}
                  >
                    + เพิ่มไซซ์/สี
                  </button>
                )}
              </div>

              <div className="fx-card fx-danger-zone">
                <div>
                  <strong>ลบสินค้านี้</strong>
                  <p className="fx-page-subtitle" style={{ margin: '4px 0 0' }}>
                    ลบไม่ได้ถ้ายังมีการจองที่ยังไม่จบ — ชุดจะถูกเอาออกจากตะกร้าและชุดโปรดของลูกค้าด้วย
                  </p>
                </div>
                <button type="button" className="fx-btn fx-btn-danger" onClick={handleDelete} disabled={saving || deleting}>
                  {deleting ? 'กำลังลบ...' : 'ลบสินค้า'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddForm && <ProductFormModal onClose={() => setShowAddForm(false)} onCreated={handleProductCreated} />}
    </FxLayout>
  )
}
