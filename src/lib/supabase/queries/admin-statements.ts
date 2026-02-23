import { createAdminClient } from '../admin'

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
  agency: {
    id: string
    business_name: string
  } | null
}

export type StatementStats = {
  total: number
  bozze: number
  inviati: number
  thisMonth: number
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getAllStatements(filters?: {
  agency_id?: string
  stato?: string
  date_from?: string
  date_to?: string
}): Promise<StatementListItem[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('account_statements')
    .select(
      `
      id,
      title,
      file_url,
      data,
      stato,
      created_at,
      agency:agencies!agency_id(id, business_name)
    `
    )
    .order('data', { ascending: false })

  if (filters?.agency_id) {
    query = query.eq('agency_id', filters.agency_id)
  }
  if (filters?.stato) {
    query = query.eq('stato', filters.stato)
  }
  if (filters?.date_from) {
    query = query.gte('data', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('data', filters.date_to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching statements:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    file_url: row.file_url,
    data: row.data,
    stato: row.stato,
    created_at: row.created_at,
    agency: row.agency
      ? { id: row.agency.id, business_name: row.agency.business_name }
      : null,
  }))
}

export async function getStatementStats(): Promise<StatementStats> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('account_statements')
    .select('id, stato, created_at')

  if (error || !data) {
    return { total: 0, bozze: 0, inviati: 0, thisMonth: 0 }
  }

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()

  return {
    total: data.length,
    bozze: data.filter((s) => s.stato === 'Bozza').length,
    inviati: data.filter((s) => s.stato === 'Inviato via Mail').length,
    thisMonth: data.filter((s) => s.created_at >= firstOfMonth).length,
  }
}

/**
 * Get all active agencies for the select dropdown.
 */
export async function getActiveAgenciesForSelect(): Promise<
  { id: string; business_name: string }[]
> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agencies')
    .select('id, business_name')
    .eq('status', 'active')
    .order('business_name')

  if (error) {
    console.error('Error fetching agencies for select:', error)
    return []
  }

  return data ?? []
}
