/**
 * Deduplicate sub-table rows for tours, cruises and ships.
 * The WordPress migration ran multiple times, inserting duplicate rows.
 *
 * Usage:
 *   npx tsx scripts/deduplicate-subtables.ts           # Dry run (report only)
 *   npx tsx scripts/deduplicate-subtables.ts --fix      # Actually delete duplicates
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FIX = process.argv.includes("--fix");

interface TableConfig {
  name: string;
  parentCol: string;
  /** Columns that, combined with parentCol, define uniqueness */
  uniqueFields: string[];
}

const TABLES: TableConfig[] = [
  // Tours
  { name: "tour_gallery", parentCol: "tour_id", uniqueFields: ["image_url"] },
  { name: "tour_itinerary_days", parentCol: "tour_id", uniqueFields: ["numero_giorno", "localita"] },
  { name: "tour_departures", parentCol: "tour_id", uniqueFields: ["data_partenza", "from_city"] },
  { name: "tour_locations", parentCol: "tour_id", uniqueFields: ["nome"] },
  { name: "tour_hotels", parentCol: "tour_id", uniqueFields: ["localita", "nome_albergo"] },
  { name: "tour_supplements", parentCol: "tour_id", uniqueFields: ["titolo"] },
  { name: "tour_inclusions", parentCol: "tour_id", uniqueFields: ["titolo", "is_included"] },
  { name: "tour_terms", parentCol: "tour_id", uniqueFields: ["titolo"] },
  { name: "tour_penalties", parentCol: "tour_id", uniqueFields: ["titolo"] },
  { name: "tour_optional_excursions", parentCol: "tour_id", uniqueFields: ["titolo"] },
  // Cruises
  { name: "cruise_gallery", parentCol: "cruise_id", uniqueFields: ["image_url"] },
  { name: "cruise_itinerary_days", parentCol: "cruise_id", uniqueFields: ["numero_giorno", "localita"] },
  { name: "cruise_departures", parentCol: "cruise_id", uniqueFields: ["data_partenza", "from_city"] },
  { name: "cruise_locations", parentCol: "cruise_id", uniqueFields: ["nome"] },
  { name: "cruise_cabins", parentCol: "cruise_id", uniqueFields: ["localita", "tipologia_camera"] },
  { name: "cruise_supplements", parentCol: "cruise_id", uniqueFields: ["titolo"] },
  { name: "cruise_inclusions", parentCol: "cruise_id", uniqueFields: ["titolo", "is_included"] },
  { name: "cruise_terms", parentCol: "cruise_id", uniqueFields: ["titolo"] },
  { name: "cruise_penalties", parentCol: "cruise_id", uniqueFields: ["titolo"] },
  // Ships
  { name: "ship_gallery", parentCol: "ship_id", uniqueFields: ["image_url"] },
  { name: "ship_cabin_details", parentCol: "ship_id", uniqueFields: ["titolo"] },
  { name: "ship_services", parentCol: "ship_id", uniqueFields: ["testo"] },
  { name: "ship_activities", parentCol: "ship_id", uniqueFields: ["attivita"] },
  { name: "ship_suitable_for", parentCol: "ship_id", uniqueFields: ["testo"] },
];

async function deduplicateTable(cfg: TableConfig): Promise<number> {
  const { data: allRows, error } = await supabase
    .from(cfg.name)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`  ERROR reading ${cfg.name}: ${error.message}`);
    return 0;
  }
  if (!allRows || allRows.length === 0) return 0;

  // Group rows by (parentCol + uniqueFields) to find duplicates
  const groups = new Map<string, string[]>();
  for (const row of allRows) {
    const keyParts = [String(row[cfg.parentCol] ?? "")];
    for (const f of cfg.uniqueFields) {
      keyParts.push(String(row[f] ?? ""));
    }
    const key = keyParts.join("|");
    const existing = groups.get(key);
    if (existing) {
      existing.push(row.id);
    } else {
      groups.set(key, [row.id]);
    }
  }

  // Collect IDs to delete (keep first, delete rest)
  const idsToDelete: string[] = [];
  for (const [, ids] of groups) {
    if (ids.length > 1) {
      // Keep the first one (lowest sort_order / earliest created_at)
      idsToDelete.push(...ids.slice(1));
    }
  }

  if (idsToDelete.length === 0) return 0;

  if (FIX) {
    // Delete in batches of 100
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error: delError } = await supabase
        .from(cfg.name)
        .delete()
        .in("id", batch);
      if (delError) {
        console.error(`  ERROR deleting from ${cfg.name}: ${delError.message}`);
      }
    }
  }

  return idsToDelete.length;
}

async function main() {
  console.log(`\n=== Deduplicate Sub-Tables (${FIX ? "FIX MODE" : "DRY RUN"}) ===\n`);

  let totalDupes = 0;

  for (const cfg of TABLES) {
    const dupes = await deduplicateTable(cfg);
    totalDupes += dupes;
    if (dupes > 0) {
      console.log(`  ${cfg.name}: ${dupes} duplicates ${FIX ? "DELETED" : "found"}`);
    }
  }

  if (totalDupes === 0) {
    console.log("  No duplicates found! Database is clean.");
  } else {
    console.log(`\n  Total: ${totalDupes} duplicate rows ${FIX ? "deleted" : "found"}.`);
    if (!FIX) {
      console.log("  Run with --fix to delete them.");
    }
  }

  console.log("");
}

main().catch(console.error);
