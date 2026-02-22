"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { passwordResetEmail } from "@/lib/email/templates";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mishatravel.com";

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Inserisci un indirizzo email valido." };
  }

  try {
    const supabase = createAdminClient();

    // Generate the recovery link via Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${SITE_URL}/reset?mode=update`,
      },
    });

    if (error) {
      // Don't leak info about whether the email exists or not
      console.error("[Password Reset] generateLink error:", error.message);
      return { success: true };
    }

    if (!data?.properties?.action_link) {
      console.error("[Password Reset] No action_link returned");
      return { success: true };
    }

    // Send branded email via Brevo
    const emailSent = await sendTransactionalEmail(
      { email, name: email },
      "Recupero password - MishaTravel",
      passwordResetEmail(data.properties.action_link)
    );

    if (!emailSent) {
      console.error("[Password Reset] Brevo email send failed for:", email);
    }

    // Always return success to not leak account existence
    return { success: true };
  } catch (err) {
    console.error("[Password Reset] Unexpected error:", err);
    return { success: true };
  }
}
