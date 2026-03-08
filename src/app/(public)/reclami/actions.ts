"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminNotification } from "@/lib/email/brevo";
import { adminNewComplaintEmail } from "@/lib/email/templates";
import { notifyAdmins } from "@/lib/supabase/queries/notifications";

export async function submitComplaint(data: {
  nome_cognome: string;
  email: string;
  telefono: string;
  n_pratica: string;
  destinazione: string;
  date_viaggio: string;
  agenzia: string;
  descrizione: string;
  richiesta: string;
}): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    const { error: dbError } = await supabase.from("contact_submissions").insert({
      form_type: "reclami",
      data: {
        nome_cognome: data.nome_cognome,
        email: data.email,
        telefono: data.telefono,
        n_pratica: data.n_pratica,
        destinazione: data.destinazione,
        date_viaggio: data.date_viaggio,
        agenzia: data.agenzia,
        descrizione: data.descrizione,
        richiesta: data.richiesta,
      },
      newsletter_consent: false,
    });

    if (dbError) {
      console.error("Error inserting complaint:", dbError);
      return { error: "Errore durante l'invio del reclamo. Riprova." };
    }

    try {
      await Promise.all([
        sendAdminNotification(
          `Nuovo reclamo ricevuto - Pratica: ${data.n_pratica || "N/D"}`,
          adminNewComplaintEmail(
            data.nome_cognome,
            data.email,
            data.n_pratica,
            data.descrizione,
            data.destinazione
          )
        ),
        notifyAdmins({
          title: `Nuovo reclamo - Pratica: ${data.n_pratica || "N/D"}`,
          message: `Da ${data.nome_cognome} (${data.email})`,
          link: "/admin/messaggi",
        }),
      ]);
    } catch (emailErr) {
      console.error("Error sending admin notification:", emailErr);
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in submitComplaint:", err);
    return { error: "Errore imprevisto. Riprova più tardi." };
  }
}
