# API Spec — สรุปให้ทีม Backend

เอกสารนี้สรุปว่า **อะไรทำเสร็จแล้ว** (อย่าทำซ้ำ) กับ **อะไรยังไม่มี** (ต้องสร้างต่อ) เพื่อให้ frontend
ที่ทำเป็น UI ไว้ล่วงหน้าแล้ว (ข้อมูล mock/ปลอมทั้งหมด) เอาไปต่อกับ backend จริงได้

ดู business requirement เต็มๆ (กฎการคิดราคา, การเช็คของว่าง ฯลฯ) ได้ในหัวข้อ
[กฎธุรกิจที่ต้อง implement ให้ตรง](#กฎธุรกิจที่ต้อง-implement-ให้ตรง) ด้านล่าง — สำคัญมาก อ่านก่อนเขียนโค้ด

---

## 1. ทำเสร็จแล้ว (มีจริงใน backend ตอนนี้)

### Auth (Google OAuth2 + session cookie)
| Method | Path | Role ที่เข้าได้ | หมายเหตุ |
|---|---|---|---|
| GET | `/oauth2/authorization/google` | public | เริ่ม OAuth2 flow (ปุ่ม login ฝั่ง frontend ชี้มาที่นี่ตรงๆ) |
| GET | `/login/oauth2/code/google` | public | Google redirect กลับมาที่นี่ (Spring Security จัดการเอง) |
| GET | `/api/auth/me` | ต้อง login | คืนข้อมูล user ปัจจุบัน (id, email, name, pictureUrl, role) หรือ 401 ถ้ายังไม่ login |
| POST | `/api/auth/logout` | ต้อง login | ล้าง session + ลบ cookie `RENTAL_SESSION` |

โค้ด: `AuthController.java`, `CustomOAuth2UserService.java`, `SecurityConfig.java`

**กติกา role:** login ครั้งแรกเช็คอีเมลกับ `ADMIN_EMAILS` / `STAFF_EMAILS` ใน `.env` → ได้ ADMIN/STAFF อัตโนมัติ
ไม่งั้นเป็น CUSTOMER — login ครั้งต่อไปคง role เดิมเสมอ (ไม่เช็คซ้ำ)

### User management (มอบ/ถอนสิทธิ์)
| Method | Path | Role ที่เข้าได้ | Body / หมายเหตุ |
|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | คืน list ผู้ใช้ทั้งหมด (id, email, name, pictureUrl, role) |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | body `{ "role": "STAFF" }` — ค่าที่ใช้ได้: `CUSTOMER` / `STAFF` / `ADMIN`. ห้ามถอนสิทธิ์ ADMIN ของตัวเอง (คืน 400) |

โค้ด: `AdminUserController.java`

### Path convention ที่วางไว้แล้ว (ใช้ต่อได้เลย)
`SecurityConfig.java` gate ไว้แบบนี้อยู่แล้ว — endpoint ใหม่ให้ใช้ prefix เดิมตามสิทธิ์:

```
/api/customer/**  -> hasAnyRole(CUSTOMER, STAFF, ADMIN)   // ทุก role login แล้วเข้าได้
/api/staff/**     -> hasAnyRole(STAFF, ADMIN)             // STAFF ทำอะไรได้ ADMIN ก็ทำได้
/api/admin/**     -> hasRole(ADMIN)                       // ADMIN เท่านั้น
```

มี demo ตัวอย่างการใช้ `@PreAuthorize` ไว้ใน `DemoRoleController.java` (ping endpoint 3 ตัว) ลบทิ้งได้เมื่อมี endpoint จริงแล้ว

---

## 2. ยังไม่มี — ต้องสร้างต่อ

Frontend มีหน้าตาไว้หมดแล้ว (mock data ล้วนๆ ไม่ผูก backend) รอ endpoint จริงมาเสียบแทน:
- Staff/Admin: หน้าสินค้า ([AdminHomePage.tsx](frontend/src/pages/shop/AdminHomePage.tsx)), แก้ไขสินค้า ([AdminEditPage.tsx](frontend/src/pages/shop/AdminEditPage.tsx)), ปฏิทิน ([AdminCalendarPage.tsx](frontend/src/pages/shop/AdminCalendarPage.tsx)), orders ([AdminOrdersPage.tsx](frontend/src/pages/shop/AdminOrdersPage.tsx)), ภาพรวม ([AdminOverviewPage.tsx](frontend/src/pages/shop/AdminOverviewPage.tsx))

> **หมายเหตุสำคัญ:** ตามที่คุยกับเจ้าของร้าน ลูกค้าจริงไม่ได้เข้าระบบเลย (ทักแชท LINE/IG/FB แทน)
> ดังนั้นหน้า `/shop/*` (ตะกร้า, ชำระเงิน, ChatAI ฝั่งลูกค้า) **ไม่ตรงกับโมเดลธุรกิจจริง — ไม่ต้องทำ backend รองรับ**
> ให้โฟกัส endpoint ฝั่ง Staff/Admin เท่านั้น

### 2.1 Products & Variants (ชุดให้เช่า)

> **อัปเดต:** branch `backend-customer` (ยังไม่ merge เข้า `frontend`/`main`) มี CRUD พื้นฐานของ
> `Product` ทำไว้แล้วบางส่วน — ดูโค้ดจริงได้ที่ `rental/src/main/java/com/g10/rental/{entity,controller,service,dto/product}`
> **แต่ยังไม่มี variant (ไซส์/สี แยกสต็อก)** ตามที่ frontend ต้องการ (ดูหน้า [ProductDetailModal.tsx](frontend/src/pages/shop/components/ProductDetailModal.tsx),
> [ProductFormModal.tsx](frontend/src/pages/shop/components/ProductFormModal.tsx)) — ต้องต่อยอดเพิ่ม

**มีแล้วใน `backend-customer` (`/api/products`):**
| Method | Path | Role | หมายเหตุ |
|---|---|---|---|
| GET | `/api/products` | CUSTOMER, STAFF, ADMIN | list สินค้าทั้งหมด |
| GET | `/api/products/{id}` | CUSTOMER, STAFF, ADMIN | รายละเอียดสินค้า 1 ชิ้น |
| POST | `/api/products` | STAFF, ADMIN | สร้างสินค้าใหม่ |
| PUT | `/api/products/{id}` | STAFF, ADMIN | แก้ไขสินค้า |
| DELETE | `/api/products/{id}` | STAFF, ADMIN | ลบสินค้า |

`CreateProductRequest`/`ProductResponse` ตอนนี้มีแค่: `name, description, price (BigDecimal), imageUrl, category (String), stock (Integer)`
— **ยังไม่มี field สำหรับ SKU อัตโนมัติ, ไซส์, สี** และ `category` เป็น string อิสระ (ไม่มี whitelist/enum)

**ที่ frontend ต้องการเพิ่ม (ยังไม่มีใน backend เลย ต้องทำต่อ):**
1. **ไซส์/สี แยกเป็น variant** ของแต่ละ product (ชุดเดียวกันมีได้หลายไซส์/สี คนละสต็อก) — ตอนนี้ frontend
   ทำเป็น mock array ง่ายๆ (`sizes: string[]`, `colors: string[]`) เก็บไว้ที่ตัว product เฉยๆ ยังไม่ใช่ stock แยกจริง
   ถ้าจะทำให้ถูกต้องตามกฎ "เช็คของว่าง" ในเอกสารนี้ ต้องแยกเป็น entity `ProductVariant` (ดู suggested schema ด้านล่าง)
2. **Auto-gen SKU** ตอนสร้างสินค้า/variant (ยังไม่มีเลยใน `CreateProductRequest` ปัจจุบัน)
3. **Category เป็น whitelist + เพิ่มเองได้ ("add tag")** — ฝั่ง frontend ตอนนี้ default `dress, shirt, skirt, pants`
   และเพิ่มหมวดใหม่ได้จาก UI (เก็บแค่ใน session, ไม่มี backend) ถ้าจะทำจริงต้องมีตาราง `Category` แยก หรืออย่างน้อย
   endpoint `GET/POST /api/products/categories` ให้ backend เป็นตัวเก็บ source of truth แทน frontend

**Suggested schema (ส่วนที่ยังขาด):**
```
ProductVariant : id, productId, sku (auto), size, color, stockQty,
                 price3Day, price5Day, price7Day, extraDayPrice
Category       : id, name   (หรือจะเก็บเป็น enum/whitelist ฝั่ง backend ก็ได้ ถ้าไม่อยากทำตารางแยก)
```

### 2.2 เช็คของว่าง (Availability)

| Method | Path | Role | Query |
|---|---|---|---|
| GET | `/api/staff/variants/{variantId}/availability?startDate=&endDate=&shippingMethod=` | STAFF, ADMIN | คืน `{ available: boolean, remaining: number }` |

Logic ต้องตรงตามกฎ **การเช็คของว่าง** และ **การจัดส่ง** ด้านล่างเป๊ะๆ (เผื่อวัน EMS ด้วย)

### 2.3 Bookings (การจอง)

| Method | Path | Role | Body / หมายเหตุ |
|---|---|---|---|
| GET | `/api/staff/bookings?status=&date=` | STAFF, ADMIN | list การจอง filter ตามสถานะ/วันที่ได้ |
| GET | `/api/staff/bookings/{id}` | STAFF, ADMIN | รายละเอียดการจอง 1 รายการ |
| POST | `/api/staff/bookings` | STAFF, ADMIN | สร้างการจองใหม่ (ดู body shape ด้านล่าง) — ต้องคำนวณราคารวมอัตโนมัติ |
| PATCH | `/api/staff/bookings/{id}/status` | STAFF, ADMIN | body `{ "status": "CONFIRMED" }` เปลี่ยนสถานะทีละขั้น |
| GET | `/api/staff/bookings/{id}/customer-message` | STAFF, ADMIN | (ตัวเลือก) คืนข้อความสรุปสำเร็จรูปให้ก็อปส่งลูกค้า — ดูตัวอย่างใน [AdminOrdersPage.tsx](frontend/src/pages/shop/AdminOrdersPage.tsx) ฟังก์ชัน `buildCustomerMessage` เป็น reference (ทำฝั่ง frontend ล้วนๆ ก็ได้ ไม่จำเป็นต้องมี endpoint นี้จริงก็ได้) |

**POST `/api/staff/bookings` body ตัวอย่าง:**
```json
{
  "customerName": "คุณมานี ใจดี",
  "shippingAddress": "99/1 ถ.นิมมานเหมินท์ อ.เมือง จ.เชียงใหม่",
  "rentDate": "2026-07-20",
  "returnDate": "2026-07-24",
  "shippingMethod": "EMS",
  "discount": 100,
  "source": "ONLINE",
  "items": [
    { "variantId": 12, "qty": 1 },
    { "variantId": 34, "qty": 1 }
  ]
}
```
ตอบกลับต้องมี `totalPrice` (คำนวณจาก tier pricing ของแต่ละ variant), `finalPrice` (หลังหักส่วนลด), และ `status` เริ่มต้นเป็น `PENDING`

> **feature ใหม่ — บันทึกการจองหน้าร้าน (in-store booking):** เวลาลูกค้ามาซื้อ/เช่าที่หน้าร้านเอง staff/admin
> ต้องบันทึกการจองได้เหมือน flow ปกติ (เลือกสินค้า → ใส่ชื่อลูกค้า → บันทึก) **แต่ข้ามหน้าชำระเงิน** เพราะลูกค้าจ่ายที่ร้านแล้ว
> เพิ่ม field `source: "ONLINE" | "IN_STORE"` ใน `Booking` เพื่อแยกให้เห็นว่าจองผ่านเว็บหรือพนักงานบันทึกให้ที่ร้าน —
> ดูตัวอย่าง UI ที่ทำเป็น mock ไว้แล้วที่ [AdminBookingPage.tsx](frontend/src/pages/shop/AdminBookingPage.tsx) (route `/staff-panel/booking`, `/admin-panel/booking`)
> เวลาสร้างจริง แนะนำให้ booking ที่ `source: IN_STORE` เริ่ม status เป็น `CONFIRMED` เลย (ไม่ต้องรอ `PENDING`) เพราะลูกค้าจ่ายเงินต่อหน้าแล้ว

**Suggested schema:**
```
Booking      : id, code (auto เช่น B0007), customerName, shippingAddress,
               rentDate, returnDate, shippingMethod (EMS/MESSENGER/PICKUP),
               discount, totalPrice, finalPrice, status, source (ONLINE/IN_STORE), createdAt
BookingItem  : id, bookingId, variantId, qty, unitPrice

BookingStatus enum: PENDING, CONFIRMED, RETURNED, CANCELLED
  (ถ้าอยากมี "จัดส่งแล้ว" แยกจาก "ยืนยันแล้ว" ตามหน้า Orders ที่ทำ mock ไว้
   ให้เพิ่ม SHIPPED คั่นระหว่าง CONFIRMED กับ RETURNED)
```

### 2.4 Dashboard / ภาพรวมร้าน

| Method | Path | Role | หมายเหตุ |
|---|---|---|---|
| GET | `/api/staff/dashboard/summary?date=` | STAFF, ADMIN | ยอดจองวันนี้, กำลังเช่าอยู่กี่รายการ, รายได้รวม, คิวงานที่ต้องส่ง/รับคืนวันนี้ |

---

## กฎธุรกิจที่ต้อง implement ให้ตรง

### การคิดราคา (tier pricing)
แต่ละ variant มีราคา 3 ราคา (3 วัน / 5 วัน / 7 วัน) เกินจากนั้นคิดเพิ่มรายวัน

```
เช่า 3 วัน  -> price3Day
เช่า 4 วัน  -> price3Day + extraDayPrice×1
เช่า 5 วัน  -> price5Day
เช่า 7 วัน  -> price7Day
เช่า 10 วัน -> price7Day + extraDayPrice×3
```
ตัวอย่าง (300/500/700, เพิ่มวันละ 50): 3วัน=300, 4วัน=350, 5วัน=500, 7วัน=700, 10วัน=850

**นับวันรวมวันแรก+วันสุดท้าย** เช่น 20–24 ก.ค. = 5 วัน (`returnDate - rentDate + 1`)

### การเช็คของว่าง (overlap check)
Variant หนึ่งตัว "เต็ม" เมื่อจำนวนการจองที่ช่วงวันทับกัน (ไม่นับที่ถูก `CANCELLED`) เท่ากับ `stockQty`

ตัวอย่าง: มี 2 ตัว, จองแล้ว 18–22 ก.ค. (1) และ 21–25 ก.ค. (1)
- ขอ 21–23 ก.ค. → เต็ม (ชนทั้ง 2 booking)
- ขอ 23–24 ก.ค. → ว่าง 1 ตัว (ชนแค่ booking ที่ 2)
- ขอ 26–28 ก.ค. → ว่าง 2 ตัว (ไม่ชนใคร)

Overlap ระหว่างสองช่วงวันที่ [a,b] กับ [c,d]: `a <= d AND c <= b`

### เผื่อวันจัดส่ง (shipping buffer) — บวกเข้าไปในช่วงที่ใช้เช็ค overlap เท่านั้น ไม่กระทบราคา
```
EMS         -> เผื่อวันขนส่งไป-กลับ (เช่น เผื่อ 2 วัน หน้า-หลัง — ให้ตั้งเป็นค่า config ปรับได้)
Messenger/Bolt -> ไม่ต้องเผื่อ (ส่งด่วนในวัน)
รับที่ร้านเอง  -> ไม่ต้องเผื่อ
```
ตัวอย่าง: ลูกค้าใส่จริง 21–23 ก.ค. ส่งแบบ EMS เผื่อ 2 วัน → ตอนเช็ค/กันของว่างให้ใช้ช่วง **19–25 ก.ค.**
(แต่ `rentDate`/`returnDate` ที่เก็บใน booking ยังคงเป็น 21–23 ก.ค. ตามที่ลูกค้าจะได้ใส่จริง — buffer ใช้แค่ตอนเช็ค/กันคิวเท่านั้น)

### สถานะการจอง (state machine)
```
PENDING -> CONFIRMED -> (SHIPPED ถ้าอยากแยก) -> RETURNED
   ใครก็ยกเลิกกลางทางได้ -> CANCELLED (จาก PENDING หรือ CONFIRMED เท่านั้น)
```
Booking ที่ `CANCELLED` ไม่ต้องนับใน availability check (ดูด้านบน)

---

## Reference ของเดิมที่มีอยู่ (ใช้เป็นตัวอย่าง pattern)

- DTO record ธรรมดา: `web/dto/UserResponse.java`, `web/dto/UpdateRoleRequest.java`
- Controller + `@PreAuthorize` + `ResponseStatusException`: `web/AdminUserController.java`
- Repository (Spring Data JPA): `repository/UserRepository.java`
- Entity + Lombok (`@Entity`, `@Builder`, `@PrePersist`/`@PreUpdate` สำหรับ timestamp): `model/User.java`
- Error response ตอนนี้เปิด `server.error.include-message: always` แล้ว (`application.yml`) — โยน
  `ResponseStatusException(HttpStatus.XXX, "ข้อความ")` แล้ว frontend จะเห็น message จริงในตัว error response

## Frontend เตรียมพร้อมส่วนไหนแล้วบ้าง

- `frontend/src/lib/api.ts` — มี pattern เรียก API ผ่าน `fetch` + `credentials: 'include'` อยู่แล้ว (ดู `listUsers`, `updateUserRole` เป็นตัวอย่าง) เพิ่มฟังก์ชันคล้ายๆ กันสำหรับ products/bookings ได้เลย
- Role-based routing (`/staff-panel/*`, `/admin-panel/*`) พร้อมใช้แล้วใน `App.tsx`
- **`frontend/src/pages/shop/components/store.ts`** — mock data ของ products/categories/orders ทั้งหมดย้ายมารวมไว้ที่นี่แล้ว (แทนที่ `mockProducts` เดิมที่เคยอยู่ใน `navItems.ts`) ใช้ `useSyncExternalStore` ทำเป็น store กลางแบบง่ายๆ ให้หน้า Home/Edit Items/Orders/New Booking เห็นข้อมูลตรงกันระหว่าง session (ยังไม่ persist ข้าม reload เพราะไม่มี backend) — พอมี API จริงให้แทนที่ฟังก์ชันใน store.ts ด้วย fetch เรียก backend แทน
- **Add product** ทำไว้แล้วที่ [ProductFormModal.tsx](frontend/src/pages/shop/components/ProductFormModal.tsx) (เปิดจากปุ่ม "+ Add product" ในหน้า Edit Items) — มี field ตรงกับ `CreateProductRequest` ของ `backend-customer` (name/description/price/imageUrl/category/stock) บวก sizes/colors ที่ backend ยังไม่รองรับ (ดูหัวข้อ 2.1) และ category แบบเลือก + เพิ่มเองได้ ("Add tag")
- **ดูรายละเอียดสินค้า (variant)** ทำไว้ที่ [ProductDetailModal.tsx](frontend/src/pages/shop/components/ProductDetailModal.tsx) — โชว์ category/stock/sizes/colors ให้ลูกค้า/staff กดดูจากปุ่ม "ดูรายละเอียด"
- **บันทึกการจองหน้าร้าน (in-store booking)** ทำไว้ที่ [AdminBookingPage.tsx](frontend/src/pages/shop/AdminBookingPage.tsx) (route `/staff-panel/booking`, `/admin-panel/booking`) — เลือกสินค้า+จำนวน, ใส่ชื่อลูกค้า+วันคืน, กดบันทึกแล้วไปโผล่ที่หน้า Orders ทันที (ไม่มีหน้าชำระเงิน)
