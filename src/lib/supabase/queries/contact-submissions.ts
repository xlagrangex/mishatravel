import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactSubmission } from "@/lib/types";

export async function getContactSubmissions(
  formType?: string
): Promise<ContactSubmission[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (formType && formType !== "all") {
    query = query.eq("form_type", formType);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }
  return (data ?? []) as ContactSubmission[];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  if (error) return 0;
  return count ?? 0;
}
