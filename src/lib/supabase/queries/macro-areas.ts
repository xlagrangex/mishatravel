import { createAdminClient } from '../admin'
import type { MacroArea } from '@/lib/types'

/** All macro areas sorted by sort_order (admin use) */
export async function getMacroAreas(): Promise<MacroArea[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('macro_areas')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Errore caricamento macro aree: ${error.message}`)
  return data ?? []
}

/** Published macro areas sorted by sort_order (public site) */
export async function getPublishedMacroAreas(): Promise<MacroArea[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('macro_areas')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Errore caricamento macro aree pubblicate: ${error.message}`)
  return data ?? []
}

/** Single macro area by ID */
export async function getMacroAreaById(id: string): Promise<MacroArea | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('macro_areas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Errore caricamento macro area: ${error.message}`)
  }
  return data
}

/** Lightweight list for select dropdowns */
export async function getMacroAreaOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('macro_areas')
    .select('id, name')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Errore caricamento opzioni macro aree: ${error.message}`)
  return data ?? []
}

/** Get mega menu mode setting */
export async function getMegaMenuMode(): Promise<'dynamic' | 'manual'> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'mega_menu_mode')
    .single()

  return (data?.value as 'dynamic' | 'manual') ?? 'dynamic'
}
