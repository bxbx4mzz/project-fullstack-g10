import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { FxCalendarGrid } from './components/FxCalendarGrid'
import { userNavItems } from './components/navItems'
import { MONTH_NAMES, coversDay, formatThaiDate, monthRange } from './components/calendarUtils'
import { useEnsureProductsLoaded, useProducts } from './components/store'
import {
  fetchMyBookings,
  fetchVariantCalendar,
  type ApiBooking,
  type BookingStatus,
  type VariantCalendar,
} from '../../lib/api'
import { FxAlert } from './components/FxAlert'

type Tab = 'mine' | 'availability'

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'รอชำระเงิน',
  CONFIRMED: 'ยืนยันแล้ว รอจัดส่ง',
  SHIPPED: 'กำลังเช่า',
  RETURNED: 'คืนแล้ว',
  CANCELLED: 'ยกเลิกแล้ว',
}

export function ShopCalendarPage() {
  useEnsureProductsLoaded()
  const navigate = useNavigate()
  const products = useProducts()
  const now = new Date()
  const [tab, setTab] = useState<Tab>('mine')
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [myBookings, setMyBookings] = useState<ApiBooking[] | null>(null)

  const [productId, setProductId] = useState<number | null>(null)
  const [variantId, setVariantId] = useState<number | null>(null)
  const [calendar, setCalendar] = useState<VariantCalendar | null>(null)

  useEffect(() => {
    fetchMyBookings()
      .then(setMyBookings)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดการจองไม่สำเร็จ'))
  }, [])

  const variantLabel = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of products) {
      for (const v of p.variants) {
        map.set(v.id, `${p.name} (${[v.size, v.color].filter(Boolean).join(' / ')})`)
      }
    }
    return map
  }, [products])

  const variants = products.find((p) => p.id === productId)?.variants ?? []

  useEffect(() => {
    setCalendar(null)
    if (tab !== 'availability' || variantId === null) return
    let cancelled = false
    const { start, end } = monthRange(cursor.year, cursor.month)
    fetchVariantCalendar(variantId, start, end)
      .then((data) => !cancelled && setCalendar(data))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'โหลดปฏิทินไม่สำเร็จ'))
    return () => {
      cancelled = true
    }
  }, [tab, variantId, cursor])

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const activeBookings = useMemo(() => (myBookings ?? []).filter((b) => b.status !== 'CANCELLED'), [myBookings])

  const myDays = useMemo(() => {
    const days: number[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      if (activeBookings.some((b) => coversDay(b.rentDate, b.returnDate, cursor.year, cursor.month, d))) days.push(d)
    }
    return days
  }, [activeBookings, cursor, daysInMonth])

  const bookedQtyByDay = useMemo(() => {
    const map = new Map<number, number>()
    if (!calendar) return map
    for (let d = 1; d <= daysInMonth; d++) {
      const qty = calendar.bookings
        .filter((b) => coversDay(b.start, b.end, cursor.year, cursor.month, d))
        .reduce((sum, b) => sum + b.qty, 0)
      if (qty > 0) map.set(d, qty)
    }
    return map
  }, [calendar, cursor, daysInMonth])

  const fullDays = calendar ? [...bookedQtyByDay.entries()].filter(([, q]) => q >= calendar.stockQty).map(([d]) => d) : []
  const partialDays = calendar ? [...bookedQtyByDay.entries()].filter(([, q]) => q < calendar.stockQty).map(([d]) => d) : []

  function shiftMonth(delta: number) {
    setSelected(null)
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function switchTab(next: Tab) {
    setTab(next)
    setSelected(null)
  }

  function chooseProduct(id: number | null) {
    setProductId(id)
    setSelected(null)
    const first = products.find((p) => p.id === id)?.variants[0]
    setVariantId(first ? first.id : null)
  }

  const selectedBookings =
    selected === null ? [] : activeBookings.filter((b) => coversDay(b.rentDate, b.returnDate, cursor.year, cursor.month, selected))
  const remaining = selected !== null && calendar ? Math.max(calendar.stockQty - (bookedQtyByDay.get(selected) ?? 0), 0) : null

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ปฏิทินการจอง</h1>
      <p className="fx-page-subtitle">ดูวันที่คุณเช่าชุด หรือเช็ควันว่างของชุดที่สนใจ</p>

      {error && <FxAlert onClose={() => setError(null)}>{error}</FxAlert>}

      <div className="fx-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'active' : ''} onClick={() => switchTab('mine')}>
          การจองของฉัน
          {activeBookings.length > 0 && <span className="fx-tab-count">{activeBookings.length}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'availability'}
          className={tab === 'availability' ? 'active' : ''}
          onClick={() => switchTab('availability')}
        >
          เช็ควันว่างของชุด
        </button>
      </div>

      {tab === 'availability' && (
        <div className="fx-card" style={{ marginBottom: 16 }}>
          <div className="fx-edit-grid-2">
            <div className="fx-field" style={{ marginTop: 0 }}>
              <label htmlFor="fx-cal-product">ชุด</label>
              <select
                id="fx-cal-product"
                value={productId ?? ''}
                onChange={(e) => chooseProduct(e.target.value ? Number(e.target.value) : null)}
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
      )}

      <div className="fx-card">
        <div className="fx-cal-head">
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(-1)} aria-label="เดือนก่อน">
            ‹
          </button>
          <strong>
            {MONTH_NAMES[cursor.month]} {cursor.year + 543}
          </strong>
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(1)} aria-label="เดือนถัดไป">
            ›
          </button>
        </div>

        {tab === 'mine' ? (
          <FxCalendarGrid year={cursor.year} month={cursor.month} bookedDays={myDays} selectedDay={selected} onSelectDay={setSelected} />
        ) : (
          <FxCalendarGrid
            year={cursor.year}
            month={cursor.month}
            bookedDays={fullDays}
            partialDays={partialDays}
            selectedDay={selected}
            onSelectDay={setSelected}
          />
        )}

        <div className="fx-cal-legend">
          {tab === 'mine' ? (
            <span>
              <i className="fx-cal-swatch fx-cal-booked" /> วันที่คุณเช่าชุด (ตั้งแต่วันรับถึงวันคืน)
            </span>
          ) : (
            <>
              <span>
                <i className="fx-cal-swatch fx-cal-booked" /> เต็มแล้ว
              </span>
              <span>
                <i className="fx-cal-swatch fx-cal-partial" /> มีคนจองบางส่วน ยังว่างอยู่
              </span>
              <span>รวมช่วงเตรียมชุด 2 วันหลังคืน</span>
            </>
          )}
        </div>

        {tab === 'mine' && myBookings !== null && activeBookings.length === 0 && (
          <p className="fx-page-subtitle" style={{ marginTop: 12 }}>
            ยังไม่มีการจอง — เลือกชุดที่หน้าแรกแล้วกด "เช่าเลย"
          </p>
        )}

        {tab === 'mine' && selected !== null && (
          <div className="fx-cal-day-detail">
            <strong>
              วันที่ {selected} {MONTH_NAMES[cursor.month]}
            </strong>
            {selectedBookings.length === 0 ? (
              <p className="fx-page-subtitle" style={{ margin: '6px 0 0' }}>
                ไม่มีการจองในวันนี้
              </p>
            ) : (
              selectedBookings.map((b) => (
                <div className="fx-cal-booking" key={b.id}>
                  <div className="fx-cal-booking-head">
                    <span>{b.code}</span>
                    <span className={`fx-status-pill fx-status-${b.status.toLowerCase()}`}>{STATUS_LABEL[b.status]}</span>
                  </div>
                  <div className="fx-page-subtitle" style={{ margin: '4px 0 0' }}>
                    {formatThaiDate(b.rentDate)} – {formatThaiDate(b.returnDate)}
                  </div>
                  <ul>
                    {b.items.map((it) => (
                      <li key={it.id}>
                        {variantLabel.get(it.variantId) ?? `ชุด #${it.variantId}`} × {it.qty}
                      </li>
                    ))}
                  </ul>
                  {b.status === 'PENDING' && (
                    <button type="button" className="fx-btn fx-btn-sm" onClick={() => navigate(`/shop/payment/${b.id}`)}>
                      ชำระเงิน
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'availability' && selected !== null && (
          <p style={{ marginTop: 12 }}>
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
