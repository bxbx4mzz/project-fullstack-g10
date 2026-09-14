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
  → frontend เรียก GET /api/auth/me → ได้ user → เข้า /dashboard
```

## การกำหนด role

Login ครั้งแรก: เช็คอีเมลกับ `ADMIN_EMAILS` / `STAFF_EMAILS` ใน `backend/.env`
(ไม่อยู่ในลิสต์ไหน = `CUSTOMER`) — login ครั้งต่อไปคง role เดิมเสมอ ไม่เช็คซ้ำ
เปลี่ยน role คนที่มีอยู่แล้วต้องแก้ตรง DB เอง:
```sql
UPDATE users SET role = 'STAFF' WHERE email = 'someone@example.com';
```

---

## Setup & รัน

**เตรียม:** JDK 21 (แนะนำรัน backend ผ่าน Docker เลี่ยงปัญหาเวอร์ชัน JDK บนเครื่อง),
Node.js + pnpm, Docker Desktop

1. สร้าง Google OAuth Client ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → redirect URI = `http://localhost:8080/login/oauth2/code/google`
2. `cp backend/.env.example backend/.env` แล้วใส่ `GOOGLE_CLIENT_ID/SECRET`, `ADMIN_EMAILS`
3. `cp frontend/.env.example frontend/.env`
4. รัน:
   ```bash
   cd backend && docker compose up -d --build     # postgres + backend
   cd ../frontend && pnpm install && pnpm dev     # http://localhost:5173
   ```
5. แก้โค้ด backend แล้วอยาก reload: `docker compose restart backend` (~1-1.5 นาที)

รันแบบ docker เต็มระบบ (frontend ผ่าน nginx ด้วย) ดูรายละเอียดใน `backend/docker-compose.yml`
และ `frontend/docker-compose.yml`

---
