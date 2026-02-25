import { createAdminClient } from '../admin'
import type { MediaItem, MediaFolder, MediaFolderTreeNode } from '@/lib/types'

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
  folderId?: string
  includeSubfolders?: boolean
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
    folderId,
    includeSubfolders = false,
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

  if (folderId) {
    if (includeSubfolders) {
      const descendantIds = await getDescendantFolderIds(folderId)
      const allIds = [folderId, ...descendantIds]
      query = query.in('folder_id', allIds)
    } else {
      query = query.eq('folder_id', folderId)
    }
  }
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
  folder_id?: string | null
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
      folder: record.bucket ?? 'general',
      folder_id: record.folder_id ?? null,
      alt_text: '',
    })
    .select()
    .single()

  if (error) throw new Error(`Errore inserimento media: ${error.message}`)
  return data as MediaItem
}

export async function updateMediaRecord(
  id: string,
  updates: { folder_id?: string | null; alt_text?: string; filename?: string }
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
  folderId: string | null
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('media')
    .update({ folder_id: folderId })
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
    .select('folder_id')

  if (error) return {}

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const fid = row.folder_id ?? 'none'
    counts[fid] = (counts[fid] || 0) + 1
  }
  return counts
}

export async function createFolder(
  name: string,
  parentId?: string | null
): Promise<MediaFolder> {
  // Max depth check: 3 levels (root > child > grandchild)
  if (parentId) {
    const depth = await getFolderDepth(parentId)
    if (depth >= 2) {
      throw new Error('Profondita massima raggiunta (3 livelli)')
    }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media_folders')
    .insert({ name, parent_id: parentId ?? null })
    .select()
    .single()

  if (error) throw new Error(`Errore creazione cartella: ${error.message}`)
  return data as MediaFolder
}

export async function renameFolder(
  folderId: string,
  newName: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('media_folders')
    .update({ name: newName })
    .eq('id', folderId)
  if (error) throw new Error(`Errore rinomina cartella: ${error.message}`)
}

export async function deleteFolder(folderId: string): Promise<void> {
  const supabase = createAdminClient()

  // Find the "general" folder ID
  const { data: generalFolder } = await supabase
    .from('media_folders')
    .select('id')
    .eq('name', 'general')
    .is('parent_id', null)
    .single()

  const generalId = generalFolder?.id

  if (generalId) {
    // Get all descendant folder IDs
    const descendantIds = await getDescendantFolderIds(folderId)
    const allFolderIds = [folderId, ...descendantIds]

    // Move all media in this folder and descendants to "general"
    const { error: moveError } = await supabase
      .from('media')
      .update({ folder_id: generalId })
      .in('folder_id', allFolderIds)
    if (moveError) throw new Error(`Errore spostamento media: ${moveError.message}`)
  }

  // Delete the folder (CASCADE will delete children)
  const { error } = await supabase
    .from('media_folders')
    .delete()
    .eq('id', folderId)
  if (error) throw new Error(`Errore eliminazione cartella: ${error.message}`)
}

// ============================================================
// Hierarchy utilities
// ============================================================

/** BFS to find all descendant folder IDs */
export async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const supabase = createAdminClient()
  const { data: allFolders, error } = await supabase
    .from('media_folders')
    .select('id, parent_id')

  if (error || !allFolders) return []

  const childrenMap = new Map<string, string[]>()
  for (const f of allFolders) {
    if (f.parent_id) {
      const siblings = childrenMap.get(f.parent_id) ?? []
      siblings.push(f.id)
      childrenMap.set(f.parent_id, siblings)
    }
  }

  const result: string[] = []
  const queue = [folderId]
  while (queue.length > 0) {
    const current = queue.shift()!
    const children = childrenMap.get(current) ?? []
    for (const childId of children) {
      result.push(childId)
      queue.push(childId)
    }
  }

  return result
}

/** Get folder depth (0 = root, 1 = child, 2 = grandchild) */
async function getFolderDepth(folderId: string): Promise<number> {
  const supabase = createAdminClient()
  let depth = 0
  let currentId: string | null = folderId

  while (currentId) {
    const result = await supabase
      .from('media_folders')
      .select('parent_id')
      .eq('id', currentId)
      .single()

    const row = result.data as { parent_id: string | null } | null
    if (!row || !row.parent_id) break
    depth++
    currentId = row.parent_id
  }

  return depth
}

/** Build a tree structure from flat folder list + counts */
export function buildFolderTree(
  folders: MediaFolder[],
  counts: Record<string, number>
): MediaFolderTreeNode[] {
  const nodeMap = new Map<string, MediaFolderTreeNode>()

  // Create nodes
  for (const f of folders) {
    nodeMap.set(f.id, {
      ...f,
      children: [],
      depth: 0,
      item_count: counts[f.id] || 0,
      total_count: counts[f.id] || 0,
    })
  }

  // Build tree
  const roots: MediaFolderTreeNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      const parent = nodeMap.get(node.parent_id)!
      parent.children.push(node)
      node.depth = parent.depth + 1
    } else {
      roots.push(node)
    }
  }

  // Fix depths recursively
  function fixDepths(nodes: MediaFolderTreeNode[], depth: number) {
    for (const node of nodes) {
      node.depth = depth
      fixDepths(node.children, depth + 1)
    }
  }
  fixDepths(roots, 0)

  // Sort children by name
  function sortChildren(nodes: MediaFolderTreeNode[]) {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    for (const node of nodes) {
      sortChildren(node.children)
    }
  }
  sortChildren(roots)

  // Calculate total_count (includes descendants)
  function calcTotalCount(node: MediaFolderTreeNode): number {
    let total = node.item_count
    for (const child of node.children) {
      total += calcTotalCount(child)
    }
    node.total_count = total
    return total
  }
  for (const root of roots) {
    calcTotalCount(root)
  }

  return roots
}

/** Lookup folder_id by bucket name (for backwards compatibility) */
export async function getFolderIdByName(name: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('media_folders')
    .select('id')
    .eq('name', name)
    .is('parent_id', null)
    .single()

  return data?.id ?? null
}
