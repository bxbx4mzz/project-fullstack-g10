import { AdminBookingPage } from './AdminBookingPage'
import { staffNavItems } from './components/navItems'

export function StaffBookingPage() {
  return (
    <AdminBookingPage
      brand="Staff - Clothing Rental Shop"
      navItems={staffNavItems}
      ordersPath="/staff-panel/orders"
    />
  )
}
