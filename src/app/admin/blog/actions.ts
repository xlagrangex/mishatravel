'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges, BLOG_LABELS } from '@/lib/supabase/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Blog Post Schema
// ---------------------------------------------------------------------------

const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  slug: z.string().min(1, 'Lo slug è obbligatorio'),
  category_id: z.string().uuid().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']),
  published_at: z.string().optional().nullable(),
})

// ---------------------------------------------------------------------------
// Blog Category Schema
// ---------------------------------------------------------------------------

const blogCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  slug: z.string().min(1, 'Lo slug è obbligatorio'),
  sort_order: z.number().int().optional(),
})

type ActionResult = { success: true; id: string } | { success: false; error: string }

// ---------------------------------------------------------------------------
// Save Blog Post
// ---------------------------------------------------------------------------

export async function saveBlogPost(formData: z.infer<typeof blogPostSchema>): Promise<ActionResult> {
  const parsed = blogPostSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { id, ...data } = parsed.data

  // Clean empty strings to null
  const cleanData = {
    ...data,
    category_id: data.category_id || null,
    cover_image_url: data.cover_image_url || null,
    excerpt: data.excerpt || null,
    content: data.content || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    published_at: data.published_at || null,
  }

  if (id) {
    // Fetch old record for change tracking
    const { data: oldRecord } = await supabase
      .from('blog_posts')
      .select('title, slug, status, category_id, cover_image_url')
      .eq('id', id)
      .single()

    // Update
    const { error } = await supabase
      .from('blog_posts')
      .update(cleanData)
      .eq('id', id)

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già un articolo con questo slug.' }
      return { success: false, error: error.message }
    }

    const changes = oldRecord ? buildChanges(oldRecord, cleanData, BLOG_LABELS) : []
    logActivity({
      action: 'blog.update',
      entityType: 'blog',
      entityId: id,
      entityTitle: cleanData.title,
      details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
      changes,
    }).catch(() => {})

    revalidatePath('/admin/blog')
    revalidatePath(`/blog/${cleanData.slug}`)
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, id }
  } else {
    // Create
    const { data: created, error } = await supabase
      .from('blog_posts')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già un articolo con questo slug.' }
      return { success: false, error: error.message }
    }

    logActivity({
      action: 'blog.create',
      entityType: 'blog',
      entityId: created.id,
      entityTitle: cleanData.title,
      details: 'Articolo creato',
      changes: buildCreateChanges(cleanData, BLOG_LABELS),
    }).catch(() => {})

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, id: created.id }
  }
}

// ---------------------------------------------------------------------------
// Delete Blog Post
// ---------------------------------------------------------------------------

export async function toggleBlogPostStatus(
  id: string,
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: postData } = await supabase.from('blog_posts').select('title').eq('id', id).single()

  const { error } = await supabase
    .from('blog_posts')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'published' ? 'blog.publish' : 'blog.unpublish',
    entityType: 'blog',
    entityId: id,
    entityTitle: postData?.title ?? '',
    changes: [{ field: 'Stato', from: newStatus === 'published' ? 'draft' : 'published', to: newStatus }],
  }).catch(() => {})

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true, id }
}

export async function bulkSetBlogPostStatus(
  ids: string[],
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessun articolo selezionato' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('blog_posts')
    .update({ status: newStatus })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function bulkDeleteBlogPosts(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessun articolo selezionato' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: postData } = await supabase
    .from('blog_posts')
    .select('title, slug, status, category_id, cover_image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'blog.delete',
    entityType: 'blog',
    entityId: id,
    entityTitle: postData?.title ?? 'Articolo eliminato',
    changes: postData ? buildDeleteChanges(postData, BLOG_LABELS) : undefined,
  }).catch(() => {})

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true, id }
}

// ---------------------------------------------------------------------------
// Save Blog Category
// ---------------------------------------------------------------------------

export async function saveBlogCategory(formData: z.infer<typeof blogCategorySchema>): Promise<ActionResult> {
  const parsed = blogCategorySchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { id, ...data } = parsed.data

  const cleanData = {
    ...data,
    sort_order: data.sort_order ?? 0,
  }

  if (id) {
    // Update
    const { error } = await supabase
      .from('blog_categories')
      .update(cleanData)
      .eq('id', id)

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già una categoria con questo slug.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true, id }
  } else {
    // Create
    const { data: created, error } = await supabase
      .from('blog_categories')
      .insert(cleanData)
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Esiste già una categoria con questo slug.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    return { success: true, id: created.id }
  }
}
