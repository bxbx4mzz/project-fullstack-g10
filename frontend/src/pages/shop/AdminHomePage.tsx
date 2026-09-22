import { useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems, mockProducts } from './components/navItems'

type AdminHomePageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminHomePage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminHomePageProps) {
  const [query, setQuery] = useState('')
  const filteredProducts = mockProducts.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <div className="fx-banner">
        <div>
          <h2>BUY 2 GET 25% OFF</h2>
          <p>โปรโมชั่นที่กำลังใช้งานอยู่บนหน้าร้าน</p>
        </div>
      </div>

      <h1>สินค้าทั้งหมด</h1>
      <p className="fx-page-subtitle">ภาพรวมชุดที่เปิดให้เช่าในระบบ</p>

      <input
        type="text"
        className="fx-search-input"
        placeholder="ค้นหาชื่อสินค้า..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filteredProducts.length === 0 && <p className="fx-page-subtitle">ไม่พบสินค้าที่ตรงกับ "{query}"</p>}

      <div className="fx-grid">
        {filteredProducts.map((p) => (
          <div className="fx-card fx-product" key={p.id}>
            <div className="fx-product-thumb">{p.icon}</div>
            <div className="fx-product-name">{p.name}</div>
            <div className="fx-product-price">{p.price}</div>
            <div className="fx-product-actions">
              <button type="button" className="fx-btn fx-btn-ghost">
                แก้ไข
              </button>
            </div>
          </div>
        ))}
      </div>
    </FxLayout>
  )
}
