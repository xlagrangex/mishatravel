import { createAdminClient } from '@/lib/supabase/admin'
import type { SiteSetting } from '@/lib/types'

/**
 * Get all site settings as an array.
 */
export async function getAllSettings(): Promise<SiteSetting[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key')

  if (error) {
    console.error('[Settings] Error loading settings:', error.message)
    return []
  }

  return data as SiteSetting[]
}

/**
 * Get all settings as a key-value map.
 */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const settings = await getAllSettings()
  const map: Record<string, string> = {}
  for (const s of settings) {
    map[s.key] = s.value
  }
  return map
}
