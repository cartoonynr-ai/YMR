-- Ensure barcode column exists (already in init_schema, but safe to verify)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Create an explicit index for faster searching
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
