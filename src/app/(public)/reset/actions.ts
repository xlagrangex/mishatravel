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
    });

    if (error) {
      // Don't leak info about whether the email exists or not
      console.error("[Password Reset] generateLink error:", error.message);
      return { success: true };
    }

    const tokenHash = data?.properties?.hashed_token;
    if (!tokenHash) {
      console.error("[Password Reset] No hashed_token returned");
      return { success: true };
    }

    // Build a direct link to our site with token_hash as query param.
    // The client will use verifyOtp to exchange the token for a session.
    const resetLink = `${SITE_URL}/reset?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;

    // Send branded email via Brevo
    const emailSent = await sendTransactionalEmail(
      { email, name: email },
      "Recupero password - MishaTravel",
      passwordResetEmail(resetLink)
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
