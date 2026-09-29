import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import {
  removeProductLocally,
  useCategories,
  useEnsureProductsLoaded,
  useProducts,
  useProductsError,
} from './components/store'
import { ProductFormModal } from './components/ProductFormModal'
import { deleteProduct, updateProduct } from '../../lib/api'

function parsePricePerDay(display: string): number {
  const match = display.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
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
  const [pricePerDay, setPricePerDay] = useState(0)
  const [stock, setStock] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (products.length === 0) return
    if (products.some((p) => p.id === activeId)) return

    const fromUrl = products.find((p) => p.id === idFromUrl)
    selectProduct((fromUrl ?? products[0]).id)
  }, [products])

  function selectProduct(id: number) {
    setActiveId(id)
    setFormError(null)
    const p = products.find((x) => x.id === id)
    if (p) {
      setName(p.name)
      setDescription(p.description)
      setCategory(p.category)
      setPricePerDay(parsePricePerDay(p.price))
      setStock(p.stock)
    }
  }

  function handleProductCreated(productName: string) {
    setShowAddForm(false)
    const created = products.find((p) => p.name === productName)
    if (created) selectProduct(created.id)
  }

  async function handleSave() {
    if (!active) return
    setSaving(true)
    setFormError(null)
    try {
      await updateProduct(active.id, {
        name,
        description,
        price: pricePerDay,
        imageUrl: active.icon.startsWith('http') || active.icon.startsWith('data:') ? active.icon : '',
        category,
        stock,
      })
      window.location.reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'บันทึกการแก้ไขไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!active) return
    setDeleting(true)
    setFormError(null)
    try {
      await deleteProduct(active.id)
      removeProductLocally(active.id)
      setActiveId(undefined)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ลบสินค้าไม่สำเร็จ')
    } finally {
      setDeleting(false)
    }
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

      {productsError && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {productsError}
        </div>
      )}

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
            <div className="fx-card">
              {formError && (
                <div style={{ color: 'var(--fx-danger)', marginBottom: 14, fontSize: '0.9rem' }}>{formError}</div>
              )}

              <div className="fx-field" style={{ marginTop: 0 }}>
                <label htmlFor="fx-edit-name">ชื่อชุด</label>
                <input id="fx-edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="fx-field">
                <label htmlFor="fx-edit-desc">รายละเอียด</label>
                <input id="fx-edit-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="fx-field">
                <label htmlFor="fx-edit-category">หมวดหมู่</label>
                <select id="fx-edit-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fx-field">
                <label htmlFor="fx-edit-price">ราคาเช่าต่อวัน (บาท)</label>
                <input
                  id="fx-edit-price"
                  type="number"
                  min={1}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                />
              </div>
              <div className="fx-field">
                <label htmlFor="fx-edit-stock">จำนวนคงเหลือ (ระดับสินค้า)</label>
                <input id="fx-edit-stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button type="button" className="fx-btn" onClick={handleSave} disabled={saving || deleting}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button type="button" className="fx-btn fx-btn-danger" onClick={handleDelete} disabled={saving || deleting}>
                  {deleting ? 'กำลังลบ...' : 'ลบสินค้า'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <ProductFormModal onClose={() => setShowAddForm(false)} onCreated={handleProductCreated} />
      )}
    </FxLayout>
  )
}
