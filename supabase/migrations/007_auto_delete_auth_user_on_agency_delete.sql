-- ============================================================================
-- Migration: Auto-delete auth user when agency is deleted
-- This trigger ensures that deleting an agency record (from ANY source:
-- admin panel, Supabase dashboard, direct SQL) also removes the auth.users
-- record, preventing orphan users that block re-registration.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_agency_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete the auth user (cascades to user_roles, notifications, etc. via FK)
  DELETE FROM auth.users WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

-- Fire AFTER DELETE so the agency row is already gone
DROP TRIGGER IF EXISTS on_agency_deleted ON public.agencies;
CREATE TRIGGER on_agency_deleted
  AFTER DELETE ON public.agencies
  FOR EACH ROW
  EXECUTE FUNCTION handle_agency_deleted();
