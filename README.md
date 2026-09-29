# ระบบเช่าเสื้อผ้า - Login ด้วย Google (G10)

```
frontend/   React + TypeScript + Vite (pnpm)
backend/    Spring Boot + Spring Security (OAuth2/OIDC) + PostgreSQL
```

ตอนนี้ทำเสร็จแค่ **login ด้วย Google + แยกสิทธิ์ CUSTOMER / STAFF / ADMIN**
ฟีเจอร์จัดการชุด/การจองยังไม่มี — ให้ทีมต่อยอดจากโครงนี้

---

## ไฟล์สำคัญของระบบ login (ดูตรงนี้ก่อน)

| ไฟล์ | หน้าที่ |
|---|---|
| `backend/.../security/SecurityConfig.java` | ตั้งค่า CORS, session cookie, กำหนดว่า path ไหนต้อง login/role อะไร |
| `backend/.../security/CustomOAuth2UserService.java` | รันหลัง Google login สำเร็จ: upsert user ลง DB + กำหนด role |
| `backend/.../security/CustomOAuth2User.java` | ห่อ entity `User` เป็น principal ที่ใช้ทั้งระบบ |
| `backend/.../web/AuthController.java` | `GET /api/auth/me` — endpoint ที่ frontend ใช้เช็คว่า login อยู่หรือไม่ |
| `backend/src/main/resources/application.yml` | ค่า config ทั้งหมด (client id/secret, cookie, frontend-url) |
| `frontend/src/lib/api.ts` | ปุ่ม login ชี้ไปไหน (`googleLoginUrl`) + ฟังก์ชันเรียก `/api/auth/me` |
| `frontend/src/context/AuthContext.tsx` | เก็บ user ปัจจุบันไว้ให้ทั้งแอปใช้ผ่าน `useAuth()` |
| `frontend/src/pages/OAuthRedirectPage.tsx` | หน้าที่ backend redirect กลับมาหลัง login สำเร็จ |

## flow คร่าว ๆ

```
กดปุ่ม login (frontend) → /oauth2/authorization/google (backend)
  → หน้า Google → เลือกบัญชี
  → Google redirect กลับ /login/oauth2/code/google (backend)
  → CustomOAuth2UserService upsert user ลง DB + ตั้ง session cookie
  → redirect ไป {frontend}/oauth2/redirect
  → frontend เรียก GET /api/auth/me → ได้ user → เข้า /shop
```

## การกำหนด role

Login ครั้งแรก: เช็คอีเมลกับ `ADMIN_EMAILS` / `STAFF_EMAILS` ใน `backend/.env`
(ไม่อยู่ในลิสต์ไหน = `CUSTOMER`) — login ครั้งต่อไปคง role เดิมเสมอ ไม่เช็คซ้ำ
เปลี่ยน role คนที่มีอยู่แล้วต้องแก้ตรง DB เอง:
```sql
UPDATE users SET role = 'STAFF' WHERE email = 'someone@example.com';
```

---

## Setup & รัน (Windows)

**เตรียมเครื่องก่อน — ต้องติดตั้ง 3 อย่างนี้:**

| โปรแกรม | ใช้ทำอะไร | โหลดที่ไหน |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | รัน backend + PostgreSQL (ไม่ต้องลง JDK/Postgres เองบนเครื่อง) | ติดตั้งแล้วต้องเปิดโปรแกรมทิ้งไว้ (ดู icon วาฬที่ system tray ว่าติ๊บสีเขียว) |
| [Node.js](https://nodejs.org/) (LTS) | รัน frontend (React + Vite) | ติดตั้งแบบปกติ (Next → Next → Install) |
| pnpm | package manager ของ frontend | ลงผ่านคำสั่งข้างล่าง (ข้อ 2) |

### ขั้นตอน

1. **Clone โปรเจกต์แล้วเข้าไปที่โฟลเดอร์**
   ```bash
   git clone https://github.com/bxbx4mzz/project-fullstack-g10.git
   cd project-fullstack-g10
   ```

2. **ลง pnpm** (ทำครั้งเดียวต่อเครื่อง ข้ามได้ถ้ามีอยู่แล้ว — เช็คด้วย `pnpm --version`)
   ```bash
   npm install -g pnpm
   ```

3. **สร้าง Google OAuth Client** ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → ตอนตั้งค่า **Authorized redirect URI** ใส่: `http://localhost:8080/login/oauth2/code/google`
   → เก็บ **Client ID** กับ **Client Secret** ไว้ใช้ในข้อ 4

4. **ตั้งค่า environment variables ฝั่ง backend**
   ```bash
   cp backend/.env.example backend/.env
   ```
   เปิดไฟล์ `backend/.env` แล้วใส่ค่า:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — จากข้อ 3
   - `ADMIN_EMAILS` — อีเมล Google ของตัวเอง (จะได้สิทธิ์ ADMIN ตอน login ครั้งแรก)
   - `STAFF_EMAILS` — อีเมลที่อยากให้เป็น STAFF (ถ้ามี)

5. **ตั้งค่า environment variables ฝั่ง frontend**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   ค่า default ใน `frontend/.env` ใช้ได้เลยไม่ต้องแก้อะไร (ชี้ไปที่ backend `http://localhost:8080` อยู่แล้ว)

6. **รัน backend + database ผ่าน Docker** (เปิด Docker Desktop ทิ้งไว้ก่อน)
   ```bash
   cd backend
   docker compose up -d --build
   ```
   รอบแรกจะช้าหน่อย (โหลด image + build ~2-5 นาที) เช็คว่าขึ้นสำเร็จด้วย `docker compose ps` — ต้องเห็น `g10-pj-backend` และ `g10-pj-postgres` เป็น `running`/`healthy`

7. **ติดตั้ง dependency ฝั่ง frontend**
   ```bash
   cd ../frontend
   pnpm.cmd install
   ```

8. **รัน frontend dev server**
   ```bash
   pnpm.cmd run dev
   ```
   เสร็จแล้วเปิดเบราว์เซอร์ไปที่ **http://localhost:5173**

> หมายเหตุ: ใช้ `pnpm.cmd` (ไม่ใช่ `pnpm` เฉย ๆ) เพราะรันบน PowerShell — ดูเหตุผลเต็มๆ ท้าย README หรือใช้ Git Bash แทนก็พิมพ์ `pnpm` เฉยๆ ได้โดยไม่ต้องมี `.cmd`

**หลังตั้งค่าเสร็จรอบแรก** ครั้งต่อไปแค่รัน:
```bash
cd backend && docker compose up -d      # ถ้ายังรันอยู่ไม่ต้องรันซ้ำ
cd ../frontend && pnpm.cmd run dev
```

**แก้โค้ด backend แล้วอยาก reload:**
```bash
cd backend
docker compose restart backend
```
(รอ ~1-1.5 นาที)

รันแบบ docker เต็มระบบ (frontend ผ่าน nginx ด้วย ไม่ต้องรัน `pnpm dev`) ดูรายละเอียดใน `backend/docker-compose.yml`
และ `frontend/docker-compose.yml`

---
