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

/** Pending document for admin dashboard widget. */
export interface PendingDocument {
  id: string
  agency_id: string
  business_name: string
  file_name: string | null
  file_url: string
  uploaded_at: string
}

/** Get all unverified documents with agency info — admin dashboard widget. */
export async function getPendingDocuments(): Promise<PendingDocument[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('agency_documents')
    .select('id, agency_id, file_name, file_url, uploaded_at, agencies!inner(business_name)')
    .eq('verified', false)
    .order('uploaded_at', { ascending: false })

  if (!data) return []

  return data.map((row: Record<string, unknown>) => {
    const agencies = row.agencies as { business_name: string } | null
    return {
      id: row.id as string,
      agency_id: row.agency_id as string,
      business_name: agencies?.business_name ?? 'N/D',
      file_name: row.file_name as string | null,
      file_url: row.file_url as string,
      uploaded_at: row.uploaded_at as string,
    }
  })
}
