export const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  return { start: toIsoDate(year, month, 1), end: toIsoDate(year, month, new Date(year, month + 1, 0).getDate()) }
}

export function coversDay(start: string, end: string, year: number, month: number, day: number): boolean {
  const iso = toIsoDate(year, month, day)
  return start <= iso && iso <= end
}

export function todayIso(): string {
  const d = new Date()
  return toIsoDate(d.getFullYear(), d.getMonth(), d.getDate())
}

export function rentalDurationHint(rentDate: string, returnDate: string): { text: string; ok: boolean } | null {
  if (!rentDate || !returnDate) return null
  const days = Math.round((Date.parse(returnDate) - Date.parse(rentDate)) / 86_400_000) + 1
  if (days < 1) return { text: 'วันที่คืนต้องไม่อยู่ก่อนวันที่เช่า', ok: false }
  const ok = days === 3 || days === 5 || days >= 7
  return {
    text: ok
      ? `รวม ${days} วัน (นับรวมวันรับและวันคืน)`
      : `รวม ${days} วัน — เช่าได้แบบ 3 วัน, 5 วัน หรือ 7 วันขึ้นไปเท่านั้น`,
    ok,
  }
}

export function formatThaiDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTH_NAMES[m - 1]} ${y + 543}`
}
