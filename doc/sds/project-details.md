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
