import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getQuotePdfData } from "@/lib/pdf/quote-pdf-data";
import { generateStaticMap } from "@/lib/pdf/static-map";
import QuotePdfDocument from "@/lib/pdf/QuotePdfDocument";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // allow up to 30s for PDF generation

export async function GET(request: NextRequest) {
  try {
    // 1. Get quote ID from query params
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("id");

    if (!quoteId) {
      return NextResponse.json(
        { error: "Parametro id mancante." },
        { status: 400 }
      );
    }

    // 2. Auth check — verify user is logged in and belongs to an agency
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non autenticato." },
        { status: 401 }
      );
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!agency) {
      return NextResponse.json(
        { error: "Nessuna agenzia associata." },
        { status: 403 }
      );
    }

    // 3. Fetch all data for the PDF
    const data = await getQuotePdfData(quoteId, agency.id);

    if (!data) {
      return NextResponse.json(
        { error: "Preventivo non trovato." },
        { status: 404 }
      );
    }

    // 4. Generate static map image
    let mapImageBase64: string | null = null;
    try {
      const mapBuffer = await generateStaticMap(data.locations);
      if (mapBuffer) {
        mapImageBase64 = mapBuffer.toString("base64");
      }
    } catch (mapErr) {
      console.error("Error generating map (non-blocking):", mapErr);
    }

    // 5. Determine logo URL (absolute for @react-pdf)
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.headers.get("origin") ??
      "https://mishatravel.com";
    const logoUrl = `${origin}/images/logo/logo.png`;

    // 6. Render PDF to buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotePdfDocument, {
        data,
        mapImageBase64,
        logoUrl,
      }) as any
    );

    // 7. Return PDF response
    const filename = `preventivo-${quoteId.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error generating quote PDF:", err);
    return NextResponse.json(
      { error: "Errore nella generazione del PDF." },
      { status: 500 }
    );
  }
}
