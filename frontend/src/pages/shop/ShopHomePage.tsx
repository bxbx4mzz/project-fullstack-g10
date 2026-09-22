import { useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems, mockProducts } from './components/navItems'

export function ShopHomePage() {
  const [query, setQuery] = useState('')
  const filteredProducts = mockProducts.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <div className="fx-banner">
        <div>
          <h2>BUY 2 GET 25% OFF</h2>
          <p>เช่าชุด 2 ชิ้นขึ้นไป ลดทันที 25%</p>
        </div>
      </div>

      <h1>ชุดแนะนำ</h1>
      <p className="fx-page-subtitle">เลือกชุดที่ชอบแล้วจองคิวเช่าได้เลย</p>

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
                ดูรายละเอียด
              </button>
              <button type="button" className="fx-btn">
                เช่าเลย
              </button>
            </div>
          </div>
        ))}
      </div>
    </FxLayout>
  )
}
