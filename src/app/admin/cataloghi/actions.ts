'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges, CATALOG_LABELS } from '@/lib/supabase/audit'

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
    // Fetch old record for change tracking
    const { data: oldRecord } = await supabase
      .from('catalogs')
      .select('title, year, is_published, pdf_url, cover_image_url')
      .eq('id', id)
      .single()

    // Update
    const { error } = await supabase
      .from('catalogs')
      .update(cleanData)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    if (oldRecord) {
      const changes = buildChanges(oldRecord, cleanData, CATALOG_LABELS)
      logActivity({
        action: 'catalog.update',
        entityType: 'catalog',
        entityId: id,
        entityTitle: cleanData.title,
        details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
        changes,
      }).catch(() => {})
    }

    revalidatePath('/admin/cataloghi')
    revalidatePath('/cataloghi')
    revalidatePath('/')
    return { success: true, id }
  } else {
    // Create
    const { data: created, error } = await supabase
      .from('catalogs')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    logActivity({
      action: 'catalog.create',
      entityType: 'catalog',
      entityId: created.id,
      entityTitle: cleanData.title,
      details: 'Catalogo creato',
      changes: buildCreateChanges(cleanData, CATALOG_LABELS),
    }).catch(() => {})

    revalidatePath('/admin/cataloghi')
    revalidatePath('/cataloghi')
    revalidatePath('/')
    return { success: true, id: created.id }
  }
}

export async function deleteCatalog(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: catalog } = await supabase
    .from('catalogs')
    .select('title, year, is_published, pdf_url, cover_image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  if (catalog) {
    logActivity({
      action: 'catalog.delete',
      entityType: 'catalog',
      entityId: id,
      entityTitle: catalog.title,
      details: 'Catalogo eliminato',
      changes: buildDeleteChanges(catalog, CATALOG_LABELS),
    }).catch(() => {})
  }

  revalidatePath('/admin/cataloghi')
  revalidatePath('/cataloghi')
  revalidatePath('/')
  return { success: true, id }
}
