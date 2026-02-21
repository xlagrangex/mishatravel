import { createAdminClient } from '../admin'
import type { Destination } from '@/lib/types'

export async function getDestinations(): Promise<Destination[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento destinazioni: ${error.message}`)
  return data ?? []
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Errore caricamento destinazione: ${error.message}`)
  }
  return data
}

export async function getDestinationOptions(): Promise<{ id: string; name: string; slug: string; coordinate: string | null }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('id, name, slug, coordinate')
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento destinazioni: ${error.message}`)
  return data ?? []
}
