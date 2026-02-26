'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges } from '@/lib/supabase/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MACRO_AREA_LABELS: Record<string, string> = {
  name: 'Nome',
  slug: 'Slug',
  description: 'Descrizione',
  cover_image_url: 'Immagine',
  sort_order: 'Ordine',
  status: 'Stato',
}

const macroAreaSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  slug: z.string().min(1, 'Lo slug è obbligatorio'),
  description: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  status: z.enum(['draft', 'published']),
})

type ActionResult = { success: true; id: string } | { success: false; error: string }

function revalidateAll() {
  revalidatePath('/admin/destinazioni')
  revalidatePath('/destinazioni')
  revalidatePath('/tours')
  revalidatePath('/crociere')
  revalidatePath('/')
}

export async function saveMacroArea(formData: z.infer<typeof macroAreaSchema>): Promise<ActionResult> {
  const parsed = macroAreaSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { id, ...data } = parsed.data

  const cleanData = {
    ...data,
    description: data.description || null,
    cover_image_url: data.cover_image_url || null,
  }

  if (id) {
    const { data: oldRecord } = await supabase
      .from('macro_areas')
      .select('name, slug, status, description, cover_image_url, sort_order')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('macro_areas')
      .update(cleanData)
      .eq('id', id)

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già una macro area con questo nome o slug.' }
      return { success: false, error: error.message }
    }

    // Sync legacy macro_area text on destinations that reference this area
    if (oldRecord && oldRecord.name !== cleanData.name) {
      await supabase
        .from('destinations')
        .update({ macro_area: cleanData.name })
        .eq('macro_area_id', id)
    }

    const changes = oldRecord ? buildChanges(
      { ...oldRecord, sort_order: String(oldRecord.sort_order) },
      { ...cleanData, sort_order: String(cleanData.sort_order) },
      MACRO_AREA_LABELS
    ) : []
    logActivity({
      action: 'macro_area.update',
      entityType: 'macro_area',
      entityId: id,
      entityTitle: cleanData.name,
      details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
      changes,
    }).catch(() => {})

    revalidateAll()
    return { success: true, id }
  } else {
    const { data: created, error } = await supabase
      .from('macro_areas')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già una macro area con questo nome o slug.' }
      return { success: false, error: error.message }
    }

    logActivity({
      action: 'macro_area.create',
      entityType: 'macro_area',
      entityId: created.id,
      entityTitle: cleanData.name,
      details: 'Macro area creata',
      changes: buildCreateChanges(cleanData, MACRO_AREA_LABELS),
    }).catch(() => {})

    revalidateAll()
    return { success: true, id: created.id }
  }
}

export async function toggleMacroAreaStatus(id: string, newStatus: 'published' | 'draft'): Promise<ActionResult> {
  const supabase = createAdminClient()
  const { data: record } = await supabase.from('macro_areas').select('name').eq('id', id).single()

  const { error } = await supabase.from('macro_areas').update({ status: newStatus }).eq('id', id)
  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'published' ? 'macro_area.publish' : 'macro_area.unpublish',
    entityType: 'macro_area',
    entityId: id,
    entityTitle: record?.name ?? '',
    changes: [{ field: 'Stato', from: newStatus === 'published' ? 'draft' : 'published', to: newStatus }],
  }).catch(() => {})

  revalidateAll()
  return { success: true, id }
}

export async function deleteMacroArea(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Check if destinations reference this area
  const { count } = await supabase
    .from('destinations')
    .select('id', { count: 'exact', head: true })
    .eq('macro_area_id', id)

  if (count && count > 0) {
    return { success: false, error: `Impossibile eliminare: ${count} destinazioni sono collegate a questa macro area. Riassegnale prima.` }
  }

  const { data: record } = await supabase
    .from('macro_areas')
    .select('name, slug, status, description, cover_image_url, sort_order')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('macro_areas').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'macro_area.delete',
    entityType: 'macro_area',
    entityId: id,
    entityTitle: record?.name ?? 'Macro area eliminata',
    changes: record ? buildDeleteChanges(record, MACRO_AREA_LABELS) : undefined,
  }).catch(() => {})

  revalidateAll()
  return { success: true, id }
}

export async function bulkDeleteMacroAreas(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna macro area selezionata' }
  const supabase = createAdminClient()

  // Check if any destinations reference these areas
  const { count } = await supabase
    .from('destinations')
    .select('id', { count: 'exact', head: true })
    .in('macro_area_id', ids)

  if (count && count > 0) {
    return { success: false, error: `Impossibile eliminare: ${count} destinazioni sono collegate a queste macro aree.` }
  }

  const { error } = await supabase.from('macro_areas').delete().in('id', ids)
  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true, id: ids[0] }
}

export async function setMegaMenuMode(mode: 'dynamic' | 'manual'): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('site_settings')
    .update({ value: mode })
    .eq('key', 'mega_menu_mode')

  if (error) return { success: false, error: error.message }

  revalidateAll()
  return { success: true, id: 'mega_menu_mode' }
}
