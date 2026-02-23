"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminNotification } from "@/lib/email/brevo";
import { adminNewContactFormEmail } from "@/lib/email/templates";

export async function submitContactForm(data: {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  oggetto: string;
  messaggio: string;
  newsletter_consent: boolean;
}): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from("contact_submissions").insert({
      form_type: "contatti",
      data: {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        telefono: data.telefono || "",
        oggetto: data.oggetto,
        messaggio: data.messaggio,
      },
      newsletter_consent: data.newsletter_consent,
    });

    if (dbError) {
      console.error("Error inserting contact submission:", dbError);
      return { error: "Errore durante l'invio del messaggio. Riprova." };
    }

    // Send admin notification email (non-blocking)
    try {
      await sendAdminNotification(
        `Nuovo messaggio dal form contatti: ${data.oggetto}`,
        adminNewContactFormEmail(
          data.nome,
          data.cognome,
          data.email,
          data.oggetto,
          data.messaggio,
          data.telefono
        )
      );
    } catch (emailErr) {
      console.error("Error sending admin notification email:", emailErr);
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in submitContactForm:", err);
    return { error: "Errore imprevisto. Riprova pi\u00f9 tardi." };
  }
}
