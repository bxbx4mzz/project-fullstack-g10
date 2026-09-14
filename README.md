# ระบบเช่าเสื้อผ้า - Login ด้วย Google (G10)

Monorepo:

```
frontend/   React + TypeScript + Vite (pnpm)
backend/    Spring Boot + Spring Security (OAuth2/OIDC Client) + PostgreSQL
```

ตอนนี้ implement เฉพาะ **ระบบ login ด้วย Google + แยกสิทธิ์ CUSTOMER / STAFF / ADMIN**
ส่วนฟีเจอร์จัดการชุด/การจอง ยังไม่ได้ทำ (ให้ทีมต่อยอดจากโครงนี้)

---

## ภาพรวมการทำงานของระบบ (อ่านก่อนเริ่มต่อยอด)

### flow การ login ทั้งหมด (สำคัญมาก ควรเข้าใจก่อนแก้โค้ด auth)

```
1. ผู้ใช้กดปุ่ม "เข้าสู่ระบบด้วย Google" ที่ frontend (/login)
   -> เป็นแค่ <a href> ธรรมดาไปที่ {backend}/oauth2/authorization/google

2. Spring Security (ในตัว ไม่ต้องเขียนเอง) redirect ผู้ใช้ไปหน้า login ของ Google จริง ๆ

3. ผู้ใช้เลือกบัญชี Google -> Google redirect กลับมาที่
   {backend}/login/oauth2/code/google?code=...

4. Spring Security แลก code เป็น token กับ Google เอง (เบื้องหลัง)
   แล้วเรียก CustomOAuth2UserService.loadUser(...) ที่เราเขียนเอง
   -> upsert แถวในตาราง users (ดูหัวข้อ "การกำหนด role" ด้านล่าง)
   -> คืนค่า CustomOAuth2User (ห่อ entity User ของเราไว้เป็น principal)

5. OAuth2LoginSuccessHandler ตั้ง session cookie (RENTAL_SESSION, HttpOnly)
   แล้ว redirect กลับไปที่ {frontend}/oauth2/redirect

6. หน้า OAuthRedirectPage (frontend) เรียก GET /api/auth/me
   (แนบ cookie ด้วย credentials: 'include') เพื่อดึง user + role ปัจจุบัน
   -> ถ้าได้ user -> เด้งไป /dashboard
   -> ถ้า 401 -> เด้งกลับไป /login

7. หน้าอื่น ๆ ที่ต้อง login (เช่น /dashboard) ห่อด้วย <ProtectedRoute>
   ซึ่งเช็คจาก user ใน AuthContext (ที่ได้จากขั้นตอนที่ 6)
```

**จุดที่มักทำให้ login พังและดีบั๊กยาก (เจอมาแล้วระหว่างทำโปรเจกต์นี้):**

- **Scope มี `openid`** (ดูใน `application.yml`) ทำให้ Spring Security ใช้เส้นทาง **OIDC**
  ไม่ใช่ OAuth2 ธรรมดา ถ้าจะ custom user service ต้อง extends `OidcUserService`
  และ wire ผ่าน `.oidcUserService(...)` ใน `SecurityConfig`
  (ไม่ใช่ `.userService(...)` ซึ่งใช้ได้เฉพาะ provider ที่ไม่มี `openid` scope)
  ถ้าใช้ผิดตัว จะ login ผ่าน Google ได้ปกติ แต่ `/api/auth/me` จะตอบ 401 ตลอด
  เพราะ `@AuthenticationPrincipal CustomOAuth2User` resolve ไม่ได้ (principal จริงเป็นคนละ type)
- `FRONTEND_URL` ใน `backend/.env` ต้องตรงกับพอร์ตที่ frontend รันจริง ๆ เป๊ะ ๆ
  (ใช้ทั้งตอน redirect กลับหลัง login และตอนเช็ค CORS) ถ้าพอร์ตไม่ตรง จะดูเหมือน
  "login ได้ แต่เด้งกลับมาหน้า login เฉย ๆ" เพราะ cookie/CORS ใช้ไม่ได้
- Authorized redirect URI ใน Google Cloud Console ต้องเป็น
  `http://localhost:8080/login/oauth2/code/google` เป๊ะ ๆ (ไม่มี `/` ท้ายเกิน)
  ไม่งั้นได้ error `redirect_uri_mismatch` ตั้งแต่ยังไม่ทันเลือกบัญชี

### การกำหนด role (whitelist)

ผู้ใช้ใหม่ (ยังไม่เคย login) จะได้ role ตามนี้:

1. ถ้าอีเมลอยู่ใน `ADMIN_EMAILS` (ใน `backend/.env`) → `ADMIN`
2. ถ้าอีเมลอยู่ใน `STAFF_EMAILS` → `STAFF`
3. ไม่งั้น → `CUSTOMER` (ค่าเริ่มต้น - Gmail อะไรก็ได้ login เข้ามาได้)

ผู้ใช้ที่เคย login แล้วจะ**คง role เดิมไว้เสมอ** แม้จะถูกลบออกจาก whitelist
ทีหลัง (กันไม่ให้ admin ที่ตั้งไว้ก่อนหน้าโดนแย่ง role เวลาที่ env เปลี่ยน) —
ถ้าต้องเปลี่ยน role ผู้ใช้ที่มีอยู่แล้ว ตอนนี้ทำได้แค่แก้ตรงฐานข้อมูลเอง เช่น
```sql
UPDATE users SET role = 'STAFF' WHERE email = 'someone@example.com';
```
(ยังไม่มีหน้า admin panel ให้เปลี่ยน role ผ่าน UI — อยู่ใน backlog)

`@PreAuthorize` / route matcher ตัวอย่างการแยกสิทธิ์ endpoint อยู่ที่
`backend/src/main/java/com/g10/rental/web/DemoRoleController.java` และ
`SecurityConfig.authorizeHttpRequests(...)`
(`/api/customer/**`, `/api/staff/**`, `/api/admin/**`)

---

## โครงสร้างโปรเจกต์

```
backend/src/main/java/com/g10/rental/
  RentalBackendApplication.java            entry point

  model/
    User.java                              entity หลัก (id, googleId, email, name, pictureUrl, role, timestamps)
    Role.java                              enum CUSTOMER / STAFF / ADMIN
  repository/
    UserRepository.java                    Spring Data JPA repo (findByGoogleId, findByEmail)

  security/
    CustomOAuth2UserService.java           หัวใจของ login: upsert user + กำหนด role จาก whitelist
    CustomOAuth2User.java                  ห่อ User entity ให้เป็น OidcUser principal (มี authorities ROLE_*)
    SecurityConfig.java                    CORS, session cookie, route matcher, @PreAuthorize rules, ต่อ handler ต่าง ๆ
    OAuth2LoginSuccessHandler.java         login สำเร็จ -> redirect กลับ frontend (/oauth2/redirect)
    OAuth2LoginFailureHandler.java         login ไม่สำเร็จ -> redirect กลับ frontend (/login?error=...)

  web/
    AuthController.java                    GET /api/auth/me (logout จัดการโดย Spring Security filter ตรง ๆ ใน SecurityConfig)
    DemoRoleController.java                ตัวอย่าง endpoint แยกสิทธิ์ตาม role (ลบ/แก้ทับได้เลยตอนเริ่มทำฟีเจอร์จริง)
    dto/UserResponse.java                  DTO ที่ /api/auth/me ส่งกลับให้ frontend

  src/main/resources/application.yml       ค่า config ทั้งหมด (datasource, oauth2 client, cookie, frontend-url, ...)

frontend/src/
  main.tsx, App.tsx                        entry + route table (react-router-dom)
  lib/api.ts                               fetch wrapper (API_BASE_URL), googleLoginUrl, fetchCurrentUser, logout
  context/
    AuthContext.tsx                        เก็บ user ปัจจุบัน, loading, refresh(), logout() — ใช้ผ่าน useAuth()
    ThemeContext.tsx                       โหมดมืด/สว่าง (persist ใน localStorage)
  routes/
    ProtectedRoute.tsx                     กันหน้าที่ต้อง login (เช็ค user จาก AuthContext, เด้งไป /login ถ้าไม่ได้ login)
  pages/
    LoginPage.tsx                          ปุ่ม login (แค่ <a href={googleLoginUrl}>)
    OAuthRedirectPage.tsx                  หน้ากลางที่ backend redirect มาหลัง login สำเร็จ -> เรียก /api/auth/me แล้วเด้งต่อ
    DashboardPage.tsx                      หน้าแรกหลัง login (จุดเริ่มต่อยอดฟีเจอร์หลักของระบบ)
    UnauthorizedPage.tsx                   หน้าเวลา role ไม่พอ (403)
  components/
    ThemeToggle.tsx                        ปุ่มสลับ dark/light mode
```

---

## Setup ครั้งแรก

### 1. เตรียมเครื่องมือ

- **JDK 21** (ตัวโปรเจกต์ pin ไว้ที่ Java 21 ใน `pom.xml`) — ถ้าเครื่องมี JDK เวอร์ชันใหม่กว่านี้
  (เช่น 24/25) **แนะนำให้รัน backend ผ่าน Docker แทนการรันตรง ๆ ด้วย `mvnw`** เพราะ Lombok
  ที่ Spring Boot 3.3.4 ล็อกเวอร์ชันไว้ อาจเข้ากันไม่ได้กับ JDK ใหม่มาก ๆ (compile error แบบ
  "cannot find symbol: getXxx()" ทั้งที่โค้ดมี `@Getter`/`@Setter` ครบ) — วิธี Docker ในข้อ 4
  ใช้ image `eclipse-temurin:21-jdk` ให้อยู่แล้ว ไม่ต้องยุ่งกับ JDK บนเครื่องเลย
- **Node.js + pnpm** สำหรับ frontend
- **Docker Desktop** (ใช้รัน Postgres เสมอ และแนะนำให้ใช้รัน backend ด้วยตามเหตุผลข้างบน)

### 2. สร้าง Google OAuth2 Client

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. สร้าง OAuth Client ID ชนิด **Web application**
3. **Authorized redirect URI**: `http://localhost:8080/login/oauth2/code/google`
4. คัดลอก Client ID และ Client Secret ไว้ใช้ในขั้นตอนถัดไป (secret จะดูค่าซ้ำไม่ได้
   หลังปิดหน้าไปแล้ว ถ้าทำหาย ต้องกด "Add secret" สร้างใหม่)

### 3. Environment files

```bash
cp backend/.env.example backend/.env      # ใส่ GOOGLE_CLIENT_ID/SECRET, ADMIN_EMAILS, STAFF_EMAILS
cp frontend/.env.example frontend/.env    # ปรับ VITE_API_BASE_URL ถ้าจำเป็น
```

ใส่อีเมล Google ของคุณเองใน `ADMIN_EMAILS` ใน `backend/.env` เพื่อให้ login
ครั้งแรกได้สิทธิ์ ADMIN ทันที

### 4. รัน (แนะนำ - backend ผ่าน Docker, frontend ตรง ๆ)

```bash
# เปิด Postgres + backend (JDK 21 อยู่ใน container ให้แล้ว ไม่ชนกับ JDK บนเครื่อง)
cd backend
docker compose up -d --build

# frontend
cd ../frontend
pnpm install
pnpm dev        # http://localhost:5173 (ถ้าพอร์ตนี้ถูกใช้อยู่ Vite จะขยับไปพอร์ตถัดไปเอง
                 # ซึ่งจะทำให้ login วนกลับ /login เพราะไม่ตรงกับ FRONTEND_URL ใน backend/.env
                 # ถ้าเจอแบบนี้ ให้ปิด process ที่ค้างพอร์ต 5173 อยู่ก่อน แล้ว pnpm dev ใหม่)
```

Backend รันที่ `http://localhost:8080`, frontend dev server ที่ `http://localhost:5173`
— คนละ origin กัน แต่ CORS + cookie (`SameSite=Lax`) ถูกตั้งค่าให้ใช้งานร่วมกันได้แล้วใน
`SecurityConfig` **ตราบใดที่ frontend รันอยู่ที่พอร์ตเดียวกับ `FRONTEND_URL` ใน `backend/.env`**

แก้โค้ด backend แล้วอยาก reload ใหม่ (ระหว่างพัฒนา):
```bash
docker compose restart backend
```
(devtools ที่ mount ไว้ไม่ auto-recompile เองถ้าไม่มีตัวเฝ้าไฟล์แยกต่างหาก restart container
ตรง ๆ ชัวร์กว่า ใช้เวลาประมาณ 1-1.5 นาที เพราะต้อง compile ใหม่ + boot Spring ใหม่)

### 4b. ถ้าอยากรัน backend ตรง ๆ ด้วย mvnw (ต้องมี JDK 21 บนเครื่องจริง ๆ)

```bash
cd backend
docker compose up -d postgres     # เปิดแค่ postgres
./mvnw spring-boot:run            # โหลดค่าใน backend/.env ผ่าน env ของเครื่อง หรือ export ก่อนรัน
```

### 5. รันแบบ Docker เต็มระบบ (จำลอง production มากขึ้น)

สร้าง network กลางก่อน (ใช้ร่วมกันระหว่าง service):

```bash
docker network create project_pj-net
```

```bash
cd backend && docker compose up -d --build     # backend + postgres
cd ../frontend && NGINX_PORT=6000 NGINX_PROXY=http://g10-pj-backend:8080 docker compose up -d --build
```

หรือใส่ `NGINX_PORT` / `NGINX_PROXY` ใน `frontend/.env` แล้วรัน `docker compose up -d --build` เฉย ๆ

เปิดที่ `http://localhost:6000` (nginx proxy ทั้ง `/api`, `/oauth2`, `/login`
ไปที่ backend ให้อยู่ origin เดียวกัน คุกกี้ session จึงใช้งานได้)

> หมายเหตุ: ถ้า deploy จริง ต้องเพิ่ม redirect URI ที่ตรงกับโดเมนจริงใน
> Google Cloud Console ด้วย ไม่ใช่แค่ localhost

---

## จะต่อยอดฟีเจอร์ใหม่ยังไง

### เพิ่ม API endpoint ใหม่ (backend)

1. สร้าง `@RestController` ใหม่ใน `web/` (ดู `DemoRoleController.java` เป็นตัวอย่าง)
2. ถ้า endpoint ต้อง login/จำกัด role เพิ่ม path pattern ใน
   `SecurityConfig.authorizeHttpRequests(...)` (ไม่งั้น default คือต้อง login อย่างเดียว
   ไม่เช็ค role เพราะ `.anyRequest().authenticated()` เป็นตัวจับ fallback)
3. ถ้าต้องการ user ปัจจุบันใน controller ใช้ `@AuthenticationPrincipal CustomOAuth2User principal`
   แล้วเรียก `principal.getUser()` เพื่อได้ entity `User` จริง ๆ (ดูตัวอย่างใน `AuthController.me()`)
4. entity ใหม่ ๆ (เช่น เสื้อผ้า, การจอง) วางใน `model/`, repo ใน `repository/`
   — `spring.jpa.hibernate.ddl-auto: update` ใน `application.yml` จะสร้าง/อัปเดต table
   ให้อัตโนมัติตอน start (สะดวกตอน dev แต่**ไม่ควรใช้ค่านี้ตอน production** เปลี่ยนเป็น
   migration tool อย่าง Flyway/Liquibase ก่อน deploy จริง)

### เพิ่มหน้าใหม่ (frontend)

1. สร้างไฟล์ใน `src/pages/`
2. เพิ่ม `<Route>` ใน `App.tsx`
3. ถ้าหน้าต้อง login ห่อด้วย `<ProtectedRoute>` เหมือน `/dashboard`
   (ถ้าต้องจำกัด role เพิ่มด้วย ตอนนี้ `ProtectedRoute` ยังเช็คแค่ "login หรือยัง"
   ยังไม่เช็ค role — ถ้าต้องใช้ ให้ต่อยอดจาก `useAuth().user.role`)
4. เรียก backend ผ่าน `fetch` แบบเดียวกับใน `lib/api.ts` (อย่าลืม `credentials: 'include'`
   ไม่งั้น cookie session จะไม่ถูกแนบไปด้วย แล้วจะโดน 401)

---

## โครงสร้างที่สำคัญ (สรุปสั้น ๆ)

```
backend/src/main/java/com/g10/rental/
  model/User.java, Role.java              entity + enum role
  repository/UserRepository.java
  security/
    CustomOAuth2UserService.java          upsert user + กำหนด role จาก whitelist (OIDC user service)
    CustomOAuth2User.java                 wrap User เป็น OidcUser (มี authorities ROLE_*)
    SecurityConfig.java                   CORS, session, oauth2Login wiring, @PreAuthorize rules
    OAuth2LoginSuccessHandler.java        redirect กลับ frontend หลัง login สำเร็จ
    OAuth2LoginFailureHandler.java        redirect กลับ /login?error=... ถ้า login ไม่สำเร็จ
  web/AuthController.java                 GET /api/auth/me
  web/DemoRoleController.java             ตัวอย่าง endpoint แยกสิทธิ์ (ลบ/แก้ได้)

frontend/src/
  lib/api.ts                              fetch wrapper + googleLoginUrl
  context/AuthContext.tsx                 user state, refresh(), logout()
  context/ThemeContext.tsx                โหมดมืด/สว่าง (persist ที่ localStorage)
  routes/ProtectedRoute.tsx               กันหน้าที่ต้อง login / เช็ค role
  pages/LoginPage.tsx, OAuthRedirectPage.tsx, DashboardPage.tsx, UnauthorizedPage.tsx
```

---

## สิ่งที่ยังต้องทำต่อ (ไม่ได้อยู่ใน scope นี้)

- หน้า Admin panel สำหรับเปลี่ยน role ผู้ใช้ (ตอนนี้ทำผ่าน DB/whitelist env เท่านั้น)
- โมดูลจัดการชุด, การจอง, เช็คของว่าง, คำนวณราคา ตามที่ระบุใน requirement เดิม
- CI/CD, production secrets management (ตอนนี้ secrets อยู่ใน `.env` ที่ไม่ commit เท่านั้น)
- เปลี่ยน `spring.jpa.hibernate.ddl-auto` จาก `update` เป็น migration tool (Flyway/Liquibase)
  ก่อน deploy จริง
- `ProtectedRoute` ฝั่ง frontend ยังเช็คแค่ login/ไม่ login ยังไม่รองรับเช็ค role
  (เช่น กันไม่ให้ CUSTOMER เข้าหน้าที่ควรเป็นของ STAFF/ADMIN เท่านั้น)
