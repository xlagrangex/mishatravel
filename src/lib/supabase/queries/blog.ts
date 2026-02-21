import { createAdminClient } from '../admin'
import type { BlogPost, BlogCategory } from '@/lib/types'

export type BlogPostWithCategory = BlogPost & {
  category: { name: string } | null
}

export async function getBlogPosts(): Promise<BlogPostWithCategory[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(name)')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Errore caricamento articoli blog: ${error.message}`)
  return data ?? []
}

export async function getBlogPostById(id: string): Promise<BlogPostWithCategory | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Errore caricamento articolo blog: ${error.message}`)
  }
  return data
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento categorie blog: ${error.message}`)
  return data ?? []
}

export async function getPublishedBlogPosts(): Promise<BlogPostWithCategory[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw new Error(`Errore caricamento articoli blog pubblicati: ${error.message}`)
  return data ?? []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithCategory | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Errore caricamento articolo blog per slug: ${error.message}`)
  }
  return data
}
