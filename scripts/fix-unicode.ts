/**
 * MishaTravel - Fix Unicode Escapes, HTML Entities & WordPress Classes in DB
 *
 * The WordPress migration left behind:
 * - Literal \uXXXX sequences instead of actual Unicode characters
 * - HTML entities (&amp; etc.) in plain-text fields
 * - WordPress CSS classes (class="p1") in HTML content
 *
 * This script scans all text columns in relevant tables and fixes them.
 *
 * Usage:
 *   npx tsx scripts/fix-unicode.ts            # Fix all tables
 *   npx tsx scripts/fix-unicode.ts --dry-run  # Preview changes without writing
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

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

const DRY_RUN = process.argv.includes("--dry-run");

// ============================================================
// COLORS & LOGGING
// ============================================================
const c = {
  reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", bold: "\x1b[1m", dim: "\x1b[2m",
};
function log(msg: string) { console.log(`${c.cyan}[FIX-UNICODE]${c.reset} ${msg}`); }
function logOk(msg: string) { console.log(`${c.green}  ✓${c.reset} ${msg}`); }
function logWarn(msg: string) { console.log(`${c.yellow}  ⚠${c.reset} ${msg}`); }
function logErr(msg: string) { console.log(`${c.red}  ✗${c.reset} ${msg}`); }

// ============================================================
// Tables and their text columns to scan
// ============================================================
interface TableConfig {
  table: string;
  columns: string[];
}

const TABLES: TableConfig[] = [
  { table: "tours", columns: ["title", "content", "note_importanti", "nota_penali"] },
  { table: "cruises", columns: ["title", "content", "note_importanti", "nota_penali"] },
  { table: "destinations", columns: ["name", "description"] },
  { table: "tour_itinerary_days", columns: ["localita", "descrizione"] },
  { table: "cruise_itinerary_days", columns: ["localita", "descrizione"] },
  { table: "tour_supplements", columns: ["titolo", "prezzo"] },
  { table: "cruise_supplements", columns: ["titolo", "prezzo"] },
  { table: "tour_departures", columns: ["from_city", "prezzo_3_stelle", "prezzo_4_stelle"] },
  { table: "cruise_departures", columns: ["from_city", "prezzo_main_deck", "prezzo_middle_deck", "prezzo_superior_deck"] },
  { table: "tour_optional_excursions", columns: ["titolo", "descrizione", "prezzo"] },
  { table: "tour_inclusions", columns: ["titolo"] },
  { table: "cruise_inclusions", columns: ["titolo"] },
  { table: "tour_terms", columns: ["titolo"] },
  { table: "cruise_terms", columns: ["titolo"] },
  { table: "tour_penalties", columns: ["titolo"] },
  { table: "cruise_penalties", columns: ["titolo"] },
  { table: "tour_hotels", columns: ["localita", "nome_albergo"] },
  { table: "cruise_cabins", columns: ["localita", "tipologia_camera", "ponte"] },
  { table: "blog_posts", columns: ["title", "content", "excerpt"] },
  { table: "ships", columns: ["name", "description"] },
  { table: "tour_locations", columns: ["nome"] },
  { table: "cruise_locations", columns: ["nome"] },
  { table: "tour_gallery", columns: ["caption"] },
  { table: "cruise_gallery", columns: ["caption"] },
];

// ============================================================
// Unicode fix logic
// ============================================================

/**
 * Replace literal \uXXXX sequences with actual Unicode characters.
 */
function fixUnicodeEscapes(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

/**
 * Decode common HTML entities that shouldn't be in plain-text DB fields.
 */
function fixHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Strip WordPress CSS classes from HTML content (e.g. class="p1").
 * Keeps the tags but removes class attributes.
 */
function stripWpClasses(text: string): string {
  return text.replace(/\s+class="[^"]*"/g, "");
}

function needsFix(text: string): boolean {
  return /\\u[0-9a-fA-F]{4}/.test(text) ||
    /&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/.test(text) ||
    /class="p\d+"/.test(text);
}

function applyFixes(text: string): string {
  let result = fixUnicodeEscapes(text);
  result = fixHtmlEntities(result);
  result = stripWpClasses(result);
  return result;
}

// ============================================================
// Main
// ============================================================

async function fixTable(cfg: TableConfig): Promise<number> {
  const { table, columns } = cfg;

  // Fetch all rows (select id + text columns)
  const selectCols = ["id", ...columns].join(", ");
  const { data: rows, error } = await supabase.from(table).select(selectCols);

  if (error) {
    logErr(`Error reading ${table}: ${error.message}`);
    return 0;
  }

  if (!rows || rows.length === 0) {
    log(`${c.dim}${table}: no rows${c.reset}`);
    return 0;
  }

  let fixedCount = 0;

  for (const row of rows as unknown as Record<string, unknown>[]) {
    const updates: Record<string, string> = {};
    let hasChanges = false;

    for (const col of columns) {
      const val = row[col];
      if (typeof val === "string" && needsFix(val)) {
        const fixed = applyFixes(val);
        updates[col] = fixed;
        hasChanges = true;

        if (DRY_RUN) {
          // Show a snippet of the change
          const snippet = val.length > 80 ? val.substring(0, 80) + "..." : val;
          const fixedSnippet = fixed.length > 80 ? fixed.substring(0, 80) + "..." : fixed;
          logWarn(`${table}.${col} [id=${row.id}]: "${snippet}" → "${fixedSnippet}"`);
        }
      }
    }

    if (hasChanges) {
      fixedCount++;

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from(table)
          .update(updates)
          .eq("id", row.id);

        if (updateError) {
          logErr(`Error updating ${table} id=${row.id}: ${updateError.message}`);
        }
      }
    }
  }

  if (fixedCount > 0) {
    logOk(`${table}: ${fixedCount} row(s) ${DRY_RUN ? "would be" : ""} fixed`);
  } else {
    log(`${c.dim}${table}: clean (${rows.length} rows checked)${c.reset}`);
  }

  return fixedCount;
}

async function main() {
  log(`${c.bold}Unicode Escape Fixer${c.reset}`);
  if (DRY_RUN) logWarn("DRY RUN mode — no changes will be written\n");
  else log("LIVE mode — changes will be written to DB\n");

  let totalFixed = 0;

  for (const cfg of TABLES) {
    totalFixed += await fixTable(cfg);
  }

  console.log("");
  if (totalFixed > 0) {
    log(`${c.bold}${c.green}Total: ${totalFixed} row(s) ${DRY_RUN ? "would be" : "were"} fixed across all tables${c.reset}`);
  } else {
    log(`${c.bold}${c.green}All clean! No unicode escape sequences found.${c.reset}`);
  }
}

main().catch((err) => {
  logErr(`Fatal: ${err.message}`);
  process.exit(1);
});
