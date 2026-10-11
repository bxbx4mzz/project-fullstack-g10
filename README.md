# ระบบเช่าเสื้อผ้า - project-fullstack-g10

## Description
A full stack clothing rental web application designed for customers, staff, and administrators(store owners). Customers can browse and rent clothing, staff can manage rental operations, and admin can manage the store. The system also provides online payment through a payment gateway and a Gemini AI chatbot for customer assistance.   

## Tech stack
```
Frontend
- React + TypeScript + Vite (pnpm)
  
Backend
- Java (JDK 21) + Spring Boot + REST API (OAuth2/OIDC)
  
Database
- PostgreSQL
  
Deployment
- Docker & Docker Compose
  
AI
- Gemini AI (Chat AI)
  
Pa yment
- Payment Gateway
```

## Setup & รัน (Windows)

1. **Clone โปรเจกต์แล้วเข้าไปที่โฟลเดอร์**
   ```bash
   git clone https://github.com/bxbx4mzz/project-fullstack-g10.git
   cd project-fullstack-g10
   ```

2. **ลง pnpm** 
   ```bash
   npm install -g pnpm
   ```

3. **สร้าง Google OAuth Client** ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → ตอนตั้งค่า **Authorized redirect URI** ใส่ทั้ง 2 อัน:
     - `http://localhost:8080/login/oauth2/code/google` (ใช้ตอนรัน frontend ด้วย `pnpm dev`)
     - `http://localhost:3000/login/oauth2/code/google` (ใช้ตอนรัน frontend ใน Docker)
   → เก็บ **Client ID** กับ **Client Secret** ไว้ใช้ในข้อ 4

4. **ตั้งค่า environment variables ฝั่ง backend**
   ```bash
   cp backend/.env.example backend/.env
   ```
   เปิดไฟล์ `backend/.env` แล้วใส่ค่า:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — จากข้อ 3
   - `ADMIN_EMAILS` — อีเมล Google ของตัวเอง (จะได้สิทธิ์ ADMIN ตอน login ครั้งแรก)
   - `STAFF_EMAILS` — อีเมลที่อยากให้เป็น STAFF (ถ้ามี)
   - `SET PASSWAORD`

5. **ตั้งค่า environment variables ฝั่ง frontend**
   ```bash
   cp frontend/.env.example frontend/.env
   ```

6. **รัน backend + database ผ่าน Docker** (เปิด Docker Desktop ทิ้งไว้ก่อน)
   ```bash
   cd backend
   docker compose up -d --build
   ```
    เช็คว่าขึ้นสำเร็จด้วย `docker compose ps` — ต้องเห็น `g10-pj-backend`, `g10-pj-postgres` และ `g10-pj-frontend` เป็น `running`/`healthy`

7. **ติดตั้ง dependency ฝั่ง frontend**
   ```bash
   cd ../frontend
   pnpm install
   ```

8. **รัน frontend dev server**
   ```bash
   pnpm run dev
   ```
   เสร็จแล้วเปิดเบราว์เซอร์ไปที่ **http://localhost:5173**

### รันทั้งระบบใน Docker (ไม่ต้องรัน `pnpm dev`)

`docker compose up -d --build` ในข้อ 6 สร้าง container frontend (nginx) ให้ด้วยแล้ว ใช้แบบนี้ได้เลย:

1. ใน `backend/.env` ตั้ง `FRONTEND_URL=http://localhost:3000` แล้วรัน `docker compose up -d backend` ใหม่
   (backend ส่งผู้ใช้กลับไปที่ URL นี้หลัง login — ถ้ากลับไปใช้ `pnpm dev` ให้เปลี่ยนเป็น `http://localhost:5173`)
2. เปิด **http://localhost:3000**

nginx ใน container frontend ส่งต่อ `/api`, `/oauth2`, `/login`, `/uploads` ไปที่ backend ให้ frontend กับ backend
อยู่ origin เดียวกัน เปลี่ยน port ได้ด้วย `FRONTEND_PORT` ใน `backend/.env` (อย่าใช้ 6000 เพราะ Chrome บล็อก)
ถ้าแก้โค้ด frontend ต้องรัน `docker compose up -d --build frontend` ใหม่ถึงจะเห็นผล

---
