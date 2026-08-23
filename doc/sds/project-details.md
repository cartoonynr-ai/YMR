# รายละเอียดโครงการ (Project Details)

**ชื่อโครงการ:** เว็บไซต์ระบบบริหารจัดการการจำหน่ายอะไหล่รถจักรยานยนต์และหน้าร้าน (Motorcycle Parts Management System)

## 1. บทนำ (Introduction)
เอกสารฉบับนี้จัดทำขึ้นเพื่อระบุข้อกำหนดและความต้องการของซอฟต์แวร์สำหรับ **เว็บไซต์ระบบบริหารจัดการการจำหน่ายอะไหล่รถจักรยานยนต์และหน้าร้าน** โดยอธิบายถึงภาพรวมการทำงานของระบบ ทั้งในส่วนของการจัดการสต็อกสินค้า การบันทึกคำสั่งซื้อออนไลน์ (Facebook, LINE) และการขายหน้าร้านด้วยระบบ POS (Point of Sale)

## 2. ภาพรวมของระบบ (Overall Description)
ระบบถูกออกแบบมาเพื่อเป็นศูนย์กลาง (Centralized System) สำหรับรวมข้อมูลการขายหน้าร้านและการสั่งซื้อออนไลน์เข้าด้วยกัน ช่วยแก้ปัญหาความผิดพลาดในการเช็กสต็อกสินค้าด้วยความจำ ทำให้ทราบจำนวนสินค้าคงเหลือแบบ Real-time

## 3. ขอบเขตของระบบ (Scope)
ระบบนี้เป็น Web Application ที่ใช้งานภายในสำหรับร้านจำหน่ายน้ำมันเครื่องและยางรถจักรยานยนต์ โดยแบ่งสิทธิ์การใช้งานออกเป็น 2 กลุ่มหลัก คือ **ผู้ดูแลระบบ (Admin)** และ **พนักงานเคาน์เตอร์ (Counter Staff)**
*   **สิ่งที่ระบบรองรับ (In Scope):** ระบบจัดการสินค้า หมวดหมู่สินค้า การจัดการสต็อกและการแจ้งเตือน ระบบบันทึกคำสั่งซื้อออนไลน์ ระบบ POS สำหรับขายหน้าร้าน และระบบตรวจสอบประวัติการขาย
*   **สิ่งที่ระบบไม่รองรับ (Out of Scope):** ระบบ E-Commerce สำหรับให้ลูกค้าสั่งซื้อด้วยตนเองผ่านหน้าเว็บไซต์, ระบบตัดเงินอัตโนมัติ (Payment Gateway) และการเชื่อมต่อ API ตรงกับ Facebook/LINE (ผู้ดูแลระบบเป็นผู้บันทึกข้อมูลเข้าระบบเอง)

## 4. กลุ่มผู้ใช้งาน (Target Users)
| ผู้ใช้งาน (Role) | สิทธิ์การใช้งานและหน้าที่ (Responsibilities) |
| :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | จัดการข้อมูลสินค้า สต็อก หมวดหมู่ บันทึกออเดอร์ออนไลน์ (Facebook/LINE) ยกเลิกออเดอร์ และดูประวัติการขาย |
| **พนักงานเคาน์เตอร์ (Counter Staff)** | ทำรายการขายหน้าร้านผ่านระบบ POS สแกนบาร์โค้ด และรับชำระเงิน |

## 5. ความต้องการด้านข้อมูลภาพรวม (Global Data Requirements)
*   **User Data:** E-mail, Password, Role
*   **Product Data:** Product Name, SKU, Barcode, Price, Brand, Part Type, Supported Models, Image, Current Stock, Minimum Threshold, Sale Status
*   **Category Data:** Category ID, Category Name
*   **Order Data:** Order ID, Date, Channel (LINE/Facebook/POS), Customer Info (Name, Address, Phone), Items (Product, Qty), Total Price, Payment Method, Payment Status
*   **Stock History Log:** Product ID, Change Amount (Action), Note, Timestamp
*   **Cancelation Log:** Order ID, Reason, Timestamp

## 6. ข้อจำกัดของระบบ (Constraints)
*   **ฮาร์ดแวร์:** ระบบ POS หน้าร้านต้องสามารถทำงานร่วมกับเครื่องสแกนบาร์โค้ดได้
*   **การเชื่อมต่อ:** จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตตลอดเวลาในการใช้งานเพื่อให้ข้อมูลสต็อกอัปเดตแบบ Real-time
*   **ความปลอดภัย:** ผู้ใช้งานต้องผ่านการเข้าสู่ระบบ (Authentication) ด้วย Email และ Password เท่านั้น

## 7. สถาปัตยกรรมระบบและเทคโนโลยี (System Architecture & Tech Stack)
*   **Frontend:** React (Vite)
*   **Backend:** Node.js (Express.js)
*   **Database:** PostgreSQL (เชื่อมต่อและจัดการผ่านบริการ Supabase)
*   **File Storage:** Supabase Storage (สำหรับเก็บไฟล์รูปภาพสินค้า)
*   **Deployment & Hosting:**
    *   **Frontend:** Vercel หรือ Netlify
    *   **Backend:** Render หรือ Railway

## 8. การบันทึกประวัติระบบ (System Audit Trail)
*   ระบบจะต้องมีการบันทึกประวัติการเปลี่ยนแปลงข้อมูล (Audit Log) อย่างละเอียด
*   ครอบคลุมทุกการกระทำที่สำคัญ ได้แก่ การสร้าง (Create), แก้ไข (Update), และลบ (Delete) ข้อมูลต่างๆ ในระบบ (เช่น สินค้า, พนักงาน)
*   ข้อมูลที่บันทึกต้องระบุ: วันเวลาที่ทำรายการ (Timestamp), ชื่อผู้กระทำ (User), การกระทำ (Action), และรายละเอียดสิ่งที่เปลี่ยนแปลง

## 9. ข้อกำหนดการออกแบบ (UI Design Requirements)
*   **Typography (ฟอนต์):** ใช้ฟอนต์ **Kanit** เป็นฟอนต์หลัก (Base Font) สำหรับทั้งระบบ เพื่อความทันสมัยและอ่านง่าย
*   **Color Palette (สีหลัก):** โทน **สีน้ำเงินเข้ม (Dark Blue)** ตัดกับ **สีขาว (White)** เพื่อให้ความรู้สึกน่าเชื่อถือ เป็นมืออาชีพ (Trust & Professional) และช่วยให้ข้อมูลที่ซับซ้อนในระบบ POS/Inventory ดูสะอาดตาและอ่านง่ายที่สุด
*   **Design Style:** เน้นความรวดเร็วในการใช้งานและความชัดเจนของข้อมูลเป็นหลัก เหมาะสำหรับระบบจัดการหลังบ้าน (Back-office) และหน้าร้าน (POS)
