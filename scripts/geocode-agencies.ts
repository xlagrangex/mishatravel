/**
 * Geocode agencies: resolve addresses via Nominatim → update latitude/longitude in Supabase.
 *
 * Usage:
 *   npx tsx scripts/geocode-agencies.ts          # dry-run
 *   npx tsx scripts/geocode-agencies.ts --live    # execute
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mdkftenubglujztifjqs.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ka2Z0ZW51YmdsdWp6dGlmanFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTcwNDkwMywiZXhwIjoyMDg3MjgwOTAzfQ.n3dk7UKKeWsMI36K5K0L-6jROsUTXJ8-4E9WxIcTrGc";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const DRY_RUN = !process.argv.includes("--live");

// ---------------------------------------------------------------------------
// Nominatim geocoding
// ---------------------------------------------------------------------------
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=it`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "it",
      "User-Agent": "MishaTravelMigration/1.0",
    },
  });
  if (!res.ok) return null;
  const data: NominatimResult[] = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n=== Geocode Agencies (${DRY_RUN ? "DRY-RUN" : "LIVE"}) ===\n`);

  // Fetch all active agencies
  const { data: agencies, error } = await supabase
    .from("agencies")
    .select("id, business_name, address, city, province, zip_code, latitude, longitude")
    .eq("status", "active")
    .order("business_name");

  if (error) {
    console.error("Error fetching agencies:", error.message);
    process.exit(1);
  }

  console.log(`Found ${agencies.length} active agencies.\n`);

  let updated = 0;
  for (const agency of agencies) {
    // Skip if already geocoded
    if (agency.latitude != null && agency.longitude != null) {
      console.log(`  [SKIP] ${agency.business_name} — already geocoded (${agency.latitude}, ${agency.longitude})`);
      continue;
    }

    // Build address string
    const parts = [agency.address, agency.zip_code, agency.city, agency.province, "Italia"].filter(Boolean);
    const fullAddress = parts.join(", ");
    console.log(`  Geocoding: ${agency.business_name} — "${fullAddress}"`);

    const coords = await geocode(fullAddress);
    if (!coords) {
      console.log(`    [WARN] No results for "${fullAddress}"`);
      continue;
    }

    console.log(`    Found: ${coords.lat}, ${coords.lng}`);

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from("agencies")
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq("id", agency.id);

      if (updateError) {
        console.log(`    [ERROR] ${updateError.message}`);
      } else {
        console.log(`    Updated in DB.`);
      }
    } else {
      console.log(`    [DRY-RUN] Would update.`);
    }

    updated++;
    // Nominatim rate limit: 1 req/sec
    await sleep(1100);
  }

  console.log(`\nDone. ${updated} agencies ${DRY_RUN ? "would be" : ""} geocoded.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
