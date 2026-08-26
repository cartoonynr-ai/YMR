# F-01: Authentication System Logic

เอกสารฉบับนี้อธิบายลอจิกการทำงาน (System Logic) สำหรับระบบยืนยันตัวตน (Authentication) อ้างอิงจากไฟล์ออกแบบ `f01-authentication.md`

## 1. Authentication Flow (โฟลว์การเข้าสู่ระบบ)

### 1.1 Frontend (หน้าจอ Login)
1. ผู้ใช้เลือกประเภทผู้ใช้งาน (ผู้ดูแลระบบ หรือ พนักงาน)
2. ผู้ใช้กรอก E-mail และ Password
3. **Validation ก่อนส่งข้อมูล (ฝั่งหน้าบ้าน):**
   - E-mail และ Password ต้องไม่เป็นค่าว่าง
   - รูปแบบ E-mail ต้องถูกต้อง
   - ต้องมีการเลือกประเภทผู้ใช้งาน
4. ส่ง Request ไปยัง Backend API: `POST /api/auth/login`
   - Payload: `{ "email": "...", "password": "...", "role": "ADMIN" | "STAFF", "remember_me": true | false }`

### 1.2 Backend (การประมวลผลระบบหลังบ้าน)
1. ค้นหาข้อมูลผู้ใช้ใน Database ด้วย `email`
   - หากไม่พบ: ส่ง HTTP 401 Error "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
2. ตรวจสอบสถานะบัญชีผู้ใช้
   - หาก `is_active` เป็น false: ส่ง HTTP 403 Error "บัญชีถูกระงับการใช้งาน"
3. ตรวจสอบ Role (ตาม Business Rule ที่กำหนด)
   - นำ Role ที่ส่งมาจาก Frontend เทียบกับ Role ของผู้ใช้ใน Database
   - หากไม่ตรงกัน (เช่น เป็นพนักงาน แต่เลือกผู้ดูแลระบบ): ส่ง HTTP 403 Error "ไม่มีสิทธิ์เข้าถึงระบบในฐานะนี้"
4. ตรวจสอบ Password
   - นำ Password ที่รับมา เทียบกับ `password_hash` ใน Database ผ่านฟังก์ชันเข้ารหัส (เช่น bcrypt)
   - หากรหัสผ่านผิด: ส่ง HTTP 401 Error "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
5. สร้าง Session / Token (JWT)
   - หากข้อมูลถูกต้องทั้งหมด ทำการสร้าง Token สำหรับระบุตัวตน
   - กำหนดอายุของ Token ตามค่า `remember_me` (เช่น 30 วัน หากเลือก, หรือ 1 วัน หากไม่เลือก)
6. ส่ง Response กลับไปยัง Frontend พร้อม Token และข้อมูล User Profile เบื้องต้น (ไม่รวมรหัสผ่าน)

### 1.3 Post-Login (หลังล็อกอินสำเร็จ)
1. Frontend เก็บ Token ลงในพื้นที่จัดเก็บที่ปลอดภัย (เช่น HttpOnly Cookie หรือ LocalStorage)
2. ทำการ Redirect ผู้ใช้ตาม Role ที่ล็อกอินเข้ามา:
   - `ADMIN` -> `/admin/dashboard`
   - `STAFF` -> `/staff/dashboard` (หรือหน้าจอ POS)

## 2. Logout Flow (โฟลว์ออกจากระบบ)
1. ผู้ใช้คลิกปุ่ม "ออกจากระบบ"
2. ส่ง Request ไปที่ Backend `POST /api/auth/logout` (เผื่อกรณีต้องการเก็บ Log หรือทำ Blacklist Token)
3. Frontend ทำการลบ Token ออกจากระบบ
4. Redirect ผู้ใช้กลับไปที่หน้า Login

## 3. Database Schema (โครงสร้างข้อมูลที่เกี่ยวข้อง)

ตาราง `users`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID/INT | Primary Key | รหัสผู้ใช้งาน |
| `email` | VARCHAR | Unique, Not Null | อีเมลที่ใช้ล็อกอิน |
| `password_hash` | VARCHAR | Not Null | รหัสผ่านที่ผ่านการ Hash (ห้ามเก็บเป็น Text ธรรมดา) |
| `role` | ENUM | 'ADMIN', 'STAFF' | ประเภท/สิทธิ์ของผู้ใช้งาน |
| `is_active` | BOOLEAN | Default: true | สถานะการใช้งาน (ใช้ระงับบัญชีพนักงานที่ออกแล้ว) |
| `created_at` | TIMESTAMP | | วันที่สร้างบัญชี |
| `updated_at` | TIMESTAMP | | วันที่อัปเดตข้อมูลล่าสุด |

## 4. Security Rules (กฎความปลอดภัย)
1. **Password Hashing:** ต้องใช้ Hash function อย่าง bcrypt, argon2 หรือ scrypt
2. **Generic Error Messages:** ไม่แจ้งข้อความผิดพลาดที่บอกใบ้ว่ามีอีเมลนี้ในระบบหรือไม่ (หลีกเลี่ยงข้อความ "ไม่พบอีเมลในระบบ") เพื่อป้องกันผู้ไม่หวังดีสุ่มหาผู้ใช้ (User Enumeration)
3. **Route & API Guard:**
   - **Frontend:** ตรวจสอบ Token และ Role ก่อนอนุญาตให้เข้าถึงหน้าจอต่างๆ เสมอ
   - **Backend:** ทุก Protected API ต้องตรวจสอบความถูกต้องของ Token ก่อนทำงาน (Authorization Check)
