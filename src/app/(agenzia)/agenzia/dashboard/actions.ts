'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/supabase/auth'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import { adminDocumentUploadedEmail } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'

export async function saveAgencyDocument(
  agencyId: string,
  fileUrl: string,
  fileName: string | null
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Non autenticato' }

  const supabase = createAdminClient()

  // Verify the user owns this agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, user_id, business_name, email')
    .eq('id', agencyId)
    .eq('user_id', user.id)
    .single()

  if (!agency) return { success: false, error: 'Agenzia non trovata' }

  const { error } = await supabase.from('agency_documents').insert({
    agency_id: agencyId,
    document_type: 'visura_camerale',
    file_url: fileUrl,
    file_name: fileName,
  })

  if (error) return { success: false, error: error.message }

  // Notify super_admins in-app
  try {
    const { data: superAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')

    if (superAdmins?.length) {
      await supabase.from('notifications').insert(
        superAdmins.map((admin: { user_id: string }) => ({
          user_id: admin.user_id,
          title: 'Documento caricato',
          message: `L'agenzia "${agency.business_name}" ha caricato la visura camerale.`,
          link: `/admin/agenzie/${agencyId}`,
        }))
      )
    }

    // Email notification
    const adminEmail = process.env.BREVO_ADMIN_EMAIL
    if (adminEmail) {
      await sendTransactionalEmail(
        { email: adminEmail, name: 'Admin MishaTravel' },
        `Visura camerale caricata: ${agency.business_name}`,
        adminDocumentUploadedEmail(agency.business_name, agencyId)
      )
    }
  } catch (e) {
    console.error('Error notifying admin about document upload:', e)
  }

  revalidatePath('/agenzia/dashboard')
  return { success: true }
}
