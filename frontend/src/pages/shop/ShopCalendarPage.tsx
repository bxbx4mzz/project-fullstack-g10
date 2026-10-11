import { useEffect, useMemo, useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { FxCalendarGrid } from './components/FxCalendarGrid'
import { userNavItems } from './components/navItems'
import { MONTH_NAMES, coversDay, monthRange } from './components/calendarUtils'
import {
  fetchProductVariants,
  fetchProducts,
  fetchVariantCalendar,
  type ApiProduct,
  type ApiProductVariant,
  type VariantCalendar,
} from '../../lib/api'
import { FxAlert } from './components/FxAlert'

export function ShopCalendarPage() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<number | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [productId, setProductId] = useState<number | null>(null)
  const [variants, setVariants] = useState<ApiProductVariant[]>([])
  const [variantId, setVariantId] = useState<number | null>(null)
  const [calendar, setCalendar] = useState<VariantCalendar | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดสินค้าไม่สำเร็จ'))
  }, [])

  useEffect(() => {
    setVariants([])
    setVariantId(null)
    if (productId === null) return
    fetchProductVariants(productId)
      .then((vs) => {
        setVariants(vs)
        if (vs.length > 0) setVariantId(vs[0].id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไซซ์/สีไม่สำเร็จ'))
  }, [productId])

  useEffect(() => {
    setCalendar(null)
    if (variantId === null) return
    let cancelled = false
    const { start, end } = monthRange(cursor.year, cursor.month)
    fetchVariantCalendar(variantId, start, end)
      .then((data) => !cancelled && setCalendar(data))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'โหลดปฏิทินไม่สำเร็จ'))
    return () => {
      cancelled = true
    }
  }, [variantId, cursor])

  const bookedQtyByDay = useMemo(() => {
    const map = new Map<number, number>()
    if (!calendar) return map
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const qty = calendar.bookings
        .filter((b) => coversDay(b.start, b.end, cursor.year, cursor.month, d))
        .reduce((sum, b) => sum + b.qty, 0)
      if (qty > 0) map.set(d, qty)
    }
    return map
  }, [calendar, cursor])

  const fullDays = calendar
    ? [...bookedQtyByDay.entries()].filter(([, qty]) => qty >= calendar.stockQty).map(([d]) => d)
    : []

  function shiftMonth(delta: number) {
    setSelected(null)
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const remaining = selected && calendar ? Math.max(calendar.stockQty - (bookedQtyByDay.get(selected) ?? 0), 0) : null

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ปฏิทินการจอง</h1>
      <p className="fx-page-subtitle">เลือกชุดเพื่อดูวันที่ว่างให้เช่า</p>

      {error && (
        <FxAlert onClose={() => setError(null)}>
          {error}
        </FxAlert>
      )}

      <div className="fx-card" style={{ marginBottom: 16 }}>
        <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div className="fx-field" style={{ marginTop: 0 }}>
            <label htmlFor="fx-cal-product">ชุด</label>
            <select
              id="fx-cal-product"
              value={productId ?? ''}
              onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- เลือกชุด --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fx-field" style={{ marginTop: 0 }}>
            <label htmlFor="fx-cal-variant">ไซซ์ / สี</label>
            <select
              id="fx-cal-variant"
              value={variantId ?? ''}
              onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : null)}
              disabled={variants.length === 0}
            >
              {variants.length === 0 && <option value="">-</option>}
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {[v.size, v.color].filter(Boolean).join(' / ') || v.sku}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="fx-card">
        <div className="fx-cal-head">
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <strong>
            {MONTH_NAMES[cursor.month]} {cursor.year + 543}
          </strong>
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>
        <FxCalendarGrid year={cursor.year} month={cursor.month} bookedDays={fullDays} onSelectDay={setSelected} />
        <p className="fx-page-subtitle" style={{ marginTop: 12 }}>
          วันที่ไฮไลต์ = ชุดนี้ถูกจองเต็มแล้ว (รวมช่วงเตรียมชุดหลังคืน)
        </p>

        {selected && (
          <p style={{ marginTop: 8 }}>
            วันที่ <strong>{selected}</strong>:{' '}
            {calendar === null || remaining === null ? (
              'กรุณาเลือกชุดก่อน'
            ) : remaining > 0 ? (
              <>
                ว่าง <strong>{remaining}</strong> จาก {calendar.stockQty} ชิ้น
              </>
            ) : (
              <strong style={{ color: 'var(--fx-danger)' }}>เต็มแล้ว</strong>
            )}
          </p>
        )}
      </div>
    </FxLayout>
  )
}
