"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/messaggi");
  return { error: null };
}
