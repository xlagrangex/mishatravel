import { createAdminClient } from '../admin'
import type { MediaItem } from '@/lib/types'

export async function getMediaItems(folder?: string): Promise<MediaItem[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  if (folder) {
    query = query.eq('folder', folder)
  }

  const { data, error } = await query

  if (error) throw new Error(`Errore caricamento media: ${error.message}`)
  return data ?? []
}

export async function deleteMediaItem(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Errore eliminazione media: ${error.message}`)
}
