'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthContext } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
  admin_notification_emails: z.string().min(1, 'Almeno un indirizzo email è obbligatorio'),
  sender_email: z.string().email('Email mittente non valida'),
  sender_name: z.string().min(1, 'Il nome mittente è obbligatorio'),
  company_phone: z.string(),
  company_address: z.string(),
  company_website: z.string(),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function saveSettings(
  formData: z.infer<typeof settingsSchema>
): Promise<ActionResult> {
  const { user, role } = await getAuthContext()
  if (!user || role !== 'super_admin') {
    return { success: false, error: 'Accesso non autorizzato' }
  }

  const parsed = settingsSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(', '),
    }
  }

  const supabase = createAdminClient()

  const entries = Object.entries(parsed.data) as [string, string][]
  for (const [key, value] of entries) {
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value: value ?? '', updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      return { success: false, error: `Errore nel salvataggio di "${key}": ${error.message}` }
    }
  }

  revalidatePath('/admin/impostazioni')
  return { success: true }
}
