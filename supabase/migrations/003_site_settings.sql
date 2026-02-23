-- Site settings (key-value store for admin-configurable settings)
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Seed default values
INSERT INTO site_settings (key, value) VALUES
  ('admin_notification_emails', 'info@mishatravel.com'),
  ('sender_email', 'noreply@mishatravel.com'),
  ('sender_name', 'MishaTravel'),
  ('company_phone', '+39 010 246 1630'),
  ('company_address', 'Piazza Grimaldi, Genova'),
  ('company_website', 'https://mishatravel.com')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read/write settings
CREATE POLICY "super_admin_full_access" ON site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'super_admin'
    )
  );
