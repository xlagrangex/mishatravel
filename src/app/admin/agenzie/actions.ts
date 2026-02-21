'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Update agency status (approve, block, or reactivate).
 */
export async function updateAgencyStatus(
  agencyId: string,
  status: 'active' | 'pending' | 'blocked'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('agencies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', agencyId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/agenzie')
  revalidatePath(`/admin/agenzie/${agencyId}`)
  return { success: true }
}

/**
 * Delete an agency and all related data.
 */
export async function deleteAgency(agencyId: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('agencies')
    .delete()
    .eq('id', agencyId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/agenzie')
  return { success: true }
}
