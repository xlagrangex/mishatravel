'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import { agencyApprovedEmail } from '@/lib/email/templates'

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
 * Approve an agency from the admin dashboard widget.
 * Updates status to 'active' and notifies the agency user.
 */
export async function approveAgencyFromDashboard(
  agencyId: string
): Promise<ActionResult> {
  const supabase = createAdminClient()

  // First get the agency to find the user_id, business_name and email
  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('user_id, business_name, email')
    .eq('id', agencyId)
    .single()

  if (fetchError || !agency) {
    return { success: false, error: fetchError?.message ?? 'Agenzia non trovata' }
  }

  // Update agency status to active
  const { error } = await supabase
    .from('agencies')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', agencyId)

  if (error) return { success: false, error: error.message }

  // Notify the agency user that their account is approved
  await supabase.from('notifications').insert({
    user_id: agency.user_id,
    title: 'Account approvato',
    message: `La tua agenzia "${agency.business_name}" è stata approvata. Puoi ora accedere all'area riservata.`,
    link: '/agenzia/dashboard',
  })

  // --- Email: notify agency that account is approved ---
  try {
    if (agency.email) {
      await sendTransactionalEmail(
        { email: agency.email, name: agency.business_name },
        'Il tuo account MishaTravel è stato approvato!',
        agencyApprovedEmail(agency.business_name)
      )
    }
  } catch (emailErr) {
    console.error('Error sending agency approved email:', emailErr)
  }

  revalidatePath('/admin')
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
