import { createAdminClient } from '../admin'
import type { MediaItem, MediaFolder } from '@/lib/types'

// ============================================================
// Constants
// ============================================================

export const STORAGE_BUCKETS = [
  'tours',
  'cruises',
  'ships',
  'blog',
  'catalogs',
  'agencies',
  'general',
] as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[number]

export interface StorageFileItem {
  id: string
  name: string
  bucket: StorageBucket
  url: string
  size: number | null
  mimeType: string | null
  createdAt: string
}

// ============================================================
// Legacy Storage-based functions (kept for compatibility)
// ============================================================

export async function getStorageFiles(
  bucket?: StorageBucket
): Promise<StorageFileItem[]> {
  const supabase = createAdminClient()
  const bucketsToScan = bucket ? [bucket] : [...STORAGE_BUCKETS]
  const allFiles: StorageFileItem[] = []

  for (const b of bucketsToScan) {
    const { data, error } = await supabase.storage.from(b).list('', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.warn(`Storage list error for bucket "${b}": ${error.message}`)
      continue
    }
    if (!data) continue

    for (const file of data) {
      if (!file.name || file.id === null) continue
      const { data: urlData } = supabase.storage.from(b).getPublicUrl(file.name)
      allFiles.push({
        id: `${b}/${file.name}`,
        name: file.name,
        bucket: b as StorageBucket,
        url: urlData.publicUrl,
        size: file.metadata?.size ?? null,
        mimeType: file.metadata?.mimetype ?? null,
        createdAt: file.created_at ?? '',
      })
    }
  }

  allFiles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return allFiles
}

export async function deleteStorageFile(
  bucket: string,
  fileName: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(bucket).remove([fileName])
  if (error)
    throw new Error(`Errore eliminazione file da ${bucket}/${fileName}: ${error.message}`)
}

// ============================================================
// DB-backed media functions
// ============================================================

interface GetMediaItemsOptions {
  folder?: string
  bucket?: string
  search?: string
  mimeTypePrefix?: string
  page?: number
  pageSize?: number
  sortBy?: 'created_at' | 'filename' | 'file_size'
  sortOrder?: 'asc' | 'desc'
}

export async function getMediaItems(
  options: GetMediaItemsOptions = {}
): Promise<{ items: MediaItem[]; total: number }> {
  const {
    folder,
    bucket,
    search,
    mimeTypePrefix,
    page = 1,
    pageSize = 50,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options

  const supabase = createAdminClient()

  let query = supabase.from('media').select('*', { count: 'exact' })

  if (folder) query = query.eq('folder', folder)
  if (bucket) query = query.eq('bucket', bucket)
  if (search) query = query.ilike('filename', `%${search}%`)
  if (mimeTypePrefix) query = query.like('mime_type', `${mimeTypePrefix}%`)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(`Errore recupero media: ${error.message}`)

  return {
    items: (data ?? []) as MediaItem[],
    total: count ?? 0,
  }
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as MediaItem
}

export async function insertMediaRecord(record: {
  filename: string
  url: string
  file_size?: number | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  bucket?: string
  folder?: string
  alt_text?: string
}): Promise<MediaItem> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media')
    .insert({
      filename: record.filename,
      url: record.url,
      file_size: record.file_size ?? null,
      mime_type: record.mime_type ?? null,
      width: record.width ?? null,
      height: record.height ?? null,
      bucket: record.bucket ?? 'general',
      folder: record.folder ?? 'general',
      alt_text: record.alt_text ?? '',
    })
    .select()
    .single()

  if (error) throw new Error(`Errore inserimento media: ${error.message}`)
  return data as MediaItem
}

export async function updateMediaRecord(
  id: string,
  updates: { folder?: string; alt_text?: string; filename?: string }
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('media').update(updates).eq('id', id)
  if (error) throw new Error(`Errore aggiornamento media: ${error.message}`)
}

export async function deleteMediaRecord(id: string): Promise<void> {
  const supabase = createAdminClient()

  // Get the record first to know bucket + filename for storage deletion
  const { data: record, error: fetchError } = await supabase
    .from('media')
    .select('bucket, filename')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`Media non trovato: ${fetchError.message}`)

  // Delete from storage
  if (record.bucket && record.filename) {
    const { error: storageError } = await supabase.storage
      .from(record.bucket)
      .remove([record.filename])
    if (storageError) {
      console.warn(`Storage delete warning: ${storageError.message}`)
    }
  }

  // Delete from DB
  const { error } = await supabase.from('media').delete().eq('id', id)
  if (error) throw new Error(`Errore eliminazione media: ${error.message}`)
}

export async function bulkDeleteMedia(ids: string[]): Promise<void> {
  for (const id of ids) {
    await deleteMediaRecord(id)
  }
}

export async function moveMediaToFolder(
  ids: string[],
  folder: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('media')
    .update({ folder })
    .in('id', ids)
  if (error) throw new Error(`Errore spostamento media: ${error.message}`)
}

// ============================================================
// Folder functions
// ============================================================

export async function getMediaFolders(): Promise<MediaFolder[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media_folders')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore recupero cartelle: ${error.message}`)
  return (data ?? []) as MediaFolder[]
}

export async function getMediaFolderCounts(): Promise<Record<string, number>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media')
    .select('folder')

  if (error) return {}

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const f = row.folder ?? 'general'
    counts[f] = (counts[f] || 0) + 1
  }
  return counts
}

export async function createFolder(name: string): Promise<MediaFolder> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media_folders')
    .insert({ name })
    .select()
    .single()

  if (error) throw new Error(`Errore creazione cartella: ${error.message}`)
  return data as MediaFolder
}

export async function renameFolder(
  oldName: string,
  newName: string
): Promise<void> {
  const supabase = createAdminClient()

  // Rename the folder entry
  const { error: folderError } = await supabase
    .from('media_folders')
    .update({ name: newName })
    .eq('name', oldName)
  if (folderError) throw new Error(`Errore rinomina cartella: ${folderError.message}`)

  // Update all media items in this folder
  const { error: mediaError } = await supabase
    .from('media')
    .update({ folder: newName })
    .eq('folder', oldName)
  if (mediaError) throw new Error(`Errore aggiornamento media: ${mediaError.message}`)
}

export async function deleteFolder(name: string): Promise<void> {
  const supabase = createAdminClient()

  // Move all items to 'general' first
  const { error: moveError } = await supabase
    .from('media')
    .update({ folder: 'general' })
    .eq('folder', name)
  if (moveError) throw new Error(`Errore spostamento media: ${moveError.message}`)

  // Delete the folder
  const { error } = await supabase
    .from('media_folders')
    .delete()
    .eq('name', name)
  if (error) throw new Error(`Errore eliminazione cartella: ${error.message}`)
}
