ALTER TABLE public.stock_movements ADD COLUMN document_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('po-documents', 'po-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload PO documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'po-documents');

CREATE POLICY "Anyone can view PO documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'po-documents');
