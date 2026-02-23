-- ============================================================
-- 005: Media Library Enhancement
-- Adds bucket/alt_text columns to media table,
-- creates media_folders table for folder management,
-- adds indexes for performant queries.
-- ============================================================

-- Add new columns to existing media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS bucket text DEFAULT 'general';
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_text text DEFAULT '';

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_bucket ON media(bucket);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);

-- Unique constraint on url to prevent duplicates (needed for idempotent backfill)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_url_unique'
  ) THEN
    ALTER TABLE media ADD CONSTRAINT media_url_unique UNIQUE (url);
  END IF;
END $$;

-- ============================================================
-- Media Folders table
-- ============================================================

CREATE TABLE IF NOT EXISTS media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- RLS for media_folders
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_folders_public_read"
  ON media_folders FOR SELECT
  USING (true);

CREATE POLICY "media_folders_admin_write"
  ON media_folders FOR ALL
  USING (
    get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'admin'::user_role, 'operator'::user_role])
  );

-- Seed default folders matching storage bucket names
INSERT INTO media_folders (name) VALUES
  ('general'),
  ('tours'),
  ('cruises'),
  ('ships'),
  ('blog'),
  ('catalogs'),
  ('agencies')
ON CONFLICT (name) DO NOTHING;
