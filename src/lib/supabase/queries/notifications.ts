import { createAdminClient } from '../admin'
import type { Notification } from '@/lib/types'

// ---------------------------------------------------------------------------
// Notification Query Functions (server-side, admin client)
// ---------------------------------------------------------------------------

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(
  userId: string,
  limit = 10
): Promise<Notification[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Errore caricamento notifiche: ${error.message}`)
  return (data ?? []) as Notification[]
}

/**
 * Get recent notifications for a user (both read and unread).
 */
export async function getRecentNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Errore caricamento notifiche: ${error.message}`)
  return (data ?? []) as Notification[]
}

/**
 * Get unread notification count for a user.
 */
export async function getNotificationCount(userId: string): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error || count === null) return 0
  return count
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}
