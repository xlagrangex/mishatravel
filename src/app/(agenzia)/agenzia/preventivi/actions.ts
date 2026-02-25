"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { acceptOffer, declineOffer } from "@/lib/supabase/queries/quotes";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import {
  offerAcceptedConfirmationEmail,
  adminOfferAcceptedEmail,
  adminOfferDeclinedEmail,
  adminCounterSignedContractEmail,
  adminPaymentReceiptEmail,
  adminPaymentConfirmedEmail,
} from "@/lib/email/templates";

/**
 * Fetch agency + product info for a given quote request for email templates.
 */
async function getQuoteEmailContext(requestId: string) {
  try {
    const supabase = createAdminClient();
    const { data: request } = await supabase
      .from("quote_requests")
      .select(`
        request_type,
        agency:agencies!agency_id(business_name, email),
        tour:tours!tour_id(title),
        cruise:cruises!cruise_id(title)
      `)
      .eq("id", requestId)
      .single();

    if (!request) return null;

    const agency = request.agency as any;
    const tour = request.tour as any;
    const cruise = request.cruise as any;

    return {
      agencyName: agency?.business_name ?? "Agenzia",
      agencyEmail: agency?.email ?? null,
      productName:
        request.request_type === "tour"
          ? tour?.title ?? "Tour"
          : cruise?.title ?? "Crociera",
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Participant schema
// ---------------------------------------------------------------------------

const participantSchema = z.object({
  first_name: z.string().min(1, "Nome obbligatorio"),
  last_name: z.string().min(1, "Cognome obbligatorio"),
  age: z.coerce.number().int().min(0).max(120).nullable().optional(),
  codice_fiscale: z.string().nullable().optional(),
  document_type: z.string().nullable().optional(),
  document_number: z.string().nullable().optional(),
  document_expiry: z.string().nullable().optional(),
});

export type ParticipantInput = z.infer<typeof participantSchema>;

function getAgeCategory(age: number | null | undefined): string | null {
  if (age == null) return null;
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  if (age < 18) return 'teen';
  return 'adult';
}

// ---------------------------------------------------------------------------
// acceptOfferWithParticipants
// ---------------------------------------------------------------------------

export async function acceptOfferWithParticipants(
  offerId: string,
  requestId: string,
  participants: ParticipantInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    const { data: request } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .eq("id", requestId)
      .single();

    if (!request || request.agency_id !== agency.id) {
      return { success: false, error: "Richiesta non trovata." };
    }

    if (request.status !== "offer_sent") {
      return {
        success: false,
        error: "Lo stato della richiesta non permette questa azione.",
      };
    }

    const validatedParticipants = participants.map((p, i) => {
      const result = participantSchema.safeParse(p);
      if (!result.success) {
        throw new Error(
          `Partecipante ${i + 1}: ${result.error.issues[0]?.message}`
        );
      }
      return result.data;
    });

    if (validatedParticipants.length > 0) {
      const rows = validatedParticipants.map((p, i) => ({
        request_id: requestId,
        first_name: p.first_name.trim(),
        last_name: p.last_name.trim(),
        full_name: `${p.first_name.trim()} ${p.last_name.trim()}`,
        age: p.age ?? null,
        is_child: p.age != null ? p.age < 18 : false,
        age_category: getAgeCategory(p.age),
        codice_fiscale: p.codice_fiscale?.trim() || null,
        document_type: p.document_type?.trim() || null,
        document_number: p.document_number?.trim() || null,
        document_expiry: p.document_expiry || null,
        sort_order: i,
      }));

      const { error: insertError } = await admin
        .from("quote_participants")
        .insert(rows);

      if (insertError) {
        return {
          success: false,
          error: `Errore inserimento partecipanti: ${insertError.message}`,
        };
      }
    }

    const { error: updateError } = await admin
      .from("quote_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      return {
        success: false,
        error: "Errore nell'aggiornamento dello stato.",
      };
    }

    const participantCount = validatedParticipants.length;
    const childCount = validatedParticipants.filter(
      (p) => p.age != null && p.age < 18
    ).length;
    const adultCount = participantCount - childCount;

    await admin.from("quote_timeline").insert({
      request_id: requestId,
      action: "Offerta accettata con partecipanti",
      details: `L'agenzia ha accettato l'offerta. ${participantCount} partecipanti registrati (${adultCount} adulti, ${childCount} bambini).`,
      actor: "agency",
    });

    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        if (ctx.agencyEmail) {
          await sendTransactionalEmail(
            { email: ctx.agencyEmail, name: ctx.agencyName },
            "Offerta accettata - MishaTravel",
            offerAcceptedConfirmationEmail(ctx.agencyName, ctx.productName, participantCount)
          );
        }
        await sendAdminNotification(
          `Offerta accettata da ${ctx.agencyName}`,
          adminOfferAcceptedEmail(ctx.agencyName, ctx.productName, requestId, participantCount)
        );
      }
    } catch (emailErr) {
      console.error("Error sending offer accepted emails:", emailErr);
    }

    return { success: true };
  } catch (err) {
    console.error("Error in acceptOfferWithParticipants:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}

// ---------------------------------------------------------------------------
// declineOfferAction
// ---------------------------------------------------------------------------

export async function declineOfferAction(
  offerId: string,
  requestId: string,
  motivation?: string
): Promise<{ success: boolean; error?: string }> {
  const result = await declineOffer(offerId, requestId, motivation);

  if (result.success) {
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        await sendAdminNotification(
          `Offerta rifiutata da ${ctx.agencyName}`,
          adminOfferDeclinedEmail(
            ctx.agencyName,
            ctx.productName,
            requestId,
            motivation
          )
        );
      }
    } catch (emailErr) {
      console.error("Error sending offer declined email:", emailErr);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// uploadCounterSignedContract
// ---------------------------------------------------------------------------

export async function uploadCounterSignedContract(
  requestId: string,
  fileUrl: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    const { data: request } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .eq("id", requestId)
      .single();

    if (!request || request.agency_id !== agency.id) {
      return { success: false, error: "Richiesta non trovata." };
    }

    if (request.status !== "contract_sent") {
      return {
        success: false,
        error: "Lo stato della richiesta non permette questa azione.",
      };
    }

    // Insert document
    const { error: docError } = await admin.from("quote_documents").insert({
      request_id: requestId,
      file_url: fileUrl,
      file_name: fileName,
      document_type: "contratto_controfirmato",
    });

    if (docError) {
      return { success: false, error: docError.message };
    }

    // Timeline
    await admin.from("quote_timeline").insert({
      request_id: requestId,
      action: "Contratto controfirmato caricato dall'agenzia",
      details: fileName,
      actor: "agency",
    });

    // Notify admin
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        await sendAdminNotification(
          `Contratto controfirmato da ${ctx.agencyName}`,
          adminCounterSignedContractEmail(ctx.agencyName, ctx.productName, requestId)
        );
      }
    } catch (emailErr) {
      console.error("Error sending counter-signed contract email:", emailErr);
    }

    revalidatePath(`/agenzia/preventivi/${requestId}`);
    revalidatePath(`/admin/preventivi/${requestId}`);
    revalidatePath("/admin/preventivi");
    return { success: true };
  } catch (err) {
    console.error("Error in uploadCounterSignedContract:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}

// ---------------------------------------------------------------------------
// uploadPaymentReceipt
// ---------------------------------------------------------------------------

export async function uploadPaymentReceipt(
  requestId: string,
  fileUrl: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    const { data: request } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .eq("id", requestId)
      .single();

    if (!request || request.agency_id !== agency.id) {
      return { success: false, error: "Richiesta non trovata." };
    }

    if (request.status !== "contract_sent") {
      return {
        success: false,
        error: "Lo stato della richiesta non permette questa azione.",
      };
    }

    // Insert document
    const { error: docError } = await admin.from("quote_documents").insert({
      request_id: requestId,
      file_url: fileUrl,
      file_name: fileName,
      document_type: "ricevuta_pagamento",
    });

    if (docError) {
      return { success: false, error: docError.message };
    }

    // Timeline
    await admin.from("quote_timeline").insert({
      request_id: requestId,
      action: "Ricevuta di pagamento caricata dall'agenzia",
      details: fileName,
      actor: "agency",
    });

    // Notify admin
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        await sendAdminNotification(
          `Ricevuta pagamento da ${ctx.agencyName}`,
          adminPaymentReceiptEmail(ctx.agencyName, ctx.productName, requestId)
        );
      }
    } catch (emailErr) {
      console.error("Error sending payment receipt email:", emailErr);
    }

    revalidatePath(`/agenzia/preventivi/${requestId}`);
    revalidatePath(`/admin/preventivi/${requestId}`);
    revalidatePath("/admin/preventivi");
    return { success: true };
  } catch (err) {
    console.error("Error in uploadPaymentReceipt:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}

// ---------------------------------------------------------------------------
// confirmPaymentAction
// ---------------------------------------------------------------------------

export async function confirmPaymentAction(
  requestId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    const { data: request } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .eq("id", requestId)
      .single();

    if (!request || request.agency_id !== agency.id) {
      return { success: false, error: "Richiesta non trovata." };
    }

    if (request.status !== "contract_sent") {
      return {
        success: false,
        error: "Lo stato della richiesta non permette questa azione.",
      };
    }

    // Timeline entry
    await admin.from("quote_timeline").insert({
      request_id: requestId,
      action: "Pagamento confermato dall'agenzia",
      details: notes?.trim() || null,
      actor: "agency",
    });

    // Notify admin
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        await sendAdminNotification(
          `Pagamento confermato da ${ctx.agencyName}`,
          adminPaymentConfirmedEmail(ctx.agencyName, ctx.productName, requestId, notes)
        );
      }
    } catch (emailErr) {
      console.error("Error sending payment confirmed email:", emailErr);
    }

    revalidatePath(`/agenzia/preventivi/${requestId}`);
    revalidatePath(`/admin/preventivi/${requestId}`);
    revalidatePath("/admin/preventivi");
    return { success: true };
  } catch (err) {
    console.error("Error in confirmPaymentAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}

// ---------------------------------------------------------------------------
// agencyBulkArchive
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES = ["confirmed", "declined", "rejected"];

export async function agencyBulkArchive(
  requestIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!requestIds.length) {
    return { success: false, error: "Nessun preventivo selezionato." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    // Verify all requests belong to this agency and are in terminal status
    const { data: requests, error: fetchError } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .in("id", requestIds);

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const invalid = (requests ?? []).filter(
      (r) =>
        r.agency_id !== agency.id ||
        !TERMINAL_STATUSES.includes(r.status)
    );

    if (invalid.length > 0) {
      return {
        success: false,
        error:
          "Puoi archiviare solo preventivi completati (confermati, rifiutati, respinti) della tua agenzia.",
      };
    }

    // Update status
    const { error: updateError } = await admin
      .from("quote_requests")
      .update({ status: "archived" })
      .in("id", requestIds);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Timeline entries
    const timelineRows = requestIds.map((id) => ({
      request_id: id,
      action: "Preventivo archiviato dall'agenzia",
      details: null,
      actor: "agency" as const,
    }));

    await admin.from("quote_timeline").insert(timelineRows);

    revalidatePath("/agenzia/preventivi");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Errore imprevisto.",
    };
  }
}
