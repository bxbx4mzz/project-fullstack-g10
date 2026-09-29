import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import { useEnsureProductsLoaded, useProducts, type Product } from './components/store'
import { VariantPickerModal } from './components/VariantPickerModal'
import { ProductThumb } from './components/ProductThumb'
import { createStaffBooking } from '../../lib/api'

type BookingLine = {
  variantId: number
  name: string
  icon: string
  size: string
  color: string
  qty: number
}

type AdminBookingPageProps = {
  brand?: string
  navItems?: FxNavItem[]
  ordersPath?: string
}

export function AdminBookingPage({
  brand = 'Admin - Clothing Rental Shop',
  navItems = adminNavItems,
  ordersPath = '/admin-panel/orders',
}: AdminBookingPageProps) {
  const navigate = useNavigate()
  useEnsureProductsLoaded()
  const products = useProducts()

  const [lines, setLines] = useState<BookingLine[]>([])
  const [picking, setPicking] = useState<Product | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [rentDate, setRentDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addLine(product: Product, variantId: number, size: string, color: string, qty: number) {
    setLines((prev) => {
      const existing = prev.findIndex((l) => l.variantId === variantId)
      if (existing >= 0) {
        return prev.map((l, i) => (i === existing ? { ...l, qty: l.qty + qty } : l))
      }
      return [...prev, { variantId, name: product.name, icon: product.icon, size, color, qty }]
    })
    setPicking(null)
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const canSubmit = customerName.trim() && rentDate && returnDate && lines.length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError(null)
    try {
      await createStaffBooking({
        customerName: customerName.trim(),
        shippingAddress: 'รับที่ร้าน',
        rentDate,
        returnDate,
        shippingMethod: 'PICKUP',
        items: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
      })
      navigate(ordersPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกการจองไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>Storefront</h1>
      <p className="fx-page-subtitle">
        สำหรับลูกค้าที่มาซื้อ/เช่าที่หน้าร้าน — เลือกชุด/ไซส์/สี แล้วบันทึกข้อมูลไว้เฉยๆ ไม่ต้องผ่านหน้าชำระเงิน (ลูกค้าจ่ายที่ร้านแล้ว)
      </p>

      {error && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="fx-card" style={{ marginBottom: 16 }}>
          <div className="fx-field" style={{ marginTop: 0 }}>
            <label htmlFor="fx-booking-customer">ชื่อลูกค้า</label>
            <input
              id="fx-booking-customer"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ชื่อ-นามสกุลลูกค้า"
              required
            />
          </div>
          <div className="fx-field">
            <label htmlFor="fx-booking-rent">วันที่เริ่มเช่า</label>
            <input id="fx-booking-rent" type="date" value={rentDate} onChange={(e) => setRentDate(e.target.value)} required />
          </div>
          <div className="fx-field">
            <label htmlFor="fx-booking-return">วันที่ต้องคืน</label>
            <input
              id="fx-booking-return"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>
        </div>

        <h2 style={{ fontSize: '1.1rem' }}>เลือกชุดที่เช่า</h2>
        <p className="fx-page-subtitle">กด "+ เพิ่ม" แล้วเลือกไซส์/สี/จำนวนของชุดนั้น</p>
        <div className="fx-grid">
          {products.map((p) => (
            <div className="fx-card fx-product" key={p.id}>
              <ProductThumb icon={p.icon} />
              <div className="fx-product-name">{p.name}</div>
              <div className="fx-product-price">{p.price}</div>
              <button type="button" className="fx-btn" onClick={() => setPicking(p)}>
                + เพิ่ม
              </button>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="fx-card" style={{ marginTop: 16 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>รายการที่เลือก</p>
            <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none' }}>
              {lines.map((l, i) => (
                <li
                  key={l.variantId}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}
                >
                  <span>
                    {l.icon} {l.name} • ไซส์ {l.size} • สี {l.color} × {l.qty}
                  </span>
                  <button type="button" className="fx-btn fx-btn-ghost" onClick={() => removeLine(i)}>
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="fx-btn" style={{ marginTop: 20 }} disabled={!canSubmit}>
          {submitting ? 'กำลังบันทึก...' : 'บันทึกการจอง'}
        </button>
      </form>

      {picking && (
        <VariantPickerModal
          product={picking}
          onClose={() => setPicking(null)}
          actions={[
            {
              label: 'เพิ่มลงการจอง',
              onSelect: (choice) => {
                addLine(picking, choice.variantId, choice.size, choice.color, choice.qty)
              },
            },
          ]}
        />
      )}
    </FxLayout>
  )
}
