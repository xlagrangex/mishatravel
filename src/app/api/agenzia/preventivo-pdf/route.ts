import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import fs from "fs";
import path from "path";
import os from "os";
import { createClient } from "@/lib/supabase/server";
import { getQuotePdfData } from "@/lib/pdf/quote-pdf-data";
import QuotePdfDocument from "@/lib/pdf/QuotePdfDocument";
import type { LocationPoint } from "@/lib/pdf/quote-pdf-data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// Image pre-fetching utility
// ---------------------------------------------------------------------------

async function fetchImageAsBase64(
  url: string,
  timeoutMs = 3000
): Promise<string | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    // Skip images larger than 3MB to keep PDF size reasonable
    if (buf.byteLength > 3_000_000) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Map generation utility
// ---------------------------------------------------------------------------

const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28">
  <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.5 15.5 0 10 0z" fill="#C41E2F"/>
  <circle cx="10" cy="10" r="4" fill="white"/>
</svg>`;

async function generateMapBase64(
  locations: LocationPoint[],
  timeoutMs = 4000
): Promise<string | null> {
  const coords = locations
    .filter((l) => l.coordinate)
    .map((l) => {
      const parts = l.coordinate!.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
      // DB stores "lat,lng", staticmaps needs [lng, lat]
      return [parts[1], parts[0]] as [number, number];
    })
    .filter((c): c is [number, number] => c !== null);

  if (coords.length < 2) return null;

  try {
    const StaticMaps = (await import("staticmaps")).default;

    // Write SVG marker to temp file
    const markerPath = path.join(os.tmpdir(), "mt-map-pin.svg");
    fs.writeFileSync(markerPath, MARKER_SVG);

    const map = new StaticMaps({
      width: 600,
      height: 300,
      tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    });

    // Draw route line
    map.addLine({
      coords,
      color: "#C41E2FBB",
      width: 2,
    });

    // Add pin markers
    for (const coord of coords) {
      map.addMarker({
        coord,
        img: markerPath,
        height: 28,
        width: 20,
      });
    }

    // Render with timeout
    await Promise.race([
      map.render(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs)
      ),
    ]);

    const buffer = await map.image.buffer("image/png");
    return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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

    // 2. Auth check
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

    // 3. Determine access: agency user or admin/operator
    let agencyId: string | null = null;

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (agency) {
      agencyId = agency.id;
    } else {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const role = roleData?.role;
      if (role !== "super_admin" && role !== "admin" && role !== "operator") {
        return NextResponse.json(
          { error: "Accesso non autorizzato." },
          { status: 403 }
        );
      }
    }

    // 4. Fetch all data for the PDF
    const data = await getQuotePdfData(quoteId, agencyId);

    if (!data) {
      return NextResponse.json(
        { error: "Preventivo non trovato." },
        { status: 404 }
      );
    }

    // 5. Load logo from filesystem as base64
    let logoUrl = "";
    try {
      const logoPath = path.join(process.cwd(), "public/images/logo/logo.png");
      const logoBuffer = fs.readFileSync(logoPath);
      logoUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ??
        request.headers.get("origin") ??
        "https://mishatravel.com";
      logoUrl = `${origin}/images/logo/logo.png`;
    }

    // 6. Pre-fetch images + map in parallel with a total budget
    const IMAGE_BUDGET_MS = 8000;

    const imagePromises: Promise<{ key: string; base64: string | null }>[] = [];

    // Cover image
    if (data.coverImageUrl) {
      imagePromises.push(
        fetchImageAsBase64(data.coverImageUrl, 4000).then((b) => ({
          key: "__cover__",
          base64: b,
        }))
      );
    }

    // Ship image
    if (data.ship?.cover_image_url) {
      imagePromises.push(
        fetchImageAsBase64(data.ship.cover_image_url, 4000).then((b) => ({
          key: "__ship__",
          base64: b,
        }))
      );
    }

    // Cabin images (max 4)
    for (const cabin of data.shipCabinDetails.slice(0, 4)) {
      if (cabin.immagine_url) {
        imagePromises.push(
          fetchImageAsBase64(cabin.immagine_url, 3500).then((b) => ({
            key: cabin.titolo,
            base64: b,
          }))
        );
      }
    }

    // Map image from location coordinates
    if (data.locations.length >= 2) {
      imagePromises.push(
        generateMapBase64(data.locations, 5000).then((b) => ({
          key: "__map__",
          base64: b,
        }))
      );
    }

    // Race all images against budget
    let imageResults: { key: string; base64: string | null }[] = [];
    if (imagePromises.length > 0) {
      imageResults = await Promise.race([
        Promise.all(imagePromises),
        new Promise<{ key: string; base64: string | null }[]>((resolve) =>
          setTimeout(() => resolve([]), IMAGE_BUDGET_MS)
        ),
      ]);
    }

    let coverImageBase64: string | null = null;
    let shipImageBase64: string | null = null;
    let mapImageBase64: string | null = null;
    const cabinImagesBase64: Record<string, string> = {};

    for (const r of imageResults) {
      if (!r.base64) continue;
      if (r.key === "__cover__") coverImageBase64 = r.base64;
      else if (r.key === "__ship__") shipImageBase64 = r.base64;
      else if (r.key === "__map__") mapImageBase64 = r.base64;
      else cabinImagesBase64[r.key] = r.base64;
    }

    // 7. Render PDF to buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotePdfDocument, {
        data,
        logoUrl,
        coverImageBase64,
        shipImageBase64,
        cabinImagesBase64,
        mapImageBase64,
      }) as any
    );

    // 8. Return PDF response
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
