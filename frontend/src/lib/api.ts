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
