# project-fullstack-g10

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
---
## Setup & รัน

1. สร้าง Google OAuth Client ที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → redirect URI = `http://localhost:8080/login/oauth2/code/google`
2. `cp backend/.env.example backend/.env` แล้วใส่ `GOOGLE_CLIENT_ID/SECRET`, `ADMIN_EMAILS`
3. `cp frontend/.env.example frontend/.env`
4. รัน:
   ```bash
   cd backend && docker compose up -d --build     # postgres + backend
   cd ../frontend && pnpm install && pnpm dev     # http://localhost:5173
   ```
5. แก้โค้ด backend แล้วอยาก reload: `docker compose restart backend` 

รันแบบ docker เต็มระบบ (frontend ผ่าน nginx ด้วย) ดูรายละเอียดใน 
`backend/docker-compose.yml` และ `frontend/docker-compose.yml`
---
