import { createAdminClient } from '../admin'
import type { Agency } from '@/lib/types'

export async function getActiveAgencies(): Promise<Agency[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('id, business_name, city, province, region, phone, email, address, zip_code, latitude, longitude')
    .eq('status', 'active')
    .order('business_name', { ascending: true })

  if (error) throw new Error(`Errore caricamento agenzie: ${error.message}`)
  return (data ?? []) as Agency[]
}
