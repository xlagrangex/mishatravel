'use server'

import { revalidatePath } from 'next/cache'
import {
  getMediaItems,
  getMediaFolders,
  getMediaFolderCounts,
  insertMediaRecord,
  updateMediaRecord,
  deleteMediaRecord,
  bulkDeleteMedia,
  moveMediaToFolder,
  createFolder,
  renameFolder,
  deleteFolder,
  getFolderIdByName,
} from '@/lib/supabase/queries/media'
import type { MediaItem, MediaFolder } from '@/lib/types'

type ActionResult =
  | { success: true }
  | { success: false; error: string }

const revalidateMedia = () => revalidatePath('/admin/media')

// ============================================================
// Media CRUD
// ============================================================

export async function getMediaItemsAction(options: {
  folderId?: string
  includeSubfolders?: boolean
  bucket?: string
  search?: string
  mimeTypePrefix?: string
  page?: number
  pageSize?: number
  sortBy?: 'created_at' | 'filename' | 'file_size'
  sortOrder?: 'asc' | 'desc'
}): Promise<{ items: MediaItem[]; total: number }> {
  return getMediaItems(options)
}

export async function registerMediaAction(record: {
  filename: string
  url: string
  file_size?: number | null
  mime_type?: string | null
  width?: number | null
  height?: number | null
  bucket?: string
  folder_id?: string | null
}): Promise<ActionResult & { item?: MediaItem }> {
  try {
    // If no folder_id provided, lookup by bucket name
    let folderId = record.folder_id
    if (!folderId && record.bucket) {
      folderId = await getFolderIdByName(record.bucket)
    }
    if (!folderId) {
      folderId = await getFolderIdByName('general')
    }

    const item = await insertMediaRecord({
      ...record,
      folder_id: folderId,
    })
    return { success: true, item }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function updateMediaAction(
  id: string,
  updates: { folder_id?: string | null; alt_text?: string; filename?: string }
): Promise<ActionResult> {
  try {
    await updateMediaRecord(id, updates)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  try {
    await deleteMediaRecord(id)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function bulkDeleteMediaAction(ids: string[]): Promise<ActionResult> {
  try {
    await bulkDeleteMedia(ids)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function moveToFolderAction(
  ids: string[],
  folderId: string | null
): Promise<ActionResult> {
  try {
    await moveMediaToFolder(ids, folderId)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ============================================================
// Folder CRUD
// ============================================================

export async function getMediaFoldersAction(): Promise<MediaFolder[]> {
  return getMediaFolders()
}

export async function getMediaFolderCountsAction(): Promise<Record<string, number>> {
  return getMediaFolderCounts()
}

export async function createFolderAction(
  name: string,
  parentId?: string | null
): Promise<ActionResult> {
  try {
    await createFolder(name, parentId)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function renameFolderAction(
  folderId: string,
  newName: string
): Promise<ActionResult> {
  try {
    await renameFolder(folderId, newName)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function deleteFolderAction(folderId: string): Promise<ActionResult> {
  try {
    await deleteFolder(folderId)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
