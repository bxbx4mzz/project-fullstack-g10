import { useEffect, useMemo, useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { FxCalendarGrid } from './components/FxCalendarGrid'
import { adminNavItems } from './components/navItems'
import { MONTH_NAMES, coversDay, formatThaiDate, monthRange } from './components/calendarUtils'
import { fetchStaffCalendar, type CalendarEvent } from '../../lib/api'
import { FxAlert } from './components/FxAlert'

type AdminCalendarPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminCalendarPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminCalendarPageProps) {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const { start, end } = monthRange(cursor.year, cursor.month)
    setLoading(true)
    setError(null)
    fetchStaffCalendar(start, end)
      .then((data) => !cancelled && setEvents(data))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'โหลดปฏิทินไม่สำเร็จ'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [cursor])

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const bookedDays = useMemo(() => {
    const days: number[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      if (events.some((e) => coversDay(e.start, e.end, cursor.year, cursor.month, d))) days.push(d)
    }
    return days
  }, [events, cursor, daysInMonth])

  const selectedEvents = selected
    ? events.filter((e) => coversDay(e.start, e.end, cursor.year, cursor.month, selected))
    : []

  function shiftMonth(delta: number) {
    setSelected(null)
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>ปฏิทินการจองทั้งหมด</h1>
      <p className="fx-page-subtitle">ดูคิวเช่าและวันรับ-คืนชุดของลูกค้า</p>

      {error && (
        <FxAlert onClose={() => setError(null)}>
          {error}
        </FxAlert>
      )}

      <div className="fx-card">
        <div className="fx-cal-head">
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <strong>
            {MONTH_NAMES[cursor.month]} {cursor.year + 543}
            {loading && ' ...'}
          </strong>
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>
        <FxCalendarGrid year={cursor.year} month={cursor.month} bookedDays={bookedDays} onSelectDay={setSelected} />

        {selected && (
          <div style={{ marginTop: 16 }}>
            <strong>
              วันที่ {selected} {MONTH_NAMES[cursor.month]}
            </strong>
            {selectedEvents.length === 0 ? (
              <p className="fx-page-subtitle">ไม่มีการจอง</p>
            ) : (
              <table className="fx-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>รหัสจอง</th>
                    <th>ลูกค้า</th>
                    <th>ช่วงเช่า</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvents.map((e) => (
                    <tr key={e.bookingId}>
                      <td>{e.code}</td>
                      <td>{e.customerName}</td>
                      <td>
                        {formatThaiDate(e.start)} - {formatThaiDate(e.end)}
                      </td>
                      <td style={{ color: e.color, fontWeight: 600 }}>{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </FxLayout>
  )
}
