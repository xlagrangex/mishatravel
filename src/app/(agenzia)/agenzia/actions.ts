"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const tourQuoteSchema = z.object({
  request_type: z.literal("tour"),
  tour_id: z.string().uuid(),
  departure_id: z.string().uuid(),
  participants_adults: z.number().int().min(1, "Almeno 1 adulto richiesto"),
  participants_children: z.number().int().min(0).default(0),
  cabin_type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  extras: z.array(z.string()).default([]),
});

const cruiseQuoteSchema = z.object({
  request_type: z.literal("cruise"),
  cruise_id: z.string().uuid(),
  departure_id: z.string().uuid(),
  participants_adults: z.number().int().min(1, "Almeno 1 adulto richiesto"),
  participants_children: z.number().int().min(0).default(0),
  cabin_type: z.string().min(1, "Seleziona un tipo cabina"),
  num_cabins: z.number().int().min(1, "Almeno 1 cabina richiesta"),
  deck: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  extras: z.array(z.string()).default([]),
});

export type TourQuoteInput = z.infer<typeof tourQuoteSchema>;
export type CruiseQuoteInput = z.infer<typeof cruiseQuoteSchema>;

export interface QuoteActionResult {
  success: boolean;
  error?: string;
  quoteId?: string;
}

// ---------------------------------------------------------------------------
// createQuoteRequest - Server Action
// ---------------------------------------------------------------------------

export async function createQuoteRequest(
  data: TourQuoteInput | CruiseQuoteInput
): Promise<QuoteActionResult> {
  try {
    // 1. Authenticate the user via the SSR client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Devi effettuare il login per richiedere un preventivo." };
    }

    // 2. Retrieve the agency record for the authenticated user
    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (agencyError || !agency) {
      return { success: false, error: "Nessuna agenzia associata al tuo account." };
    }

    if (agency.status !== "active") {
      return {
        success: false,
        error: "La tua agenzia non e ancora attiva. Contatta l'amministrazione.",
      };
    }

    // 3. Validate the input data with Zod
    const isTour = data.request_type === "tour";
    const parseResult = isTour
      ? tourQuoteSchema.safeParse(data)
      : cruiseQuoteSchema.safeParse(data);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message ?? "Dati non validi.";
      return { success: false, error: firstError };
    }

    const validated = parseResult.data;

    // 4. Use admin client for the multi-table insert (bypasses RLS for quote_timeline)
    const admin = createAdminClient();

    // 4a. Insert the quote request
    const { data: quoteRow, error: insertError } = await admin
      .from("quote_requests")
      .insert({
        agency_id: agency.id,
        request_type: validated.request_type,
        tour_id: isTour ? (validated as TourQuoteInput).tour_id : null,
        cruise_id: !isTour ? (validated as CruiseQuoteInput).cruise_id : null,
        departure_id: validated.departure_id,
        participants_adults: validated.participants_adults,
        participants_children: validated.participants_children,
        cabin_type: validated.cabin_type ?? null,
        num_cabins: !isTour ? (validated as CruiseQuoteInput).num_cabins : null,
        notes: validated.notes ?? null,
        status: "sent",
      })
      .select("id")
      .single();

    if (insertError || !quoteRow) {
      console.error("Error inserting quote_request:", insertError);
      return { success: false, error: "Errore nella creazione della richiesta." };
    }

    const quoteId = quoteRow.id;

    // 4b. Insert extras (if any)
    if (validated.extras && validated.extras.length > 0) {
      const extrasToInsert = validated.extras.map((extraName: string) => ({
        request_id: quoteId,
        extra_name: extraName,
        quantity: 1,
      }));

      const { error: extrasError } = await admin
        .from("quote_request_extras")
        .insert(extrasToInsert);

      if (extrasError) {
        console.error("Error inserting quote_request_extras:", extrasError);
        // Non-blocking: the quote is still created
      }
    }

    // 4c. Insert timeline entry
    const { error: timelineError } = await admin.from("quote_timeline").insert({
      request_id: quoteId,
      action: "Richiesta preventivo inviata",
      details: isTour
        ? `Richiesta preventivo tour - ${validated.participants_adults} adulti, ${validated.participants_children} bambini`
        : `Richiesta preventivo crociera - ${validated.participants_adults} adulti, ${validated.participants_children} bambini, ${(validated as CruiseQuoteInput).num_cabins} cabine`,
      actor: "agency",
    });

    if (timelineError) {
      console.error("Error inserting quote_timeline:", timelineError);
      // Non-blocking
    }

    return { success: true, quoteId };
  } catch (err) {
    console.error("Unexpected error in createQuoteRequest:", err);
    return { success: false, error: "Errore imprevisto. Riprova piu tardi." };
  }
}
