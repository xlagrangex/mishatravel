import { createAdminClient } from '@/lib/supabase/admin'

export interface ActivityLogEntry {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  entity_title: string | null
  details: string | null
  changes: Array<{ field: string; from?: string; to?: string }> | null
  created_at: string
}

/**
 * Get activity history for a specific entity (e.g. a tour, cruise, ship).
 */
export async function getEntityHistory(
  entityType: string,
  entityId: string,
  limit = 20
): Promise<ActivityLogEntry[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('user_activity_log')
    .select('id, user_id, action, entity_type, entity_id, entity_title, details, changes, created_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  // Fetch user emails for all unique user_ids
  const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))] as string[]
  const emailMap = await getUserEmails(userIds)

  return data.map(row => ({
    ...row,
    user_email: row.user_id ? (emailMap.get(row.user_id) ?? null) : null,
  }))
}

/**
 * Get recent activity across all entities (for the admin dashboard).
 */
export async function getRecentActivity(limit = 10): Promise<ActivityLogEntry[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('user_activity_log')
    .select('id, user_id, action, entity_type, entity_id, entity_title, details, changes, created_at')
    .not('entity_type', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))] as string[]
  const emailMap = await getUserEmails(userIds)

  return data.map(row => ({
    ...row,
    user_email: row.user_id ? (emailMap.get(row.user_id) ?? null) : null,
  }))
}

/**
 * Fetch emails from auth.users for a list of user IDs.
 */
async function getUserEmails(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map()

  const supabase = createAdminClient()
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  const map = new Map<string, string>()
  if (data?.users) {
    for (const u of data.users) {
      if (userIds.includes(u.id)) {
        map.set(u.id, u.email ?? 'Utente sconosciuto')
      }
    }
  }
  return map
}
