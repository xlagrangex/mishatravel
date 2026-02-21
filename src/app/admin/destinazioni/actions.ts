'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const destinationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  slug: z.string().min(1, 'Lo slug è obbligatorio'),
  macro_area: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coordinate: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']),
})

type ActionResult = { success: true; id: string } | { success: false; error: string }

export async function saveDestination(formData: z.infer<typeof destinationSchema>): Promise<ActionResult> {
  const parsed = destinationSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { id, ...data } = parsed.data

  // Clean empty strings to null
  const cleanData = {
    ...data,
    macro_area: data.macro_area || null,
    description: data.description || null,
    coordinate: data.coordinate || null,
    cover_image_url: data.cover_image_url || null,
  }

  if (id) {
    // Update
    const { error } = await supabase
      .from('destinations')
      .update(cleanData)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/destinazioni')
    revalidatePath(`/destinazioni/${cleanData.slug}`)
    revalidatePath('/destinazioni')
    revalidatePath('/')
    redirect('/admin/destinazioni')
  } else {
    // Create
    const { data: created, error } = await supabase
      .from('destinations')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già una destinazione con questo slug.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/destinazioni')
    revalidatePath('/destinazioni')
    revalidatePath('/')
    redirect('/admin/destinazioni')
  }
}

export async function deleteDestination(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('destinations')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/')
  return { success: true, id }
}
