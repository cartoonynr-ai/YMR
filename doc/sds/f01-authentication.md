# F-01: ระบบยืนยันตัวตน (Authentication)

## 1. คำอธิบายฟีเจอร์ (Feature Description)
ระบบสำหรับควบคุมสิทธิ์เข้าใช้งานของผู้ใช้ (Admin และ Counter Staff) โดยต้องมีการยืนยันตัวตนก่อนเข้าใช้งานระบบ

## 2. กลุ่มผู้ใช้งาน (Target Users)
* ผู้ดูแลระบบ (Admin)
* พนักงานเคาน์เตอร์ (Counter Staff)

## 3. ความต้องการทางฟังก์ชัน (Functional Requirements)
* **FR-1.1:** ระบบต้องรองรับการเข้าสู่ระบบ (Login) ด้วย E-mail และ Password
* **FR-1.2:** ระบบต้องจำแนกสิทธิ์การใช้งาน (Role-based Access) ตามประเภทของผู้ใช้งาน
* **FR-1.3:** ระบบต้องรองรับการออกจากระบบ (Logout) เพื่อสิ้นสุดสถานะการใช้งาน (Session) และกลับสู่หน้า Login

## 4. กฎทางธุรกิจ (Business Rules)
* ผู้ใช้ต้องกรอก E-mail และ Password ที่ถูกต้องเท่านั้น
* หากไม่ได้เข้าสู่ระบบ จะไม่สามารถเข้าถึงหน้าจออื่น ๆ ได้

## 5. ข้อมูลที่เกี่ยวข้อง (Data Requirements)
* E-mail, Password, สิทธิ์การใช้งาน (Role)

## 6. ส่วนติดต่อผู้ใช้งาน (User Interface)
* **หน้าเข้าสู่ระบบ (Login Screen):** ประกอบด้วยฟอร์มกรอก E-mail, Password และปุ่มเข้าสู่ระบบ

### Wireframe
```text
┌──────────────────────────────────────────┐
│                                          │
│   [Logo]  YMR CHONBURI                   │
│           ระบบจัดการอะไหล่รถจักรยานยนต์      │
│                                          │
│   เข้าสู่ระบบ                                │
│   กรุณาเลือกประเภทผู้ใช้งานและกรอกข้อมูลเพื่อเข้าใช้งานระบบ |              │
│                                          │
│   ┌────────────────────────────────────┐ │
│   │ [•] ผู้ดูแลระบบ                       |
|   |      Admin จัดการสินค้า สต็อก คำสั่งซื้อ  │  │
│   └────────────────────────────────────┘ │
│   ┌────────────────────────────────────┐ │
│   │ [ ] พนักงานขายหน้าร้าน                \ |
|   |      Staff                          │  │
│   └────────────────────────────────────┘  │
│                                            │
│   อีเมล (E-mail)                           │
│   [_______________________________]        │
│   รหัสผ่าน                                  │
│   [_______________________________] [👁]    │
│                                            │
│   ( ) จดจำการเข้าสู่ระบบ                       │
│                                            │
│   [           เข้าสู่ระบบ                ]  │
│                                            │
│   หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ         │
└──────────────────────────────────────────┘
```

## 7. เกณฑ์การยอมรับ (Acceptance Criteria)
* เมื่อผู้ใช้กรอกข้อมูลถูกต้อง ระบบต้องพายังหน้า Dashboard ตามสิทธิ์ผู้ใช้งาน
* เมื่อผู้ใช้กดออกจากระบบ ระบบต้องทำลาย Session และกลับไปหน้า Login

## 8. System Logic (ลอจิกการทำงาน)

### 8.1 Authentication Flow (โฟลว์การเข้าสู่ระบบ)
**1. Frontend (หน้าจอ Login)**
* ผู้ใช้เลือกประเภทผู้ใช้งาน (ผู้ดูแลระบบ หรือ พนักงาน) และกรอก E-mail, Password
* **Validation:** ต้องไม่เป็นค่าว่าง, รูปแบบ E-mail ต้องถูกต้อง
* ส่ง Request `POST /api/auth/login` พร้อม Payload: `{ email, password, role, remember_me }`

**2. Backend (การประมวลผล)**
* ค้นหา Database ด้วย `email` (หากไม่พบ -> 401 Error)
* เช็คสถานะ `is_active` (หาก false -> 403 Error บัญชีถูกระงับ)
* เช็ค `role` ว่าตรงกับที่เลือกมาหรือไม่ (หากไม่ตรง -> 403 Error)
* ตรวจสอบ Password กับ `password_hash` ใน Database (หากผิด -> 401 Error)
* สร้าง JWT Token กำหนดอายุตาม `remember_me` และส่งกลับไปให้ Frontend

**3. Post-Login (หลังล็อกอินสำเร็จ)**
* Frontend เก็บ Token (เช่น ใน HttpOnly Cookie หรือ LocalStorage)
* Redirect ตาม Role (`ADMIN` -> `/admin/dashboard`, `STAFF` -> `/staff/dashboard`)

### 8.2 Logout Flow (โฟลว์ออกจากระบบ)
* ผู้ใช้คลิก "ออกจากระบบ"
* ยิง Request `POST /api/auth/logout` เพื่อลบ/เก็บ Log ในฝั่ง Backend
* Frontend ลบ Token ทิ้ง และ Redirect กลับหน้า Login

### 8.3 Security Rules (กฎความปลอดภัย)
* **Password Hashing:** บังคับ Hash รหัสผ่าน (เช่น bcrypt) ห้ามเก็บเป็น Text ปกติ
* **Generic Error Messages:** ให้บอกแค่ "อีเมลหรือรหัสผ่านไม่ถูกต้อง" เพื่อป้องกัน User Enumeration
* **Route & API Guard:** ทุก API ที่ Protected ต้องตรวจสอบ JWT Token เสมอ

## 9. Database Schema (โครงสร้างฐานข้อมูล)

**ตาราง `users`**
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | UUID/INT | Primary Key | รหัสผู้ใช้งาน |
| `email` | VARCHAR | Unique, Not Null | อีเมลที่ใช้ล็อกอิน |
| `password_hash` | VARCHAR | Not Null | รหัสผ่านที่ผ่านการ Hash |
| `role` | ENUM | 'ADMIN', 'STAFF' | ประเภทผู้ใช้งาน |
| `is_active` | BOOLEAN | Default: true | สถานะใช้งาน (ไว้ระงับบัญชี) |
| `created_at` | TIMESTAMP | | วันที่สร้างบัญชี |
| `updated_at` | TIMESTAMP | | วันที่แก้ไขล่าสุด |
