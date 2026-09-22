import { AdminHomePage } from './AdminHomePage'
import { staffNavItems } from './components/navItems'

export function StaffHomePage() {
  return <AdminHomePage brand="Staff - Clothing Rental Shop" navItems={staffNavItems} />
}
