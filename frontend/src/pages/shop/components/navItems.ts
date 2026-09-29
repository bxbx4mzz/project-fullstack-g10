import type { FxNavItem } from './FxLayout'

export const userNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/shop' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/shop/calendar' },
  { key: 'cart', label: 'Cart', icon: '🛒', to: '/shop/cart' },
  { key: 'favorites', label: 'Favorites', icon: '⭐', to: '/shop/favorites' },
  { key: 'status', label: 'Rental Status', icon: '🚚', to: '/shop/status' },
  { key: 'chat', label: 'ChatAI', icon: '💬', to: '/shop/chat' },
]

export const adminNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/admin-panel' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/admin-panel/calendar' },
  { key: 'booking', label: 'Storefront', icon: '📝', to: '/admin-panel/booking' },
  { key: 'orders', label: 'Orders', icon: '📦', to: '/admin-panel/orders' },
  { key: 'overview', label: 'Overview', icon: '📊', to: '/admin-panel/overview' },
  { key: 'edit', label: 'Edit Items', icon: '✏️', to: '/admin-panel/edit' },
  { key: 'users', label: 'Manage Users', icon: '👥', to: '/admin-panel/users' },
]

export const staffNavItems: FxNavItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', to: '/staff-panel' },
  { key: 'calendar', label: 'Calendar', icon: '📅', to: '/staff-panel/calendar' },
  { key: 'booking', label: 'Storefront', icon: '📝', to: '/staff-panel/booking' },
  { key: 'orders', label: 'Orders', icon: '📦', to: '/staff-panel/orders' },
  { key: 'overview', label: 'Overview', icon: '📊', to: '/staff-panel/overview' },
  { key: 'edit', label: 'Edit Items', icon: '✏️', to: '/staff-panel/edit' },
]
