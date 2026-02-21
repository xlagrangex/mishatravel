import { createAdminClient } from '../admin'
import type { Catalog } from '@/lib/types'

export async function getCatalogs(): Promise<Catalog[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false })

  if (error) throw new Error(`Errore caricamento cataloghi: ${error.message}`)
  return data ?? []
}

export async function getPublishedCatalogs(): Promise<Catalog[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false })

  if (error) throw new Error(`Errore caricamento cataloghi pubblicati: ${error.message}`)
  return data ?? []
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Errore caricamento catalogo: ${error.message}`)
  }
  return data
}
