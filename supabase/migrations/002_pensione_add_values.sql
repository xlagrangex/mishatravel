-- Add new values to pensione_type enum.
-- Requested by programmazione team: allow "trattamento come da programma"
-- and "prima colazione" in addition to the existing no/mezza/completa.
--
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block,
-- so each statement is standalone. Supabase dashboard SQL editor handles
-- this correctly; if running via psql add `COMMIT` between statements.

ALTER TYPE pensione_type ADD VALUE IF NOT EXISTS 'colazione';
ALTER TYPE pensione_type ADD VALUE IF NOT EXISTS 'come_programma';
