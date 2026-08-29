-- Enable pgcrypto if not already enabled (required for crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Create Auth Users (Admin and Staff)
INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@ymr.com', crypt('admin123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@ymr.com', crypt('staff123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'admin@ymr.com')::jsonb, 'email', current_timestamp, current_timestamp),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', format('{"sub":"%s","email":"%s"}', '22222222-2222-2222-2222-222222222222', 'staff@ymr.com')::jsonb, 'email', current_timestamp, current_timestamp)
ON CONFLICT DO NOTHING;

-- 2. Create Public Users (Mapping with Auth)
INSERT INTO public.users (id, email, full_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@ymr.com', 'Super Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'staff@ymr.com', 'Counter Staff 1', 'Staff')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Categories
INSERT INTO public.categories (id, name, thai_name)
VALUES
  ('33333333-3333-3333-3333-333333333331', 'Engine Parts', 'อะไหล่เครื่องยนต์'),
  ('33333333-3333-3333-3333-333333333332', 'Tires & Wheels', 'ยางและล้อ'),
  ('33333333-3333-3333-3333-333333333333', 'Brake Systems', 'ระบบเบรก'),
  ('33333333-3333-3333-3333-333333333334', 'Accessories', 'อุปกรณ์ตกแต่ง')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Products
INSERT INTO public.products (sku, barcode, name, brand, compatibility, category_id, price, qty, threshold)
VALUES
  ('YMR-ENG-001', '8850000000001', 'หัวเทียนเบอร์ 8', 'NGK', 'Honda Wave 110i, Wave 125i', '33333333-3333-3333-3333-333333333331', 120.00, 50, 10),
  ('YMR-ENG-002', '8850000000002', 'น้ำมันเครื่อง 4T 0.8L', 'Honda', 'รถมอเตอร์ไซค์ 4 จังหวะทั่วไป', '33333333-3333-3333-3333-333333333331', 150.00, 100, 20),
  ('YMR-TIR-001', '8850000000003', 'ยางนอก 70/90-17', 'Michelin', 'Honda Wave, Yamaha Finn', '33333333-3333-3333-3333-333333333332', 550.00, 30, 5),
  ('YMR-TIR-002', '8850000000004', 'ยางใน 2.50-17', 'IRC', 'Honda Wave', '33333333-3333-3333-3333-333333333332', 100.00, 50, 10),
  ('YMR-BRK-001', '8850000000005', 'ผ้าเบรกหน้า (ดิสก์)', 'Brembo', 'PCX, NMAX, Click', '33333333-3333-3333-3333-333333333333', 350.00, 40, 10),
  ('YMR-BRK-002', '8850000000006', 'ผ้าเบรกหลัง (ดรัม)', 'YSS', 'Wave 110i', '33333333-3333-3333-3333-333333333333', 180.00, 40, 10)
ON CONFLICT (sku) DO NOTHING;

-- 5. Create Customers
INSERT INTO public.customers (id, name, phone)
VALUES
  ('55555555-5555-5555-5555-555555555551', 'สมชาย ใจดี', '0812345678'),
  ('55555555-5555-5555-5555-555555555552', 'ลูกค้าทั่วไป (Walk-in)', '-')
ON CONFLICT (id) DO NOTHING;
