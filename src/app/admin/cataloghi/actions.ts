'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const catalogSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  year: z.coerce.number().nullable().optional(),
  cover_image_url: z.string().optional().nullable(),
  pdf_url: z.string().optional().nullable(),
  sort_order: z.coerce.number().default(0),
  is_published: z.boolean().default(false),
})

type ActionResult = { success: true; id: string } | { success: false; error: string }

export async function saveCatalog(formData: z.infer<typeof catalogSchema>): Promise<ActionResult> {
  const parsed = catalogSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { id, ...data } = parsed.data

  // Clean empty strings to null
  const cleanData = {
    ...data,
    year: data.year || null,
    cover_image_url: data.cover_image_url || null,
    pdf_url: data.pdf_url || null,
  }

  if (id) {
    // Update
    const { error } = await supabase
      .from('catalogs')
      .update(cleanData)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/cataloghi')
    revalidatePath('/cataloghi')
    revalidatePath('/')
    redirect('/admin/cataloghi')
  } else {
    // Create
    const { data: created, error } = await supabase
      .from('catalogs')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/cataloghi')
    revalidatePath('/cataloghi')
    revalidatePath('/')
    redirect('/admin/cataloghi')
  }
}

export async function deleteCatalog(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/cataloghi')
  revalidatePath('/cataloghi')
  revalidatePath('/')
  return { success: true, id }
}
