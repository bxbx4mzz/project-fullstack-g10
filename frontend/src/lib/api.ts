export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN'

export interface CurrentUser {
  id: number
  email: string
  name: string
  pictureUrl: string | null
  role: Role
}

export const googleLoginUrl = `${API_BASE_URL}/oauth2/authorization/google`

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

export async function listUsers(): Promise<CurrentUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`โหลดรายชื่อผู้ใช้ไม่สำเร็จ (${res.status})`)
  return (await res.json()) as CurrentUser[]
}

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

export interface ApiProduct {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ApiProductVariant {
  id: number
  productId: number
  sku: string
  size: string | null
  color: string | null
  stockQty: number
  price3Day: number
  price5Day: number
  price7Day: number
  extraDayPrice: number
}

export interface CreateProductVariantInput {
  size: string
  color: string
  stockQty: number
  price3Day: number
  price5Day: number
  price7Day: number
  extraDayPrice: number
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
  variants: CreateProductVariantInput[]
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function fetchProducts(): Promise<ApiProduct[]> {
  return apiFetch('/api/products')
}

export function fetchProductVariants(productId: number): Promise<ApiProductVariant[]> {
  return apiFetch(`/api/products/${productId}/variants`)
}

export function createProduct(input: CreateProductInput): Promise<ApiProduct> {
  return apiFetch('/api/products', { method: 'POST', body: JSON.stringify(input) })
}

export function updateProduct(id: number, input: Omit<CreateProductInput, 'variants'>): Promise<ApiProduct> {
  return apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export function deleteProduct(id: number): Promise<void> {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE' })
}

export function deleteUser(id: number): Promise<void> {
  return apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
}

export interface ApiAvailability {
  variantId: number
  stockQty: number
  bookedQty: number
  availableQty: number
  available: boolean
}

export function checkAvailability(variantId: number, startDate: string, endDate: string): Promise<ApiAvailability> {
  return apiFetch(`/api/variants/${variantId}/availability?startDate=${startDate}&endDate=${endDate}`)
}

export interface ApiCartItem {
  id: number
  variantId: number
  productId: number
  productName: string
  imageUrl: string | null
  size: string | null
  color: string | null
  price: number
  quantity: number
  subtotal: number
}

export interface ApiCart {
  id: number
  rentDate: string | null
  returnDate: string | null
  items: ApiCartItem[]
  total: number
}

export function fetchCart(): Promise<ApiCart> {
  return apiFetch('/api/cart/me')
}

export function addCartItem(variantId: number, quantity: number): Promise<ApiCart> {
  return apiFetch('/api/cart/items', { method: 'POST', body: JSON.stringify({ variantId, quantity }) })
}

export function updateCartItem(itemId: number, quantity: number): Promise<ApiCart> {
  return apiFetch(`/api/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) })
}

export function removeCartItem(itemId: number): Promise<ApiCart> {
  return apiFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' })
}

export interface ApiFavorite {
  id: number
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  category: string
  stock: number
}

export function fetchMyFavorites(): Promise<ApiFavorite[]> {
  return apiFetch('/api/favorites/me')
}

export function addFavorite(productId: number): Promise<void> {
  return apiFetch(`/api/favorites/${productId}`, { method: 'POST' })
}

export function removeFavorite(productId: number): Promise<void> {
  return apiFetch(`/api/favorites/${productId}`, { method: 'DELETE' })
}

export type ShippingMethod = 'EMS' | 'MESSENGER' | 'PICKUP'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'RETURNED' | 'CANCELLED'
export type BookingSource = 'ONLINE' | 'IN_STORE'

export interface ApiBookingItem {
  id: number
  variantId: number
  qty: number
  unitPrice: number
}

export interface ApiBooking {
  id: number
  code: string
  customerId: number | null
  customerName: string
  shippingAddress: string
  rentDate: string
  returnDate: string
  shippingMethod: ShippingMethod
  discount: number
  totalPrice: number
  finalPrice: number
  status: BookingStatus
  source: BookingSource
  createdAt: string
  items: ApiBookingItem[]
}

export interface CreateBookingInput {
  customerName: string
  shippingAddress: string
  rentDate: string
  returnDate: string
  shippingMethod: ShippingMethod
}

export function createBooking(input: CreateBookingInput): Promise<ApiBooking> {
  return apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(input) })
}

export function fetchMyBookings(): Promise<ApiBooking[]> {
  return apiFetch('/api/bookings/me')
}

export function cancelBooking(id: number): Promise<ApiBooking> {
  return apiFetch(`/api/bookings/${id}/cancel`, { method: 'PATCH' })
}

export interface CreateStaffBookingInput {
  customerName: string
  shippingAddress?: string
  rentDate: string
  returnDate: string
  shippingMethod: ShippingMethod
  discount?: number
  items: { variantId: number; qty: number }[]
}

export function fetchStaffBookings(): Promise<ApiBooking[]> {
  return apiFetch('/api/staff/bookings')
}

export function createStaffBooking(input: CreateStaffBookingInput): Promise<ApiBooking> {
  return apiFetch('/api/staff/bookings', { method: 'POST', body: JSON.stringify(input) })
}

export function updateBookingStatus(id: number, status: BookingStatus): Promise<ApiBooking> {
  return apiFetch(`/api/staff/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function fetchBookingSummaryMessage(id: number): Promise<string> {
  const res = await apiFetch<{ message: string }>(`/api/staff/bookings/${id}/summary-message`)
  return res.message
}

export interface DashboardSummary {
  totalBookings: number
  activeBookings: number
  totalRevenue: number
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch('/api/staff/dashboard/summary')
}
