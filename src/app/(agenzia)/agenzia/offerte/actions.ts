"use server";

import { acceptOffer, declineOffer } from "@/lib/supabase/queries/quotes";

export async function acceptOfferAction(
  offerId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  return acceptOffer(offerId, requestId);
}

export async function declineOfferAction(
  offerId: string,
  requestId: string,
  motivation?: string
): Promise<{ success: boolean; error?: string }> {
  return declineOffer(offerId, requestId, motivation);
}
