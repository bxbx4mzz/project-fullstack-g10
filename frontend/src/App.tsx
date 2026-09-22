import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { OAuthRedirectPage } from './pages/OAuthRedirectPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { ShopHomePage } from './pages/shop/ShopHomePage'
import { ShopCalendarPage } from './pages/shop/ShopCalendarPage'
import { ShopCartPage } from './pages/shop/ShopCartPage'
import { ShopPaymentPage } from './pages/shop/ShopPaymentPage'
import { ShopChatPage } from './pages/shop/ShopChatPage'
import { ShopStatusPage } from './pages/shop/ShopStatusPage'
import { AdminHomePage } from './pages/shop/AdminHomePage'
import { AdminCalendarPage } from './pages/shop/AdminCalendarPage'
import { AdminOverviewPage } from './pages/shop/AdminOverviewPage'
import { AdminEditPage } from './pages/shop/AdminEditPage'
import { AdminUsersPage } from './pages/shop/AdminUsersPage'
import { AdminOrdersPage } from './pages/shop/AdminOrdersPage'
import { StaffHomePage } from './pages/shop/StaffHomePage'
import { StaffCalendarPage } from './pages/shop/StaffCalendarPage'
import { StaffOverviewPage } from './pages/shop/StaffOverviewPage'
import { StaffEditPage } from './pages/shop/StaffEditPage'
import { StaffOrdersPage } from './pages/shop/StaffOrdersPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth2/redirect" element={<OAuthRedirectPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Figma "ux-ui-shop" UI (light/cream theme) — customer area, any logged-in role */}
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <ShopHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/calendar"
              element={
                <ProtectedRoute>
                  <ShopCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/cart"
              element={
                <ProtectedRoute>
                  <ShopCartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/payment"
              element={
                <ProtectedRoute>
                  <ShopPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/chat"
              element={
                <ProtectedRoute>
                  <ShopChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/status"
              element={
                <ProtectedRoute>
                  <ShopStatusPage />
                </ProtectedRoute>
              }
            />

            {/* Staff area — STAFF และ ADMIN เข้าได้ (ADMIN มีสิทธิ์ทุกอย่างของ STAFF ด้วย) */}
            <Route
              path="/staff-panel"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-panel/calendar"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-panel/overview"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-panel/edit"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-panel/orders"
              element={
                <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Admin area — ADMIN เท่านั้น */}
            <Route
              path="/admin-panel"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-panel/calendar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-panel/overview"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-panel/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-panel/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-panel/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="*" element={<Navigate to="/shop" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
