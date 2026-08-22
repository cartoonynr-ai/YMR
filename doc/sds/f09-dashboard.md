# F-09: ระบบหน้าปัดสรุปข้อมูล (Dashboard & Reporting)

## 1. คำอธิบายฟีเจอร์ (Feature Description)
หน้าจอแรกหลังจากผู้ดูแลระบบเข้าสู่ระบบสำเร็จ (Landing Page) ใช้สำหรับแสดงภาพรวมของธุรกิจ ทั้งสรุปยอดขาย สถานะสต็อกวิกฤต ออเดอร์ล่าสุด และความเคลื่อนไหวของสต็อก เพื่อให้ Admin ตัดสินใจและตรวจสอบความเรียบร้อยได้ทันที

## 2. กลุ่มผู้ใช้งาน (Target Users)
* ผู้ดูแลระบบ (Admin)

## 3. ความต้องการทางฟังก์ชัน (Functional Requirements)
* **FR-9.1:** ระบบต้องแสดงการ์ดสรุปข้อมูลที่สำคัญ (KPI) จำนวน 5 ส่วน ได้แก่ Total SKU, Low Stock, Alert, Today's Orders, และ Storefront Revenue
* **FR-9.2:** ระบบต้องแสดงตารางสินค้าระดับวิกฤต (Stock Criticality) โดยแสดงรายการสินค้าที่สถานะเป็น Low Stock และ Out of Stock
* **FR-9.3:** ระบบต้องแสดงรายการออเดอร์ล่าสุด (Recent Orders) โดยเรียงจากใหม่สุดไปเก่าสุด พร้อมระบุช่องทาง (LINE/FB/POS) และสถานะการชำระเงิน
* **FR-9.4:** ระบบต้องแสดงประวัติความเคลื่อนไหวสต็อกล่าสุด (Latest Stock Movements) แสดงจำนวนที่เปลี่ยนแปลง (+/-) และยอดคงเหลือ (Balance)

## 4. กฎทางธุรกิจ (Business Rules)
* ข้อมูลยอดขายและออเดอร์จะแสดงผลอัปเดตอัตโนมัติตามวันปัจจุบัน (Today)
* สินค้าจะแสดงในตาราง Stock Criticality ก็ต่อเมื่อจำนวนคงเหลือ (Stock QTY) น้อยกว่าหรือเท่ากับ Minimum Threshold ที่ตั้งไว้ในระบบ

## 5. ข้อมูลที่เกี่ยวข้อง (Data Requirements)
* **KPI Data:** Total SKU Count, Count of Low Stock Items, Alert Count, Count of Today's Orders, Sum of Today's Storefront Revenue
* **Stock Criticality:** Product Name, Category, Stock QTY, Status (Low Stock / Out of Stock), SKU, Threshold
* **Recent Orders:** Channel, Order ID, Total Price, Customer Name, Status (e.g., Awaiting payment, Paid, Completed)
* **Stock Movements:** Product SKU, Change Amount, Reason/Note, Timestamp, Balance

## 6. ส่วนติดต่อผู้ใช้งาน (User Interface)
* **เลย์เอาต์:** แบ่งเป็นส่วนบน (KPI Cards 5 ใบ) และส่วนล่างแบ่งเป็นฝั่งซ้าย-ขวา 
* **ส่วนตาราง:** ตาราง Stock Criticality จะอยู่ด้านล่าง KPI ส่วน Recent Orders และ Latest stock movements จะจัดวางคู่กันซ้ายขวาในส่วนล่างสุด

## 7. เกณฑ์การยอมรับ (Acceptance Criteria)
* **AC-01:** เมื่อ Admin ล็อกอินเข้าสู่ระบบ จะต้องพบหน้า Dashboard เป็นหน้าแรก
* **AC-02:** ข้อมูลในหน้า Dashboard จะต้องดึงข้อมูลจากฐานข้อมูลมาแสดงผลได้อย่างถูกต้อง
