/**
 * Remove duplicate gallery images where the same filename appears twice
 * with different Supabase Storage paths.
 *
 * Usage:
 *   npx tsx scripts/deduplicate-gallery.ts            # Dry run
 *   npx tsx scripts/deduplicate-gallery.ts --fix       # Delete duplicates
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const FIX = process.argv.includes("--fix");

interface GalleryTable {
  name: string;
  parentCol: string;
}

const TABLES: GalleryTable[] = [
  { name: "tour_gallery", parentCol: "tour_id" },
  { name: "cruise_gallery", parentCol: "cruise_id" },
  { name: "ship_gallery", parentCol: "ship_id" },
];

function getFilename(url: string): string {
  return (url.split("/").pop() || url).split("?")[0];
}

async function deduplicateGallery(cfg: GalleryTable): Promise<number> {
  const { data: rows, error } = await supabase
    .from(cfg.name)
    .select("*")
    .order(cfg.parentCol)
    .order("sort_order");

  if (error || !rows) {
    console.error(`  ERROR reading ${cfg.name}: ${error?.message}`);
    return 0;
  }

  // Group by parentCol + filename
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const filename = getFilename(row.image_url);
    const key = `${row[cfg.parentCol]}|${filename}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(key, [row]);
    }
  }

  const idsToDelete: string[] = [];
  for (const [, group] of groups) {
    if (group.length > 1) {
      // Keep first (lowest sort_order), delete the rest
      idsToDelete.push(...group.slice(1).map((r) => r.id));
    }
  }

  if (idsToDelete.length === 0) return 0;

  if (FIX) {
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error: delErr } = await supabase
        .from(cfg.name)
        .delete()
        .in("id", batch);
      if (delErr) console.error(`  DELETE error: ${delErr.message}`);
    }

    // Fix sort_order gaps after deletion
    const { data: remaining } = await supabase
      .from(cfg.name)
      .select("id, " + cfg.parentCol + ", sort_order")
      .order(cfg.parentCol)
      .order("sort_order");

    if (remaining) {
      const byParent = new Map<string, string[]>();
      for (const r of remaining) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pid = (r as any)[cfg.parentCol] as string;
        const existing = byParent.get(pid);
        if (existing) {
          existing.push(r.id);
        } else {
          byParent.set(pid, [r.id]);
        }
      }

      for (const [, ids] of byParent) {
        for (let idx = 0; idx < ids.length; idx++) {
          await supabase.from(cfg.name).update({ sort_order: idx }).eq("id", ids[idx]);
        }
      }
    }
  }

  return idsToDelete.length;
}

async function main() {
  console.log(`\n=== Deduplicate Gallery Images (${FIX ? "FIX" : "DRY RUN"}) ===\n`);

  let total = 0;
  for (const cfg of TABLES) {
    const count = await deduplicateGallery(cfg);
    total += count;
    if (count > 0) {
      console.log(`  ${cfg.name}: ${count} duplicates ${FIX ? "DELETED" : "found"}`);
    }
  }

  if (total === 0) {
    console.log("  No gallery duplicates found!");
  } else {
    console.log(`\n  Total: ${total} duplicate gallery images ${FIX ? "deleted" : "found"}.`);
    if (!FIX) console.log("  Run with --fix to delete them.");
  }
  console.log("");
}

main().catch(console.error);
