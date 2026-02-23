import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AgencyDocument } from '@/lib/types'

/** Get documents for an agency (respects RLS — agency can see own docs). */
export async function getAgencyDocuments(agencyId: string): Promise<AgencyDocument[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agency_documents')
    .select('*')
    .eq('agency_id', agencyId)
    .order('uploaded_at', { ascending: false })

  return (data ?? []) as AgencyDocument[]
}

/** Check if agency has uploaded a visura camerale. */
export async function hasVisuraCamerale(agencyId: string): Promise<boolean> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('agency_documents')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('document_type', 'visura_camerale')

  return (count ?? 0) > 0
}

/** Get documents for an agency — admin view (bypasses RLS). */
export async function getAgencyDocumentsAdmin(agencyId: string): Promise<AgencyDocument[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('agency_documents')
    .select('*')
    .eq('agency_id', agencyId)
    .order('uploaded_at', { ascending: false })

  return (data ?? []) as AgencyDocument[]
}
