-- ==============================================================================================
-- YMR Motorcycle Parts & POS System
-- Supabase Schema Initialization Script
-- ==============================================================================================

-- 1. Users (เชื่อมกับ auth.users ของ Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'counter_staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories (หมวดหมู่สินค้า)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, 
  thai_name TEXT NOT NULL, 
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products (สินค้าคงคลัง)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  compatibility TEXT,
  category_id UUID REFERENCES public.categories(id),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customers & Addresses (ลูกค้าและที่อยู่)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  house_number TEXT,
  street TEXT,
  sub_district TEXT,
  district TEXT,
  province TEXT,
  zipcode TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders (คำสั่งซื้อ)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('LINE', 'FB', 'POS')),
  customer_id UUID REFERENCES public.customers(id),
  customer_address_id UUID REFERENCES public.customer_addresses(id),
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Awaiting payment', 'Paid', 'Cancelled')),
  payment_method TEXT CHECK (payment_method IN ('CASH', 'BANK TRANSFER', 'CASH ON DELIVERY')),
  cancel_reason TEXT,
  created_by UUID REFERENCES public.users(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items (รายการสินค้าในคำสั่งซื้อ)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Stock Movements (ประวัติความเคลื่อนไหวสต็อก)
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  change INTEGER NOT NULL, 
  balance INTEGER NOT NULL, 
  reason TEXT NOT NULL, 
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================================
-- Row Level Security (RLS) Policies (Optional - เตรียมไว้เผื่อใช้งาน)
-- ==============================================================================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ...
