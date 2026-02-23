"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminNotification } from "@/lib/email/brevo";
import { adminNewPartnerInquiryEmail } from "@/lib/email/templates";

export async function submitPartnerInquiry(data: {
  nome_cognome: string;
  agenzia: string;
  citta: string;
  telefono: string;
  email: string;
  messaggio: string;
  newsletter_consent: boolean;
}): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from("contact_submissions").insert({
      form_type: "diventa_partner",
      data: {
        nome_cognome: data.nome_cognome,
        agenzia: data.agenzia,
        citta: data.citta,
        telefono: data.telefono,
        email: data.email,
        messaggio: data.messaggio,
      },
      newsletter_consent: data.newsletter_consent,
    });

    if (dbError) {
      console.error("Error inserting partner inquiry:", dbError);
      return { error: "Errore durante l'invio. Riprova." };
    }

    // Send admin notification (non-blocking)
    try {
      await sendAdminNotification(
        `Nuova richiesta partnership: ${data.agenzia}`,
        adminNewPartnerInquiryEmail(
          data.nome_cognome,
          data.agenzia,
          data.email,
          data.messaggio,
          data.citta,
          data.telefono
        )
      );
    } catch (emailErr) {
      console.error("Error sending admin notification:", emailErr);
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in submitPartnerInquiry:", err);
    return { error: "Errore imprevisto. Riprova più tardi." };
  }
}
