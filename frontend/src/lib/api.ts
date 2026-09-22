export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN'

export interface CurrentUser {
  id: number
  email: string
  name: string
  pictureUrl: string | null
  role: Role
}

/** ลิงก์ให้ปุ่ม "เข้าสู่ระบบด้วย Google" ชี้ไป — เริ่ม OAuth2 flow ฝั่ง backend */
export const googleLoginUrl = `${API_BASE_URL}/oauth2/authorization/google`

/** หน้าแรกหลัง login ของแต่ละ role */
export function homePathForRole(role: Role): string {
  if (role === 'ADMIN') return '/admin-panel'
  if (role === 'STAFF') return '/staff-panel'
  return '/shop'
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: 'include',
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`โหลดข้อมูลผู้ใช้ไม่สำเร็จ (${res.status})`)
  return (await res.json()) as CurrentUser
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`ออกจากระบบไม่สำเร็จ (${res.status})`)
}

/** ADMIN เท่านั้น: ดูรายชื่อผู้ใช้ทั้งหมด */
export async function listUsers(): Promise<CurrentUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`โหลดรายชื่อผู้ใช้ไม่สำเร็จ (${res.status})`)
  return (await res.json()) as CurrentUser[]
}

/** ADMIN เท่านั้น: มอบ/ถอน role ให้ผู้ใช้คนหนึ่ง */
export async function updateUserRole(id: number, role: Role): Promise<CurrentUser> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `เปลี่ยนสิทธิ์ไม่สำเร็จ (${res.status})`)
  }
  return (await res.json()) as CurrentUser
}
