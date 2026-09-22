import type { FxNavItem } from './FxLayout'

export const userNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/shop' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/shop/calendar' },
  { key: 'cart', label: 'Cart', icon: '🛒', to: '/shop/cart' },
  { key: 'status', label: 'Rental Status', icon: '🚚', to: '/shop/status' },
  { key: 'chat', label: 'ChatAI', icon: '💬', to: '/shop/chat' },
]

export const adminNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/admin-panel' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/admin-panel/calendar' },
  { key: 'orders', label: 'Orders', icon: '📦', to: '/admin-panel/orders' },
  { key: 'overview', label: 'Overview', icon: '📊', to: '/admin-panel/overview' },
  { key: 'edit', label: 'Edit Items', icon: '✏️', to: '/admin-panel/edit' },
  { key: 'users', label: 'Manage Users', icon: '👥', to: '/admin-panel/users' },
]

export const staffNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/staff-panel' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/staff-panel/calendar' },
  { key: 'orders', label: 'Orders', icon: '📦', to: '/staff-panel/orders' },
  { key: 'overview', label: 'Overview', icon: '📊', to: '/staff-panel/overview' },
  { key: 'edit', label: 'Edit Items', icon: '✏️', to: '/staff-panel/edit' },
]

export const mockProducts = [
  { id: 1, name: 'ชุดราตรีสีดำ', price: '฿350/วัน', icon: '👗' },
  { id: 2, name: 'สูทสีเทา', price: '฿420/วัน', icon: '🤵' },
  { id: 3, name: 'ชุดไทยจิตรลดา', price: '฿590/วัน', icon: '👘' },
  { id: 4, name: 'เดรสลายดอก', price: '฿280/วัน', icon: '👚' },
  { id: 5, name: 'ทักซิโด้', price: '฿480/วัน', icon: '🎩' },
  { id: 6, name: 'ชุดครุย', price: '฿320/วัน', icon: '🥻' },
  { id: 7, name: 'เดรสราตรีสีแดง', price: '฿410/วัน', icon: '👗' },
  { id: 8, name: 'เสื้อคลุมขนสัตว์', price: '฿260/วัน', icon: '🧥' },
]
