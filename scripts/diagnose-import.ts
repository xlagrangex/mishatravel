/**
 * MishaTravel - Import Diagnostics Script
 *
 * Analyzes the quality of data imported from WordPress into Supabase.
 * Checks for missing fields, empty sub-tables, and cross-references
 * with the original XML source to identify parsing vs source issues.
 *
 * Usage: npx tsx scripts/diagnose-import.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

// ============================================================
// CONFIG
// ============================================================
config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[ERROR] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const XML_PATH = resolve(__dirname, "..", "mishatravel.WordPress.2026-02-21.xml");

// ============================================================
// COLORS
// ============================================================
const c = {
  reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", bold: "\x1b[1m", dim: "\x1b[2m",
  white: "\x1b[37m", magenta: "\x1b[35m",
};

function header(msg: string) {
  console.log(`\n${c.bold}${c.cyan}${"=".repeat(70)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(70)}${c.reset}\n`);
}

function subHeader(msg: string) {
  console.log(`\n${c.bold}${c.yellow}--- ${msg} ---${c.reset}\n`);
}

function stat(label: string, value: number | string, total?: number) {
  const pct = total ? ` (${((Number(value) / total) * 100).toFixed(1)}%)` : "";
  const color = Number(value) > 0 ? c.red : c.green;
  console.log(`  ${color}${label}: ${value}${pct}${c.reset}`);
}

function statGood(label: string, value: number | string) {
  console.log(`  ${c.green}${label}: ${value}${c.reset}`);
}

// ============================================================
// XML PARSING HELPERS
// ============================================================
interface WPItem {
  title: string;
  "content:encoded": string;
  "wp:post_id": number;
  "wp:post_name": string;
  "wp:post_type": string;
  "wp:status": string;
  "wp:postmeta": { "wp:meta_key": string; "wp:meta_value": string }[] | { "wp:meta_key": string; "wp:meta_value": string };
  "wp:attachment_url"?: string;
}

function getMetaMap(item: WPItem): Record<string, string> {
  const meta: Record<string, string> = {};
  const postmeta = item["wp:postmeta"];
  if (!postmeta) return meta;
  const entries = Array.isArray(postmeta) ? postmeta : [postmeta];
  for (const m of entries) {
    const key = String(m["wp:meta_key"] ?? "");
    const val = String(m["wp:meta_value"] ?? "");
    if (key) {
      meta[key] = val;
    }
  }
  return meta;
}

function phpUnserializeArray(str: string): string[] {
  if (!str || !str.startsWith("a:")) return [];
  const values: string[] = [];
  const regex = /s:(\d+):"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    values.push(match[2]);
  }
  return values;
}

// ============================================================
// MAIN DIAGNOSTIC
// ============================================================
async function main() {
  console.log(`\n${c.bold}${c.magenta}
 ╔═══════════════════════════════════════════════════════════╗
 ║  MishaTravel - Import Quality Diagnostic                 ║
 ╚═══════════════════════════════════════════════════════════╝${c.reset}\n`);

  // ============================================================
  // 1. DESTINATIONS
  // ============================================================
  header("1. DESTINATIONS ANALYSIS");

  const { data: destinations, error: destErr } = await supabase
    .from("destinations")
    .select("*")
    .order("name");

  if (destErr) {
    console.error("Error fetching destinations:", destErr.message);
  } else {
    const total = destinations!.length;
    statGood("Total destinations", total);

    const nullCover = destinations!.filter(d => !d.cover_image_url).length;
    const nullCoord = destinations!.filter(d => !d.coordinate).length;
    const nullMacro = destinations!.filter(d => !d.macro_area).length;
    const nullDesc = destinations!.filter(d => !d.description).length;

    stat("Missing cover_image_url", nullCover, total);
    stat("Missing coordinate", nullCoord, total);
    stat("Missing macro_area", nullMacro, total);
    stat("Missing description", nullDesc, total);

    // Detail table
    subHeader("Destination Details");
    console.log(
      `  ${"Name".padEnd(30)} ${"Cover?".padEnd(8)} ${"Coord?".padEnd(8)} ${"Macro".padEnd(20)} ${"Desc?".padEnd(8)}`
    );
    console.log(`  ${"-".repeat(74)}`);
    for (const d of destinations!) {
      const name = (d.name || "").substring(0, 28).padEnd(30);
      const cover = d.cover_image_url ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`;
      const coord = d.coordinate ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`;
      const macro = (d.macro_area || "NONE").substring(0, 18).padEnd(20);
      const desc = d.description ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`;
      console.log(`  ${name} ${cover.padEnd(8 + 9)} ${coord.padEnd(8 + 9)} ${macro} ${desc}`);
    }
  }

  // ============================================================
  // 2. TOURS
  // ============================================================
  header("2. TOURS ANALYSIS");

  const { data: tours, error: tourErr } = await supabase
    .from("tours")
    .select("*")
    .order("title");

  if (tourErr) {
    console.error("Error fetching tours:", tourErr.message);
  } else {
    const total = tours!.length;
    statGood("Total tours", total);

    const nullPrice = tours!.filter(t => !t.a_partire_da).length;
    const prezzoTrue = tours!.filter(t => t.prezzo_su_richiesta === true).length;
    const prezzoFalse = tours!.filter(t => t.prezzo_su_richiesta === false).length;
    const nullDest = tours!.filter(t => !t.destination_id).length;
    const nullCover = tours!.filter(t => !t.cover_image_url).length;
    const nullDurata = tours!.filter(t => !t.durata_notti).length;
    const nullVoli = tours!.filter(t => !t.tipo_voli).length;
    const nullPdf = tours!.filter(t => !t.programma_pdf_url).length;

    stat("Missing a_partire_da (price)", nullPrice, total);
    statGood("prezzo_su_richiesta = true", prezzoTrue);
    statGood("prezzo_su_richiesta = false", prezzoFalse);
    stat("Missing destination_id", nullDest, total);
    stat("Missing cover_image_url", nullCover, total);
    stat("Missing durata_notti", nullDurata, total);
    stat("Missing tipo_voli", nullVoli, total);
    stat("Missing programma_pdf_url", nullPdf, total);

    // Count sub-table rows per tour
    subHeader("Tour Sub-Table Counts");

    const tourIds = tours!.map(t => t.id);

    // Itinerary days
    const { data: idays } = await supabase.from("tour_itinerary_days").select("tour_id").in("tour_id", tourIds);
    const idaysByTour = new Map<string, number>();
    for (const r of (idays || [])) {
      idaysByTour.set(r.tour_id, (idaysByTour.get(r.tour_id) || 0) + 1);
    }

    // Departures
    const { data: deps } = await supabase.from("tour_departures").select("tour_id").in("tour_id", tourIds);
    const depsByTour = new Map<string, number>();
    for (const r of (deps || [])) {
      depsByTour.set(r.tour_id, (depsByTour.get(r.tour_id) || 0) + 1);
    }

    // Hotels
    const { data: hotels } = await supabase.from("tour_hotels").select("tour_id").in("tour_id", tourIds);
    const hotelsByTour = new Map<string, number>();
    for (const r of (hotels || [])) {
      hotelsByTour.set(r.tour_id, (hotelsByTour.get(r.tour_id) || 0) + 1);
    }

    // Locations
    const { data: locs } = await supabase.from("tour_locations").select("tour_id").in("tour_id", tourIds);
    const locsByTour = new Map<string, number>();
    for (const r of (locs || [])) {
      locsByTour.set(r.tour_id, (locsByTour.get(r.tour_id) || 0) + 1);
    }

    // Gallery
    const { data: gallery } = await supabase.from("tour_gallery").select("tour_id").in("tour_id", tourIds);
    const galleryByTour = new Map<string, number>();
    for (const r of (gallery || [])) {
      galleryByTour.set(r.tour_id, (galleryByTour.get(r.tour_id) || 0) + 1);
    }

    // Inclusions
    const { data: incls } = await supabase.from("tour_inclusions").select("tour_id").in("tour_id", tourIds);
    const inclsByTour = new Map<string, number>();
    for (const r of (incls || [])) {
      inclsByTour.set(r.tour_id, (inclsByTour.get(r.tour_id) || 0) + 1);
    }

    // Supplements
    const { data: supps } = await supabase.from("tour_supplements").select("tour_id").in("tour_id", tourIds);
    const suppsByTour = new Map<string, number>();
    for (const r of (supps || [])) {
      suppsByTour.set(r.tour_id, (suppsByTour.get(r.tour_id) || 0) + 1);
    }

    // Terms
    const { data: terms } = await supabase.from("tour_terms").select("tour_id").in("tour_id", tourIds);
    const termsByTour = new Map<string, number>();
    for (const r of (terms || [])) {
      termsByTour.set(r.tour_id, (termsByTour.get(r.tour_id) || 0) + 1);
    }

    // Penalties
    const { data: pens } = await supabase.from("tour_penalties").select("tour_id").in("tour_id", tourIds);
    const pensByTour = new Map<string, number>();
    for (const r of (pens || [])) {
      pensByTour.set(r.tour_id, (pensByTour.get(r.tour_id) || 0) + 1);
    }

    // Optional excursions
    const { data: excursions } = await supabase.from("tour_optional_excursions").select("tour_id").in("tour_id", tourIds);
    const excByTour = new Map<string, number>();
    for (const r of (excursions || [])) {
      excByTour.set(r.tour_id, (excByTour.get(r.tour_id) || 0) + 1);
    }

    // Summary stats
    const zeroIdays = tours!.filter(t => !idaysByTour.get(t.id)).length;
    const zeroDeps = tours!.filter(t => !depsByTour.get(t.id)).length;
    const zeroHotels = tours!.filter(t => !hotelsByTour.get(t.id)).length;
    const zeroLocs = tours!.filter(t => !locsByTour.get(t.id)).length;
    const zeroGallery = tours!.filter(t => !galleryByTour.get(t.id)).length;
    const zeroIncls = tours!.filter(t => !inclsByTour.get(t.id)).length;

    stat("Tours with 0 itinerary_days", zeroIdays, total);
    stat("Tours with 0 departures", zeroDeps, total);
    stat("Tours with 0 hotels", zeroHotels, total);
    stat("Tours with 0 locations", zeroLocs, total);
    stat("Tours with 0 gallery images", zeroGallery, total);
    stat("Tours with 0 inclusions", zeroIncls, total);

    // Detailed table
    subHeader("Tour Details Table");
    console.log(
      `  ${"Title".padEnd(40)} ${"Price".padEnd(18)} ${"P.Req".padEnd(6)} ${"Dest".padEnd(6)} ${"Dur".padEnd(5)} ${"Itin".padEnd(5)} ${"Deps".padEnd(5)} ${"Htls".padEnd(5)} ${"Locs".padEnd(5)} ${"Gal".padEnd(5)} ${"Incl".padEnd(5)} ${"Supp".padEnd(5)} ${"Term".padEnd(5)} ${"Pen".padEnd(5)} ${"Exc".padEnd(5)}`
    );
    console.log(`  ${"-".repeat(135)}`);
    for (const t of tours!) {
      const title = (t.title || "").substring(0, 38).padEnd(40);
      const price = (t.a_partire_da || "NULL").substring(0, 16).padEnd(18);
      const preq = t.prezzo_su_richiesta ? "YES" : "NO";
      const dest = t.destination_id ? "YES" : `${c.red}NO${c.reset} `;
      const dur = (t.durata_notti || `${c.red}--${c.reset}`).toString().padEnd(5);
      const itin = (idaysByTour.get(t.id) || 0).toString().padEnd(5);
      const departures = (depsByTour.get(t.id) || 0).toString().padEnd(5);
      const htls = (hotelsByTour.get(t.id) || 0).toString().padEnd(5);
      const loc = (locsByTour.get(t.id) || 0).toString().padEnd(5);
      const gal = (galleryByTour.get(t.id) || 0).toString().padEnd(5);
      const incl = (inclsByTour.get(t.id) || 0).toString().padEnd(5);
      const supp = (suppsByTour.get(t.id) || 0).toString().padEnd(5);
      const term = (termsByTour.get(t.id) || 0).toString().padEnd(5);
      const pen = (pensByTour.get(t.id) || 0).toString().padEnd(5);
      const exc = (excByTour.get(t.id) || 0).toString().padEnd(5);
      console.log(`  ${title} ${price} ${preq.padEnd(6)} ${dest.padEnd(6)} ${dur} ${itin} ${departures} ${htls} ${loc} ${gal} ${incl} ${supp} ${term} ${pen} ${exc}`);
    }
  }

  // ============================================================
  // 3. CRUISES
  // ============================================================
  header("3. CRUISES ANALYSIS");

  const { data: cruises, error: cruiseErr } = await supabase
    .from("cruises")
    .select("*")
    .order("title");

  if (cruiseErr) {
    console.error("Error fetching cruises:", cruiseErr.message);
  } else {
    const total = cruises!.length;
    statGood("Total cruises", total);

    const nullPrice = cruises!.filter(cr => !cr.a_partire_da).length;
    const prezzoTrue = cruises!.filter(cr => cr.prezzo_su_richiesta === true).length;
    const prezzoFalse = cruises!.filter(cr => cr.prezzo_su_richiesta === false).length;
    const nullShip = cruises!.filter(cr => !cr.ship_id).length;
    const nullDest = cruises!.filter(cr => !cr.destination_id).length;
    const nullCover = cruises!.filter(cr => !cr.cover_image_url).length;
    const nullDurata = cruises!.filter(cr => !cr.durata_notti).length;
    const nullDeck1 = cruises!.filter(cr => !cr.etichetta_primo_deck).length;
    const nullDeck2 = cruises!.filter(cr => !cr.etichetta_secondo_deck).length;
    const nullTipo = cruises!.filter(cr => !cr.tipo_crociera).length;
    const nullPdf = cruises!.filter(cr => !cr.programma_pdf_url).length;

    stat("Missing a_partire_da (price)", nullPrice, total);
    statGood("prezzo_su_richiesta = true", prezzoTrue);
    statGood("prezzo_su_richiesta = false", prezzoFalse);
    stat("Missing ship_id", nullShip, total);
    stat("Missing destination_id", nullDest, total);
    stat("Missing cover_image_url", nullCover, total);
    stat("Missing durata_notti", nullDurata, total);
    stat("Missing tipo_crociera", nullTipo, total);
    stat("Missing etichetta_primo_deck", nullDeck1, total);
    stat("Missing etichetta_secondo_deck", nullDeck2, total);
    stat("Missing programma_pdf_url", nullPdf, total);

    // Count sub-table rows per cruise
    const cruiseIds = cruises!.map(cr => cr.id);

    const { data: cIdays } = await supabase.from("cruise_itinerary_days").select("cruise_id").in("cruise_id", cruiseIds);
    const cIdaysByCruise = new Map<string, number>();
    for (const r of (cIdays || [])) {
      cIdaysByCruise.set(r.cruise_id, (cIdaysByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cDeps } = await supabase.from("cruise_departures").select("cruise_id").in("cruise_id", cruiseIds);
    const cDepsByCruise = new Map<string, number>();
    for (const r of (cDeps || [])) {
      cDepsByCruise.set(r.cruise_id, (cDepsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cCabins } = await supabase.from("cruise_cabins").select("cruise_id").in("cruise_id", cruiseIds);
    const cCabinsByCruise = new Map<string, number>();
    for (const r of (cCabins || [])) {
      cCabinsByCruise.set(r.cruise_id, (cCabinsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cLocs } = await supabase.from("cruise_locations").select("cruise_id").in("cruise_id", cruiseIds);
    const cLocsByCruise = new Map<string, number>();
    for (const r of (cLocs || [])) {
      cLocsByCruise.set(r.cruise_id, (cLocsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cGallery } = await supabase.from("cruise_gallery").select("cruise_id").in("cruise_id", cruiseIds);
    const cGalleryByCruise = new Map<string, number>();
    for (const r of (cGallery || [])) {
      cGalleryByCruise.set(r.cruise_id, (cGalleryByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cIncls } = await supabase.from("cruise_inclusions").select("cruise_id").in("cruise_id", cruiseIds);
    const cInclsByCruise = new Map<string, number>();
    for (const r of (cIncls || [])) {
      cInclsByCruise.set(r.cruise_id, (cInclsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cSupps } = await supabase.from("cruise_supplements").select("cruise_id").in("cruise_id", cruiseIds);
    const cSuppsByCruise = new Map<string, number>();
    for (const r of (cSupps || [])) {
      cSuppsByCruise.set(r.cruise_id, (cSuppsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cTerms } = await supabase.from("cruise_terms").select("cruise_id").in("cruise_id", cruiseIds);
    const cTermsByCruise = new Map<string, number>();
    for (const r of (cTerms || [])) {
      cTermsByCruise.set(r.cruise_id, (cTermsByCruise.get(r.cruise_id) || 0) + 1);
    }

    const { data: cPens } = await supabase.from("cruise_penalties").select("cruise_id").in("cruise_id", cruiseIds);
    const cPensByCruise = new Map<string, number>();
    for (const r of (cPens || [])) {
      cPensByCruise.set(r.cruise_id, (cPensByCruise.get(r.cruise_id) || 0) + 1);
    }

    // Summary stats for cruises
    subHeader("Cruise Sub-Table Summary");
    const zeroCI = cruises!.filter(cr => !cIdaysByCruise.get(cr.id)).length;
    const zeroCD = cruises!.filter(cr => !cDepsByCruise.get(cr.id)).length;
    const zeroCCab = cruises!.filter(cr => !cCabinsByCruise.get(cr.id)).length;
    const zeroCL = cruises!.filter(cr => !cLocsByCruise.get(cr.id)).length;
    const zeroCG = cruises!.filter(cr => !cGalleryByCruise.get(cr.id)).length;
    const zeroCInc = cruises!.filter(cr => !cInclsByCruise.get(cr.id)).length;

    stat("Cruises with 0 itinerary_days", zeroCI, total);
    stat("Cruises with 0 departures", zeroCD, total);
    stat("Cruises with 0 cabins", zeroCCab, total);
    stat("Cruises with 0 locations", zeroCL, total);
    stat("Cruises with 0 gallery images", zeroCG, total);
    stat("Cruises with 0 inclusions", zeroCInc, total);

    // Detailed table
    subHeader("Cruise Details Table");
    console.log(
      `  ${"Title".padEnd(45)} ${"Price".padEnd(16)} ${"P.Req".padEnd(6)} ${"Ship".padEnd(6)} ${"Dest".padEnd(6)} ${"Dur".padEnd(5)} ${"Tipo".padEnd(6)} ${"Itin".padEnd(5)} ${"Deps".padEnd(5)} ${"Cab".padEnd(5)} ${"Locs".padEnd(5)} ${"Gal".padEnd(5)} ${"Incl".padEnd(5)} ${"Supp".padEnd(5)}`
    );
    console.log(`  ${"-".repeat(140)}`);
    for (const cr of cruises!) {
      const title = (cr.title || "").substring(0, 43).padEnd(45);
      const price = (cr.a_partire_da || "NULL").substring(0, 14).padEnd(16);
      const preq = cr.prezzo_su_richiesta ? "YES" : "NO";
      const ship = cr.ship_id ? "YES" : `${c.red}NO${c.reset} `;
      const dest = cr.destination_id ? "YES" : `${c.red}NO${c.reset} `;
      const dur = (cr.durata_notti || `${c.red}--${c.reset}`).toString().padEnd(5);
      const tipo = (cr.tipo_crociera || "NONE").substring(0, 4).padEnd(6);
      const itin = (cIdaysByCruise.get(cr.id) || 0).toString().padEnd(5);
      const departures = (cDepsByCruise.get(cr.id) || 0).toString().padEnd(5);
      const cab = (cCabinsByCruise.get(cr.id) || 0).toString().padEnd(5);
      const loc = (cLocsByCruise.get(cr.id) || 0).toString().padEnd(5);
      const gal = (cGalleryByCruise.get(cr.id) || 0).toString().padEnd(5);
      const incl = (cInclsByCruise.get(cr.id) || 0).toString().padEnd(5);
      const supp = (cSuppsByCruise.get(cr.id) || 0).toString().padEnd(5);
      console.log(`  ${title} ${price} ${preq.padEnd(6)} ${ship.padEnd(6)} ${dest.padEnd(6)} ${dur} ${tipo} ${itin} ${departures} ${cab} ${loc} ${gal} ${incl} ${supp}`);
    }
  }

  // ============================================================
  // 4. SHIPS
  // ============================================================
  header("4. SHIPS ANALYSIS");

  const { data: ships, error: shipErr } = await supabase
    .from("ships")
    .select("*")
    .order("name");

  if (shipErr) {
    console.error("Error fetching ships:", shipErr.message);
  } else {
    const total = ships!.length;
    statGood("Total ships", total);

    const nullCover = ships!.filter(s => !s.cover_image_url).length;
    const nullDesc = ships!.filter(s => !s.description).length;
    const nullCabDisp = ships!.filter(s => !s.cabine_disponibili).length;
    const nullServCab = ships!.filter(s => !s.servizi_cabine).length;
    const nullDeckPlan = ships!.filter(s => !s.piani_ponte_url).length;

    stat("Missing cover_image_url", nullCover, total);
    stat("Missing description", nullDesc, total);
    stat("Missing cabine_disponibili", nullCabDisp, total);
    stat("Missing servizi_cabine", nullServCab, total);
    stat("Missing piani_ponte_url (deck plan)", nullDeckPlan, total);

    // Sub-tables
    const shipIds = ships!.map(s => s.id);

    const { data: sSuitable } = await supabase.from("ship_suitable_for").select("ship_id").in("ship_id", shipIds);
    const sSuitableByShip = new Map<string, number>();
    for (const r of (sSuitable || [])) {
      sSuitableByShip.set(r.ship_id, (sSuitableByShip.get(r.ship_id) || 0) + 1);
    }

    const { data: sActivities } = await supabase.from("ship_activities").select("ship_id").in("ship_id", shipIds);
    const sActByShip = new Map<string, number>();
    for (const r of (sActivities || [])) {
      sActByShip.set(r.ship_id, (sActByShip.get(r.ship_id) || 0) + 1);
    }

    const { data: sServices } = await supabase.from("ship_services").select("ship_id").in("ship_id", shipIds);
    const sServByShip = new Map<string, number>();
    for (const r of (sServices || [])) {
      sServByShip.set(r.ship_id, (sServByShip.get(r.ship_id) || 0) + 1);
    }

    const { data: sGallery } = await supabase.from("ship_gallery").select("ship_id").in("ship_id", shipIds);
    const sGalByShip = new Map<string, number>();
    for (const r of (sGallery || [])) {
      sGalByShip.set(r.ship_id, (sGalByShip.get(r.ship_id) || 0) + 1);
    }

    const { data: sCabins } = await supabase.from("ship_cabin_details").select("ship_id").in("ship_id", shipIds);
    const sCabByShip = new Map<string, number>();
    for (const r of (sCabins || [])) {
      sCabByShip.set(r.ship_id, (sCabByShip.get(r.ship_id) || 0) + 1);
    }

    subHeader("Ship Sub-Table Summary");
    const zeroSuit = ships!.filter(s => !sSuitableByShip.get(s.id)).length;
    const zeroAct = ships!.filter(s => !sActByShip.get(s.id)).length;
    const zeroServ = ships!.filter(s => !sServByShip.get(s.id)).length;
    const zeroSGal = ships!.filter(s => !sGalByShip.get(s.id)).length;
    const zeroSCab = ships!.filter(s => !sCabByShip.get(s.id)).length;

    stat("Ships with 0 suitable_for entries", zeroSuit, total);
    stat("Ships with 0 activities", zeroAct, total);
    stat("Ships with 0 services", zeroServ, total);
    stat("Ships with 0 gallery images", zeroSGal, total);
    stat("Ships with 0 cabin_details", zeroSCab, total);

    subHeader("Ship Details Table");
    console.log(
      `  ${"Name".padEnd(30)} ${"Cover?".padEnd(8)} ${"DeckPlan?".padEnd(10)} ${"SuitFor".padEnd(8)} ${"Act".padEnd(5)} ${"Serv".padEnd(5)} ${"Gal".padEnd(5)} ${"Cab".padEnd(5)}`
    );
    console.log(`  ${"-".repeat(76)}`);
    for (const s of ships!) {
      const name = (s.name || "").substring(0, 28).padEnd(30);
      const cover = s.cover_image_url ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`;
      const deck = s.piani_ponte_url ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`;
      const suit = (sSuitableByShip.get(s.id) || 0).toString().padEnd(8);
      const act = (sActByShip.get(s.id) || 0).toString().padEnd(5);
      const serv = (sServByShip.get(s.id) || 0).toString().padEnd(5);
      const gal = (sGalByShip.get(s.id) || 0).toString().padEnd(5);
      const cab = (sCabByShip.get(s.id) || 0).toString().padEnd(5);
      console.log(`  ${name} ${cover.padEnd(8 + 9)} ${deck.padEnd(10 + 9)} ${suit} ${act} ${serv} ${gal} ${cab}`);
    }
  }

  // ============================================================
  // 5. BLOG
  // ============================================================
  header("5. BLOG ANALYSIS");

  const { data: blogPosts, error: blogErr } = await supabase
    .from("blog_posts")
    .select("*")
    .order("title");

  if (blogErr) {
    console.error("Error fetching blog posts:", blogErr.message);
  } else {
    const total = blogPosts!.length;
    statGood("Total blog posts", total);

    const nullCover = blogPosts!.filter(b => !b.cover_image_url).length;
    const nullContent = blogPosts!.filter(b => !b.content).length;
    const nullExcerpt = blogPosts!.filter(b => !b.excerpt).length;
    const nullCategory = blogPosts!.filter(b => !b.category_id).length;

    stat("Missing cover_image_url", nullCover, total);
    stat("Missing content", nullContent, total);
    stat("Missing excerpt", nullExcerpt, total);
    stat("Missing category_id", nullCategory, total);
  }

  // ============================================================
  // 6. XML SOURCE CROSS-REFERENCE
  // ============================================================
  header("6. XML SOURCE CROSS-REFERENCE");

  console.log(`  Reading and parsing original XML file...`);
  let xmlItems: WPItem[];
  try {
    const xml = readFileSync(XML_PATH, "utf-8");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => name === "item" || name === "wp:postmeta" || name === "category",
      processEntities: true,
      htmlEntities: true,
      trimValues: true,
    });
    const parsed = parser.parse(xml);
    xmlItems = parsed.rss.channel.item || [];
    statGood("XML items parsed", xmlItems.length);
  } catch (e) {
    console.error("  Failed to parse XML:", e);
    return;
  }

  // Build attachment map for URL resolution
  const attachmentMap = new Map<number, string>();
  for (const item of xmlItems) {
    if (item["wp:post_type"] === "attachment" && item["wp:attachment_url"]) {
      attachmentMap.set(Number(item["wp:post_id"]), String(item["wp:attachment_url"]));
    }
  }
  statGood("Attachments in XML", attachmentMap.size);

  // Find tours/cruises with missing data in Supabase and check XML source
  const wpTours = xmlItems.filter(i => i["wp:post_type"] === "tours" && i["wp:status"] === "publish");
  const wpCruises = xmlItems.filter(i => i["wp:post_type"] === "crociere" && i["wp:status"] === "publish");

  subHeader("XML vs Supabase: Tours with missing data");

  // Check a selection of tours that have issues in Supabase
  const problematicTours = tours?.filter(t =>
    !t.a_partire_da || !t.destination_id || !t.durata_notti || !t.cover_image_url
  ) || [];

  if (problematicTours.length === 0) {
    console.log(`  ${c.green}No tours with critical missing data found.${c.reset}`);
  } else {
    console.log(`  Found ${problematicTours.length} tours with missing data. Checking XML source...\n`);

    for (const dbTour of problematicTours.slice(0, 10)) {
      const xmlTour = wpTours.find(wp => String(wp["wp:post_name"]) === dbTour.slug);
      if (!xmlTour) {
        console.log(`  ${c.red}[MISSING IN XML]${c.reset} Tour "${dbTour.title}" (slug: ${dbTour.slug})`);
        continue;
      }

      const meta = getMetaMap(xmlTour);
      const allMeta = xmlTour["wp:postmeta"];
      const entries = Array.isArray(allMeta) ? allMeta : [allMeta].filter(Boolean);
      const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
      const thumbId = thumbEntry ? String(thumbEntry["wp:meta_value"]) : null;
      const thumbUrl = thumbId && /^\d+$/.test(thumbId) ? attachmentMap.get(parseInt(thumbId, 10)) : thumbId;

      console.log(`  ${c.bold}Tour: "${dbTour.title}"${c.reset} (slug: ${dbTour.slug})`);
      console.log(`    DB a_partire_da: ${dbTour.a_partire_da || c.red + "NULL" + c.reset}  |  XML: ${meta.a_partire_da || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB destination_id: ${dbTour.destination_id ? "SET" : c.red + "NULL" + c.reset}  |  (XML has no direct dest field - matched by keywords)`);
      console.log(`    DB durata_notti: ${dbTour.durata_notti || c.red + "NULL" + c.reset}  |  XML durata: ${meta.durata || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB cover_image_url: ${dbTour.cover_image_url ? "SET" : c.red + "NULL" + c.reset}  |  XML _thumbnail_id: ${thumbUrl || c.red + "NO THUMB" + c.reset}`);
      console.log(`    DB prezzo_su_richiesta: ${dbTour.prezzo_su_richiesta}  |  XML: ${meta.prezzo_su_richiesta || "0"}`);
      console.log(`    DB tipo_voli: ${dbTour.tipo_voli || c.red + "NULL" + c.reset}  |  XML: ${meta.tipo_voli || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB programma_pdf: ${dbTour.programma_pdf_url ? "SET" : c.red + "NULL" + c.reset}  |  XML d_programma: ${meta.d_programma || c.red + "NOT IN XML" + c.reset}`);

      // Check sub-table data in XML
      const xmlLocCount = parseInt(meta.localita || "0", 10);
      const xmlProgCount = parseInt(meta.programma || "0", 10);
      const xmlAlbCount = parseInt(meta.alberghi || "0", 10);
      const xmlDepCount = parseInt(meta.calendario_partenze || "0", 10);
      const xmlInclCount = parseInt(meta.included || "0", 10);
      const xmlNotInclCount = parseInt(meta.not_included || "0", 10);
      const xmlGalleryIds = phpUnserializeArray(meta.gallery || "");

      console.log(`    XML sub-data: localita=${xmlLocCount}, programma=${xmlProgCount}, alberghi=${xmlAlbCount}, departures=${xmlDepCount}, included=${xmlInclCount}, not_included=${xmlNotInclCount}, gallery=${xmlGalleryIds.length}`);
      console.log("");
    }
  }

  subHeader("XML vs Supabase: Cruises with missing data");

  const problematicCruises = cruises?.filter(cr =>
    !cr.a_partire_da || !cr.ship_id || !cr.destination_id || !cr.durata_notti || !cr.cover_image_url
  ) || [];

  if (problematicCruises.length === 0) {
    console.log(`  ${c.green}No cruises with critical missing data found.${c.reset}`);
  } else {
    console.log(`  Found ${problematicCruises.length} cruises with missing data. Checking XML source...\n`);

    for (const dbCruise of problematicCruises.slice(0, 10)) {
      const xmlCruise = wpCruises.find(wp => String(wp["wp:post_name"]) === dbCruise.slug);
      if (!xmlCruise) {
        console.log(`  ${c.red}[MISSING IN XML]${c.reset} Cruise "${dbCruise.title}" (slug: ${dbCruise.slug})`);
        continue;
      }

      const meta = getMetaMap(xmlCruise);
      const allMeta = xmlCruise["wp:postmeta"];
      const entries = Array.isArray(allMeta) ? allMeta : [allMeta].filter(Boolean);
      const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
      const thumbId = thumbEntry ? String(thumbEntry["wp:meta_value"]) : null;
      const thumbUrl = thumbId && /^\d+$/.test(thumbId) ? attachmentMap.get(parseInt(thumbId, 10)) : thumbId;

      console.log(`  ${c.bold}Cruise: "${dbCruise.title}"${c.reset} (slug: ${dbCruise.slug})`);
      console.log(`    DB a_partire_da: ${dbCruise.a_partire_da || c.red + "NULL" + c.reset}  |  XML: ${meta.a_partire_da || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB ship_id: ${dbCruise.ship_id ? "SET" : c.red + "NULL" + c.reset}  |  (matched by ship name in title)`);
      console.log(`    DB destination_id: ${dbCruise.destination_id ? "SET" : c.red + "NULL" + c.reset}  |  (matched by keywords)`);
      console.log(`    DB durata_notti: ${dbCruise.durata_notti || c.red + "NULL" + c.reset}  |  XML: ${meta.durata_notti || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB cover_image_url: ${dbCruise.cover_image_url ? "SET" : c.red + "NULL" + c.reset}  |  XML _thumbnail_id: ${thumbUrl || c.red + "NO THUMB" + c.reset}`);
      console.log(`    DB tipo_crociera: ${dbCruise.tipo_crociera || c.red + "NULL" + c.reset}  |  XML: ${meta.tipo_crociera || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB etichetta_primo_deck: ${dbCruise.etichetta_primo_deck || c.red + "NULL" + c.reset}  |  XML: ${meta.etichetta_primo_deck || c.red + "NOT IN XML" + c.reset}`);
      console.log(`    DB etichetta_secondo_deck: ${dbCruise.etichetta_secondo_deck || c.red + "NULL" + c.reset}  |  XML: ${meta.etichetta_secondo_deck || c.red + "NOT IN XML" + c.reset}`);

      const xmlLocCount = parseInt(meta.localita || "0", 10);
      const xmlProgCount = parseInt(meta.programma || "0", 10);
      const xmlAlbCount = parseInt(meta.alberghi || "0", 10);
      const xmlDepCount = parseInt(meta.calendario_partenze || "0", 10);
      const xmlInclCount = parseInt(meta.included || "0", 10);
      const xmlNotInclCount = parseInt(meta.not_included || "0", 10);
      const xmlGalleryIds = phpUnserializeArray(meta.gallery || "");

      console.log(`    XML sub-data: localita=${xmlLocCount}, programma=${xmlProgCount}, alberghi=${xmlAlbCount}, departures=${xmlDepCount}, included=${xmlInclCount}, not_included=${xmlNotInclCount}, gallery=${xmlGalleryIds.length}`);
      console.log("");
    }
  }

  // ============================================================
  // 7. OVERALL SUMMARY
  // ============================================================
  header("7. OVERALL SUMMARY");

  const totalDest = destinations?.length || 0;
  const totalTours = tours?.length || 0;
  const totalCruises = cruises?.length || 0;
  const totalShips = ships?.length || 0;
  const totalBlog = blogPosts?.length || 0;

  console.log(`  ${c.bold}Content in Supabase:${c.reset}`);
  console.log(`    Destinations: ${totalDest}    (XML published: ${xmlItems.filter(i => i["wp:post_type"] === "destinazioni" && i["wp:status"] === "publish").length})`);
  console.log(`    Tours:        ${totalTours}    (XML published: ${wpTours.length})`);
  console.log(`    Cruises:      ${totalCruises}    (XML published: ${wpCruises.length})`);
  console.log(`    Ships:        ${totalShips}    (XML published: ${xmlItems.filter(i => i["wp:post_type"] === "imbarcazioni" && i["wp:status"] === "publish").length})`);
  console.log(`    Blog posts:   ${totalBlog}    (XML published: ${xmlItems.filter(i => i["wp:post_type"] === "post" && i["wp:status"] === "publish").length})`);

  console.log(`\n  ${c.bold}Key Issues:${c.reset}`);

  const issues: string[] = [];
  if (tours) {
    const noPrice = tours.filter(t => !t.a_partire_da && !t.prezzo_su_richiesta).length;
    if (noPrice > 0) issues.push(`${noPrice} tours have no price AND prezzo_su_richiesta=false`);
    const noDest = tours.filter(t => !t.destination_id).length;
    if (noDest > 0) issues.push(`${noDest} tours have no destination_id`);
    const noCover = tours.filter(t => !t.cover_image_url).length;
    if (noCover > 0) issues.push(`${noCover} tours have no cover image`);
  }
  if (cruises) {
    const noShip = cruises.filter(cr => !cr.ship_id).length;
    if (noShip > 0) issues.push(`${noShip} cruises have no ship_id`);
    const noDest = cruises.filter(cr => !cr.destination_id).length;
    if (noDest > 0) issues.push(`${noDest} cruises have no destination_id`);
    const noCover = cruises.filter(cr => !cr.cover_image_url).length;
    if (noCover > 0) issues.push(`${noCover} cruises have no cover image`);
  }
  if (destinations) {
    const noCover = destinations.filter(d => !d.cover_image_url).length;
    if (noCover > 0) issues.push(`${noCover} destinations have no cover image`);
  }
  if (ships) {
    const noCover = ships.filter(s => !s.cover_image_url).length;
    if (noCover > 0) issues.push(`${noCover} ships have no cover image`);
  }

  if (issues.length === 0) {
    console.log(`    ${c.green}No critical issues detected!${c.reset}`);
  } else {
    for (const issue of issues) {
      console.log(`    ${c.red}* ${issue}${c.reset}`);
    }
  }

  // Check if the meta key filter (skipping _ prefix) is hiding thumbnail IDs
  subHeader("Meta Key Analysis: Are underscore-prefixed keys being skipped?");
  console.log(`  The migrate-wp.ts script's getMetaMap() function skips keys starting with "_".`);
  console.log(`  However, _thumbnail_id is accessed separately via a special lookup.`);
  console.log(`  Let's check a few XML items to see if this is correct...\n`);

  const sampleTour = wpTours[0];
  if (sampleTour) {
    const allMetaEntries = Array.isArray(sampleTour["wp:postmeta"]) ? sampleTour["wp:postmeta"] : [sampleTour["wp:postmeta"]].filter(Boolean);
    const underscoreKeys = allMetaEntries
      .filter(m => String(m["wp:meta_key"]).startsWith("_"))
      .map(m => String(m["wp:meta_key"]));
    const uniqueUnderscoreKeys = [...new Set(underscoreKeys)];
    console.log(`  Sample tour "${sampleTour.title}" has ${uniqueUnderscoreKeys.length} underscore-prefixed meta keys:`);
    for (const key of uniqueUnderscoreKeys.slice(0, 15)) {
      console.log(`    ${key}`);
    }
    if (uniqueUnderscoreKeys.length > 15) {
      console.log(`    ... and ${uniqueUnderscoreKeys.length - 15} more`);
    }
  }

  console.log(`\n${c.bold}${c.green}Diagnostic complete.${c.reset}\n`);
}

main().catch((err) => {
  console.error("Diagnostic failed:", err);
  process.exit(1);
});
