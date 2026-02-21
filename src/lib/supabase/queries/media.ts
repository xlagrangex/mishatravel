import { createAdminClient } from '../admin'

// Available storage buckets
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

/**
 * Lists files from one or all Supabase Storage buckets.
 * Returns a unified list sorted by creation date (newest first).
 */
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
      // Bucket may not exist yet – skip silently
      console.warn(`Storage list error for bucket "${b}": ${error.message}`)
      continue
    }

    if (!data) continue

    for (const file of data) {
      // Skip .emptyFolderPlaceholder or folder entries
      if (!file.name || file.id === null) continue

      const { data: urlData } = supabase.storage
        .from(b)
        .getPublicUrl(file.name)

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

  // Sort by creation date descending
  allFiles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return allFiles
}

/**
 * Deletes a file from Supabase Storage.
 * @param bucket The bucket name
 * @param fileName The file name within the bucket
 */
export async function deleteStorageFile(
  bucket: string,
  fileName: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(bucket).remove([fileName])

  if (error)
    throw new Error(
      `Errore eliminazione file da ${bucket}/${fileName}: ${error.message}`
    )
}
