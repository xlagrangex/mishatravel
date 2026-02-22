import { createAdminClient } from '../admin'

export async function getDistinctLocalities(): Promise<string[]> {
  const supabase = createAdminClient()

  const [tourResult, cruiseResult] = await Promise.all([
    supabase
      .from('tour_itinerary_days')
      .select('localita')
      .order('localita', { ascending: true }),
    supabase
      .from('cruise_itinerary_days')
      .select('localita')
      .order('localita', { ascending: true }),
  ])

  if (tourResult.error) throw new Error(`Errore caricamento localita tour: ${tourResult.error.message}`)
  if (cruiseResult.error) throw new Error(`Errore caricamento localita crociere: ${cruiseResult.error.message}`)

  const all = [
    ...(tourResult.data ?? []).map(d => d.localita),
    ...(cruiseResult.data ?? []).map(d => d.localita),
  ].filter(Boolean)

  const unique = [...new Set(all)].sort((a, b) => a.localeCompare(b))
  return unique
}
