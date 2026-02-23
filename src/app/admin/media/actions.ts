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
  folder?: string
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
  folder?: string
}): Promise<ActionResult & { item?: MediaItem }> {
  try {
    const item = await insertMediaRecord(record)
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
  updates: { folder?: string; alt_text?: string; filename?: string }
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
  folder: string
): Promise<ActionResult> {
  try {
    await moveMediaToFolder(ids, folder)
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

export async function createFolderAction(name: string): Promise<ActionResult> {
  try {
    await createFolder(name)
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
  oldName: string,
  newName: string
): Promise<ActionResult> {
  try {
    await renameFolder(oldName, newName)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function deleteFolderAction(name: string): Promise<ActionResult> {
  try {
    await deleteFolder(name)
    revalidateMedia()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
