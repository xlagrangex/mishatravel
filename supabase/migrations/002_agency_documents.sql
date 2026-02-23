-- Agency documents (visura camerale, etc.)
CREATE TABLE IF NOT EXISTS agency_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'visura_camerale',
  file_url text NOT NULL,
  file_name text,
  uploaded_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  notes text
);

CREATE INDEX IF NOT EXISTS idx_agency_documents_agency_id ON agency_documents(agency_id);

ALTER TABLE agency_documents ENABLE ROW LEVEL SECURITY;

-- Agencies can view their own documents
CREATE POLICY "agencies_view_own_docs" ON agency_documents
  FOR SELECT USING (
    agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
  );

-- Agencies can insert their own documents
CREATE POLICY "agencies_insert_own_docs" ON agency_documents
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())
  );

-- Admin full access is implicit via service_role key
