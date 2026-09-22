import { useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems, mockProducts } from './components/navItems'

type AdminEditPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminEditPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminEditPageProps) {
  const [activeId, setActiveId] = useState(mockProducts[0].id)
  const active = mockProducts.find((p) => p.id === activeId) ?? mockProducts[0]

  const [name, setName] = useState(active.name)
  const [price, setPrice] = useState(active.price)

  function selectProduct(id: number) {
    setActiveId(id)
    const p = mockProducts.find((x) => x.id === id)
    if (p) {
      setName(p.name)
      setPrice(p.price)
    }
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>แก้ไขสินค้า</h1>
      <p className="fx-page-subtitle">เลือกชุดจากรายการ แล้วแก้ไขรายละเอียดด้านขวา</p>

      <div className="fx-edit-layout">
        <div className="fx-edit-list">
          {mockProducts.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`fx-edit-list-item${p.id === activeId ? ' active' : ''}`}
              onClick={() => selectProduct(p.id)}
            >
              <span>
                {p.icon} {p.name}
              </span>
              <span>{p.price}</span>
            </button>
          ))}
        </div>

        <div className="fx-card">
          <div className="fx-field" style={{ marginTop: 0 }}>
            <label htmlFor="fx-edit-name">ชื่อชุด</label>
            <input id="fx-edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="fx-field">
            <label htmlFor="fx-edit-price">ราคาต่อวัน</label>
            <input id="fx-edit-price" type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="fx-field">
            <label htmlFor="fx-edit-stock">จำนวนคงเหลือ</label>
            <input id="fx-edit-stock" type="number" defaultValue={3} min={0} />
          </div>
          <button type="button" className="fx-btn" style={{ marginTop: 20 }}>
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </FxLayout>
  )
}
