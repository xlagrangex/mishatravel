import { createClient } from '@/lib/supabase/server'
import type { AccountStatement } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatementListItem = {
  id: string
  title: string | null
  file_url: string | null
  data: string | null
  stato: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Helper: get agency_id for current user
// ---------------------------------------------------------------------------

async function getAgencyId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return agency?.id ?? null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all account statements for the current agency, optionally filtered by date range.
 */
export async function getAgencyStatements(
  dateFrom?: string,
  dateTo?: string
): Promise<StatementListItem[]> {
  const agencyId = await getAgencyId()
  if (!agencyId) return []

  const supabase = await createClient()
  let query = supabase
    .from('account_statements')
    .select('id, title, file_url, data, stato, created_at')
    .eq('agency_id', agencyId)
    .order('data', { ascending: false })

  if (dateFrom) {
    query = query.gte('data', dateFrom)
  }
  if (dateTo) {
    query = query.lte('data', dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching agency statements:', error)
    return []
  }

  return (data ?? []) as StatementListItem[]
}
