'use server'

import { deleteStorageFile } from '@/lib/supabase/queries/media'
import { revalidatePath } from 'next/cache'

type ActionResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Deletes a file from Supabase Storage.
 * @param bucket The storage bucket name
 * @param fileName The file name within the bucket
 */
export async function deleteMediaAction(
  bucket: string,
  fileName: string
): Promise<ActionResult> {
  try {
    await deleteStorageFile(bucket, fileName)
    revalidatePath('/admin/media')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
