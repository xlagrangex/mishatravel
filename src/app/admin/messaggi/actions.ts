"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/supabase/audit";

export async function markAsRead(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ read: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/messaggi");
  return { error: null };
}

export async function markAsUnread(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ read: false })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/messaggi");
  return { error: null };
}

export async function deleteSubmission(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("contact_submissions")
    .select("name, email, subject")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  logActivity({
    action: 'message.delete',
    entityType: 'message',
    entityId: id,
    entityTitle: submission?.subject ?? `Messaggio da ${submission?.name ?? 'sconosciuto'}`,
    details: `Messaggio eliminato da ${submission?.name ?? 'N/A'} (${submission?.email ?? 'N/A'})`,
  }).catch(() => {})

  revalidatePath("/admin/messaggi");
  return { error: null };
}
