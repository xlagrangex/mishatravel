'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges, DESTINATION_LABELS } from '@/lib/supabase/audit'
import { revalidatePath } from 'next/cache'
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
    // Fetch old record for change tracking
    const { data: oldRecord } = await supabase
      .from('destinations')
      .select('name, slug, status, macro_area, cover_image_url')
      .eq('id', id)
      .single()

    // Update
    const { error } = await supabase
      .from('destinations')
      .update(cleanData)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    const changes = oldRecord ? buildChanges(oldRecord, cleanData, DESTINATION_LABELS) : []
    logActivity({
      action: 'destination.update',
      entityType: 'destination',
      entityId: id,
      entityTitle: cleanData.name,
      details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
      changes,
    }).catch(() => {})

    revalidatePath('/admin/destinazioni')
    revalidatePath(`/destinazioni/${cleanData.slug}`)
    revalidatePath('/destinazioni')
    revalidatePath('/')
    return { success: true, id }
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

    logActivity({
      action: 'destination.create',
      entityType: 'destination',
      entityId: created.id,
      entityTitle: cleanData.name,
      details: 'Destinazione creata',
      changes: buildCreateChanges(cleanData, DESTINATION_LABELS),
    }).catch(() => {})

    revalidatePath('/admin/destinazioni')
    revalidatePath('/destinazioni')
    revalidatePath('/')
    return { success: true, id: created.id }
  }
}

export async function toggleDestinationStatus(
  id: string,
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: destData } = await supabase.from('destinations').select('name').eq('id', id).single()

  const { error } = await supabase
    .from('destinations')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'published' ? 'destination.publish' : 'destination.unpublish',
    entityType: 'destination',
    entityId: id,
    entityTitle: destData?.name ?? '',
    changes: [{ field: 'Stato', from: newStatus === 'published' ? 'draft' : 'published', to: newStatus }],
  }).catch(() => {})

  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/')
  return { success: true, id }
}

export async function bulkSetDestinationStatus(
  ids: string[],
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna destinazione selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('destinations')
    .update({ status: newStatus })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function bulkDeleteDestinations(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna destinazione selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('destinations')
    .delete()
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function deleteDestination(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: destData } = await supabase
    .from('destinations')
    .select('name, slug, status, macro_area, cover_image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('destinations')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'destination.delete',
    entityType: 'destination',
    entityId: id,
    entityTitle: destData?.name ?? 'Destinazione eliminata',
    changes: destData ? buildDeleteChanges(destData, DESTINATION_LABELS) : undefined,
  }).catch(() => {})

  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/')
  return { success: true, id }
}
