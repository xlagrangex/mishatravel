-- ============================================================
-- 008: Add prezzo_listino / prezzo_offerta + FK fixes
-- ============================================================

-- 1. Add pricing columns to tours and cruises
ALTER TABLE tours ADD COLUMN IF NOT EXISTS prezzo_listino numeric DEFAULT NULL;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS prezzo_offerta numeric DEFAULT NULL;

ALTER TABLE cruises ADD COLUMN IF NOT EXISTS prezzo_listino numeric DEFAULT NULL;
ALTER TABLE cruises ADD COLUMN IF NOT EXISTS prezzo_offerta numeric DEFAULT NULL;

-- 2. Fix cruises storage bucket: allow PDF uploads
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif','application/pdf']
WHERE id = 'cruises';

-- 3. Fix FK constraints missing ON DELETE SET NULL
ALTER TABLE agency_documents DROP CONSTRAINT IF EXISTS agency_documents_verified_by_fkey;
ALTER TABLE agency_documents ADD CONSTRAINT agency_documents_verified_by_fkey
  FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE quote_documents DROP CONSTRAINT IF EXISTS quote_documents_uploaded_by_fkey;
-- Column was text, already fixed to uuid via direct SQL
ALTER TABLE quote_documents ADD CONSTRAINT quote_documents_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;
