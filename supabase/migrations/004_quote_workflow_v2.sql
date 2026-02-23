-- ============================================================
-- MishaTravel - Quote Workflow V2 Migration
-- Simplifies workflow: requested → offered → accepted → confirmed
-- Adds: preview_price, participants, quote_documents, contract fields
-- ============================================================

-- ============================================================
-- 1. New enum values for quote_status
-- ============================================================

ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'requested';
ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'offered';

-- ============================================================
-- 2. Migrate existing records to new status values
-- (Must be in separate transaction after ADD VALUE)
-- ============================================================

-- Note: In Supabase dashboard, run these UPDATE statements AFTER
-- the ALTER TYPE above has been committed:
--
-- UPDATE quote_requests SET status = 'requested' WHERE status IN ('sent', 'in_review');
-- UPDATE quote_requests SET status = 'offered' WHERE status = 'offer_sent';
-- UPDATE quote_requests SET status = 'confirmed' WHERE status = 'payment_sent';

-- ============================================================
-- 3. Add preview_price columns to quote_requests
-- ============================================================

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS preview_price numeric,
  ADD COLUMN IF NOT EXISTS preview_price_label text;

-- preview_price: numeric value (e.g., 2739)
-- preview_price_label: display text (e.g., "€2.739 p.p." or "Prezzo su richiesta")

-- ============================================================
-- 4. Create quote_participants table
-- ============================================================

CREATE TABLE IF NOT EXISTS quote_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  document_type text,          -- "Passaporto", "Carta d'identità"
  document_number text,
  is_child boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. Add contract fields to quote_offers
-- ============================================================

ALTER TABLE quote_offers
  ADD COLUMN IF NOT EXISTS contract_file_url text,
  ADD COLUMN IF NOT EXISTS iban text;

-- Populated by admin AFTER agency acceptance (confirmed step)

-- ============================================================
-- 6. Create quote_documents table (quote-level files)
-- ============================================================

CREATE TABLE IF NOT EXISTS quote_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  document_type text DEFAULT 'altro',  -- 'fattura', 'contratto', 'altro'
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE quote_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_documents ENABLE ROW LEVEL SECURITY;

-- quote_participants: agency can read own records
CREATE POLICY "Agency can view own quote participants"
  ON quote_participants FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM quote_requests
      WHERE agency_id IN (
        SELECT id FROM agencies WHERE user_id = auth.uid()
      )
    )
  );

-- quote_participants: service_role (admin) can do everything (via admin client)

-- quote_documents: agency can read own records
CREATE POLICY "Agency can view own quote documents"
  ON quote_documents FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM quote_requests
      WHERE agency_id IN (
        SELECT id FROM agencies WHERE user_id = auth.uid()
      )
    )
  );

-- quote_documents: service_role (admin) can do everything (via admin client)

-- ============================================================
-- 8. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quote_participants_request_id
  ON quote_participants(request_id);

CREATE INDEX IF NOT EXISTS idx_quote_documents_request_id
  ON quote_documents(request_id);
