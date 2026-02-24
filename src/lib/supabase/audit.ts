import { getCurrentUser } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Log an admin activity for audit trail.
 * Non-blocking: errors are silently caught to avoid disrupting the main action.
 */
export async function logActivity(params: {
  action: string       // e.g. "tour.update", "cruise.create", "ship.delete"
  entityType: string   // "tour" | "cruise" | "ship" | "destination" | "blog"
  entityId: string
  entityTitle: string
  details?: string
}): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = createAdminClient()

  await supabase.from('user_activity_log').insert({
    user_id: user.id,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_title: params.entityTitle,
    details: params.details ?? null,
  })
}
