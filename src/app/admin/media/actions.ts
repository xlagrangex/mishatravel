'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true; id: string } | { success: false; error: string }

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/media')
  return { success: true, id }
}
