"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { acceptOffer, declineOffer } from "@/lib/supabase/queries/quotes";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import {
  offerAcceptedConfirmationEmail,
  adminOfferAcceptedEmail,
  adminOfferDeclinedEmail,
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
  full_name: z.string().min(1, "Nome completo obbligatorio"),
  document_type: z.string().nullable().optional(),
  document_number: z.string().nullable().optional(),
  is_child: z.boolean().default(false),
});

export type ParticipantInput = z.infer<typeof participantSchema>;

// ---------------------------------------------------------------------------
// acceptOfferWithParticipants — new workflow
// ---------------------------------------------------------------------------

export async function acceptOfferWithParticipants(
  offerId: string,
  requestId: string,
  participants: ParticipantInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authenticate the user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    // 2. Retrieve agency
    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return { success: false, error: "Nessuna agenzia associata." };
    }

    const admin = createAdminClient();

    // 3. Verify the request belongs to this agency and has the correct status
    const { data: request } = await admin
      .from("quote_requests")
      .select("id, agency_id, status")
      .eq("id", requestId)
      .single();

    if (!request || request.agency_id !== agency.id) {
      return { success: false, error: "Richiesta non trovata." };
    }

    if (request.status !== "offered" && request.status !== "offer_sent") {
      return {
        success: false,
        error: "Lo stato della richiesta non permette questa azione.",
      };
    }

    // 4. Validate participants
    const validatedParticipants = participants.map((p, i) => {
      const result = participantSchema.safeParse(p);
      if (!result.success) {
        throw new Error(
          `Partecipante ${i + 1}: ${result.error.issues[0]?.message}`
        );
      }
      return result.data;
    });

    // 5. Insert participants
    if (validatedParticipants.length > 0) {
      const rows = validatedParticipants.map((p, i) => ({
        request_id: requestId,
        full_name: p.full_name.trim(),
        document_type: p.document_type?.trim() || null,
        document_number: p.document_number?.trim() || null,
        is_child: p.is_child,
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

    // 6. Update status to 'accepted'
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

    // 7. Timeline entry
    const participantCount = validatedParticipants.length;
    const adultCount = validatedParticipants.filter((p) => !p.is_child).length;
    const childCount = validatedParticipants.filter((p) => p.is_child).length;

    await admin.from("quote_timeline").insert({
      request_id: requestId,
      action: "Offerta accettata con partecipanti",
      details: `L'agenzia ha accettato l'offerta. ${participantCount} partecipanti registrati (${adultCount} adulti, ${childCount} bambini).`,
      actor: "agency",
    });

    // 8. Emails
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        if (ctx.agencyEmail) {
          await sendTransactionalEmail(
            { email: ctx.agencyEmail, name: ctx.agencyName },
            "Offerta accettata - MishaTravel",
            offerAcceptedConfirmationEmail(ctx.agencyName, ctx.productName)
          );
        }
        await sendAdminNotification(
          `Offerta accettata da ${ctx.agencyName}`,
          adminOfferAcceptedEmail(ctx.agencyName, ctx.productName, requestId)
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
// acceptOfferAction — legacy wrapper (kept for backward compatibility)
// ---------------------------------------------------------------------------

export async function acceptOfferAction(
  offerId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await acceptOffer(offerId, requestId);

  if (result.success) {
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        if (ctx.agencyEmail) {
          await sendTransactionalEmail(
            { email: ctx.agencyEmail, name: ctx.agencyName },
            "Offerta accettata - MishaTravel",
            offerAcceptedConfirmationEmail(ctx.agencyName, ctx.productName)
          );
        }
        await sendAdminNotification(
          `Offerta accettata da ${ctx.agencyName}`,
          adminOfferAcceptedEmail(ctx.agencyName, ctx.productName, requestId)
        );
      }
    } catch (emailErr) {
      console.error("Error sending offer accepted emails:", emailErr);
    }
  }

  return result;
}

export async function declineOfferAction(
  offerId: string,
  requestId: string,
  motivation?: string
): Promise<{ success: boolean; error?: string }> {
  const result = await declineOffer(offerId, requestId, motivation);

  if (result.success) {
    // --- Email: notification to admin ---
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
