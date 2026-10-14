# ระบบเช่าเสื้อผ้า - project-fullstack-g10

## Description
A full stack clothing rental web application designed for customers, staff, and administrators (store owners). Customers can browse and rent clothing, staff can manage rental operations, and admin can manage the store. The system also provides online payment (currently a mock payment flow) and a Gemini AI chatbot for customer assistance.

## Tech stack
```
Frontend
- React + TypeScript + Vite (pnpm) + Tailwind CSS + Zustand

Backend
- Java (JDK 21) + Spring Boot + REST API (OAuth2/OIDC)

Database
- PostgreSQL

Deployment
- Docker & Docker Compose

AI
- Gemini AI (Chat AI)

Payment
- Mock payment (จำลองการจ่ายเงิน)
```

---

## สิ่งที่ต้องติดตั้งก่อน

| โปรแกรม | ใช้ทำอะไร | ดาวน์โหลด |
|---|---|---|
| **Git** | clone โปรเจกต์ | https://git-scm.com/downloads |
| **Docker Desktop** | รัน backend + database (+ frontend) | https://www.docker.com/products/docker-desktop |
| **Node.js 24 (LTS)** | รัน frontend ด้วย `pnpm dev` | https://nodejs.org |

> ไม่ต้องลง Java / Maven / PostgreSQL ในเครื่อง — ทั้งหมดรันอยู่ใน Docker
>
> ถ้าในเครื่องมี PostgreSQL รันอยู่ที่ port **5432** หรือมีโปรแกรมอื่นใช้ port **8080 / 3000** อยู่ ให้ปิดก่อน ไม่งั้น Docker จะ error

คำสั่งทั้งหมดด้านล่างใช้ได้ใน **PowerShell** (terminal ใน VS Code) และ Git Bash

---

## Setup ครั้งแรก

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/bxbx4mzz/project-fullstack-g10.git
cd project-fullstack-g10
```

### 2. ลง pnpm
```bash
npm install -g pnpm
```

### 3. สร้าง Google OAuth Client (ใช้ login)
ไปที่ [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
→ **Create credentials → OAuth client ID** → Application type: **Web application**

ใน **Authorized redirect URIs** ใส่ทั้ง 2 อัน:
- `http://localhost:8080/login/oauth2/code/google` (ใช้ตอนรัน frontend ด้วย `pnpm dev`)
- `http://localhost:3000/login/oauth2/code/google` (ใช้ตอนรัน frontend ใน Docker)

เก็บ **Client ID** กับ **Client Secret** ไว้ใช้ในข้อ 5

> ถ้า OAuth consent screen อยู่ในโหมด **Testing** ต้องเพิ่มอีเมลของทุกคนที่จะ login ไว้ใน **Test users** ด้วย

### 4. สร้าง Gemini API key (ใช้ Chat AI)
ไปที่ https://aistudio.google.com/apikey → **Create API key** → เก็บไว้ใช้ในข้อ 5

### 5. ตั้งค่า backend
```bash
cp backend/.env.example backend/.env
```
เปิดไฟล์ `backend/.env` แล้วใส่ค่า:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — จากข้อ 3
- `GEMINI_API_KEY` — จากข้อ 4
- `ADMIN_EMAILS` — อีเมล Google ของตัวเอง (จะได้สิทธิ์ ADMIN ตอน login ครั้งแรก)
- `STAFF_EMAILS` — อีเมลที่อยากให้เป็น STAFF (ถ้ามี, คั่นด้วย comma ไม่เว้นวรรค)

ค่าอื่นปล่อยตามเดิมได้ (database ใช้ชื่อ `rental`, user `postgres`, password `1234` ซึ่งตั้งไว้ใน `backend/docker-compose.yml` แล้ว)

> **ห้าม commit ไฟล์ `.env`** (ถูก gitignore ไว้แล้ว) และอย่าแชร์รูปที่เห็นค่าในไฟล์นี้

### 6. ตั้งค่า frontend + ลง dependency
```bash
cp frontend/.env.example frontend/.env
cd frontend
pnpm install
cd ..
```

### 7. รัน backend + database ด้วย Docker
เปิด **Docker Desktop** ทิ้งไว้ก่อน แล้ว:
```bash
cd backend
docker compose up -d --build
```
ครั้งแรกจะช้าหน่อย (ต้องโหลด image + dependency หลายนาที)

เช็คว่าขึ้นครบด้วย `docker compose ps` — ต้องเห็น `g10-pj-postgres`, `g10-pj-backend`, `g10-pj-frontend` เป็น `running` (postgres เป็น `healthy`)

backend ต้องใช้เวลาเริ่มต้นอีกประมาณ 30 วินาที ดูได้ด้วย:
```bash
docker compose logs -f backend
```
เห็นบรรทัด `Started RentalApplication` แล้วกด `Ctrl+C` เพื่อออกจาก log

### 8. ใส่ข้อมูลสินค้าตัวอย่าง (ทำครั้งเดียว)
ทำ **หลัง** backend ขึ้นแล้ว (backend เป็นตัวสร้างตารางใน database) ยังอยู่ในโฟลเดอร์ `backend`:
```bash
docker cp seed-products.sql g10-pj-postgres:/seed-products.sql
docker exec g10-pj-postgres psql -U postgres -d rental -f /seed-products.sql
```
จะได้สินค้าตัวอย่าง 5 ชิ้น — **รันซ้ำจะได้สินค้าซ้ำ** ให้รันแค่ครั้งเดียว

### 9. รัน frontend
```bash
cd ../frontend
pnpm dev
```
เปิดเบราว์เซอร์ไปที่ **http://localhost:5173** → กด **Sign in with Google**

---

## การรันครั้งต่อไป

เปิด Docker Desktop แล้ว:
```bash
cd backend
docker compose up -d
cd ../frontend
pnpm dev
```
แล้วเปิด http://localhost:5173

หยุด container ทั้งหมด (ข้อมูลใน database ยังอยู่): `cd backend` แล้ว `docker compose stop`

---

## รันทั้งระบบใน Docker (ไม่ต้องรัน `pnpm dev`)

ใช้แบบนี้ตอนจะ demo หรือทดลองแบบเดียวกับตอน deploy — `docker compose up -d --build` ในข้อ 7 สร้าง container frontend (nginx) ไว้ให้แล้ว

1. ใน `backend/.env` ตั้ง `FRONTEND_URL=http://localhost:3000` แล้วรัน (ในโฟลเดอร์ `backend`):
   ```bash
   docker compose up -d backend
   ```
2. เปิด **http://localhost:3000**

> `FRONTEND_URL` คือที่ที่ backend ส่งผู้ใช้กลับไปหลัง login ใช้ได้ทีละแบบ — ถ้ากลับไปใช้ `pnpm dev` ให้เปลี่ยนกลับเป็น `http://localhost:5173` แล้วรัน `docker compose up -d backend` อีกครั้ง

nginx ใน container frontend ส่งต่อ `/api`, `/oauth2`, `/login`, `/uploads` ไปที่ backend ให้ frontend กับ backend อยู่ origin เดียวกัน
เปลี่ยน port ได้ด้วย `FRONTEND_PORT` ใน `backend/.env` (อย่าใช้ 6000 เพราะ Chrome บล็อก)
ถ้าแก้โค้ด frontend ต้องรัน `docker compose up -d --build frontend` ใหม่ถึงจะเห็นผล

