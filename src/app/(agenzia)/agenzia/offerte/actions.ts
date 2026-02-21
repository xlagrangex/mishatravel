"use server";

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

export async function acceptOfferAction(
  offerId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await acceptOffer(offerId, requestId);

  if (result.success) {
    // --- Emails: confirmation to agency + notification to admin ---
    try {
      const ctx = await getQuoteEmailContext(requestId);
      if (ctx) {
        // Email to agency: offer accepted confirmation
        if (ctx.agencyEmail) {
          await sendTransactionalEmail(
            { email: ctx.agencyEmail, name: ctx.agencyName },
            "Offerta accettata - MishaTravel",
            offerAcceptedConfirmationEmail(ctx.agencyName, ctx.productName)
          );
        }

        // Email to admin: offer accepted
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
