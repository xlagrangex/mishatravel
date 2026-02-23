"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import {
  quoteRequestSubmittedEmail,
  adminNewQuoteRequestEmail,
} from "@/lib/email/templates";

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
  preview_price: z.number().optional().nullable(),
  preview_price_label: z.string().optional().nullable(),
});

const cruiseQuoteSchema = z.object({
  request_type: z.literal("cruise"),
  cruise_id: z.string().uuid(),
  departure_id: z.string().uuid(),
  participants_adults: z.number().int().min(1, "Almeno 1 adulto richiesto"),
  participants_children: z.number().int().min(0).default(0),
  cabin_type: z.string().optional().nullable(),
  cabin_id: z.string().uuid().optional().nullable(),
  num_cabins: z.number().int().min(1).default(1),
  notes: z.string().optional().nullable(),
  extras: z.array(z.string()).default([]),
  preview_price: z.number().optional().nullable(),
  preview_price_label: z.string().optional().nullable(),
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
        cabin_id: !isTour ? ((validated as CruiseQuoteInput).cabin_id ?? null) : null,
        num_cabins: !isTour ? (validated as CruiseQuoteInput).num_cabins : null,
        notes: validated.notes ?? null,
        preview_price: validated.preview_price ?? null,
        preview_price_label: validated.preview_price_label ?? null,
        status: "requested",
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

    // --- Emails: confirmation to agency + notification to admin ---
    try {
      // Fetch agency details and product name for the email
      const { data: agencyData } = await admin
        .from("agencies")
        .select("business_name, email")
        .eq("id", agency.id)
        .single();

      let productName = "N/D";
      if (isTour) {
        const { data: tour } = await admin
          .from("tours")
          .select("title")
          .eq("id", (validated as TourQuoteInput).tour_id)
          .single();
        productName = tour?.title ?? "Tour";
      } else {
        const { data: cruise } = await admin
          .from("cruises")
          .select("title")
          .eq("id", (validated as CruiseQuoteInput).cruise_id)
          .single();
        productName = cruise?.title ?? "Crociera";
      }

      const agName = agencyData?.business_name ?? "Agenzia";
      const agEmail = agencyData?.email;

      // Email to agency: quote request submitted
      if (agEmail) {
        await sendTransactionalEmail(
          { email: agEmail, name: agName },
          "Richiesta preventivo inviata - MishaTravel",
          quoteRequestSubmittedEmail(agName, productName, validated.request_type, quoteId, validated.preview_price_label)
        );
      }

      // Email to admin: new quote request
      await sendAdminNotification(
        `Nuova richiesta preventivo da ${agName}`,
        adminNewQuoteRequestEmail(
          agName,
          productName,
          validated.request_type,
          quoteId,
          validated.participants_adults,
          validated.participants_children,
          validated.preview_price_label
        )
      );
    } catch (emailErr) {
      console.error("Error sending quote emails:", emailErr);
    }

    return { success: true, quoteId };
  } catch (err) {
    console.error("Unexpected error in createQuoteRequest:", err);
    return { success: false, error: "Errore imprevisto. Riprova piu tardi." };
  }
}
