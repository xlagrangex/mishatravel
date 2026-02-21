import { createAdminClient } from '../admin'

export async function getDistinctLocalities(): Promise<string[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tour_itinerary_days')
    .select('localita')
    .order('localita', { ascending: true })

  if (error) throw new Error(`Errore caricamento localita: ${error.message}`)

  // Get distinct values, filter out nulls and empty strings
  const unique = [...new Set((data ?? []).map(d => d.localita).filter(Boolean))]
  return unique
}
