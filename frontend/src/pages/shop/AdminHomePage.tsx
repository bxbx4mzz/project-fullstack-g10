import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import { useEnsureProductsLoaded, useProducts, useProductsError } from './components/store'
import { ProductThumb } from './components/ProductThumb'

type AdminHomePageProps = {
  brand?: string
  navItems?: FxNavItem[]
  editPath?: string
}

export function AdminHomePage({
  brand = 'Admin - Clothing Rental Shop',
  navItems = adminNavItems,
  editPath = '/admin-panel/edit',
}: AdminHomePageProps) {
  useEnsureProductsLoaded()
  const products = useProducts()
  const productsError = useProductsError()
  const [query, setQuery] = useState('')
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))

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

      {productsError && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {productsError}
        </div>
      )}

      {filteredProducts.length === 0 && !productsError && <p className="fx-page-subtitle">ไม่พบสินค้าที่ตรงกับ "{query}"</p>}

      <div className="fx-grid">
        {filteredProducts.map((p) => (
          <div className="fx-card fx-product" key={p.id}>
            <ProductThumb icon={p.icon} />
            <div className="fx-product-name">{p.name}</div>
            <div className="fx-product-price">{p.price}</div>
            <div className="fx-product-actions">
              <Link to={`${editPath}?id=${p.id}`} className="fx-btn fx-btn-ghost">
                แก้ไข
              </Link>
            </div>
          </div>
        ))}
      </div>
    </FxLayout>
  )
}
