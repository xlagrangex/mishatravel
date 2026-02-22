/**
 * MishaTravel - WordPress → Supabase Migration Script
 *
 * Parses the WordPress XML export + ACF field structure and imports
 * all content into the Supabase database with correct relationships.
 *
 * Usage:
 *   npx tsx scripts/migrate-wp.ts                # Import (skip existing)
 *   npx tsx scripts/migrate-wp.ts --force        # Delete all & re-import
 *   npx tsx scripts/migrate-wp.ts --dry-run      # Parse only, no DB writes
 *   npx tsx scripts/migrate-wp.ts --images       # Also migrate images to Supabase Storage
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const MIGRATE_IMAGES = process.argv.includes("--images");

const XML_PATH = resolve(__dirname, "..", "mishatravel.WordPress.2026-02-21.xml");

// ============================================================
// COLORS & LOGGING
// ============================================================
const c = {
  reset: "\x1b[0m", green: "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", bold: "\x1b[1m", dim: "\x1b[2m",
};
function log(msg: string) { console.log(`${c.cyan}[MIGRATE]${c.reset} ${msg}`); }
function logOk(msg: string) { console.log(`${c.green}  [OK]${c.reset} ${msg}`); }
function logWarn(msg: string) { console.log(`${c.yellow}[WARN]${c.reset} ${msg}`); }
function logErr(msg: string) { console.error(`${c.red}[ERR]${c.reset} ${msg}`); }
function logSection(msg: string) { console.log(`\n${c.bold}${c.cyan}═══ ${msg} ═══${c.reset}`); }
function logImage(current: number, total: number, msg: string) {
  console.log(`${c.dim}  [IMG ${current}/${total}]${c.reset} ${msg}`);
}

// ============================================================
// CONCURRENCY LIMITER
// ============================================================
const IMAGE_CONCURRENCY = 5;

/**
 * Runs an array of async task factories with a maximum concurrency limit.
 * Each factory is a zero-argument function that returns a Promise.
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(limit, tasks.length); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

// ============================================================
// IMAGE PROGRESS TRACKER
// ============================================================
let imageTotal = 0;
let imageCount = 0;

function resetImageProgress(total: number) {
  imageTotal = total;
  imageCount = 0;
}

function nextImageIndex(): number {
  return ++imageCount;
}

// ============================================================
// TYPES
// ============================================================
interface WPItem {
  title: string;
  link: string;
  "content:encoded": string;
  "excerpt:encoded": string;
  "wp:post_id": number;
  "wp:post_name": string;
  "wp:post_type": string;
  "wp:status": string;
  "wp:post_date": string;
  "wp:postmeta": { "wp:meta_key": string; "wp:meta_value": string }[] | { "wp:meta_key": string; "wp:meta_value": string };
  category?: { "@_domain": string; "@_nicename": string; "#text": string }[] | { "@_domain": string; "@_nicename": string; "#text": string };
  "wp:attachment_url"?: string;
}

interface MetaMap { [key: string]: string }

// ============================================================
// 1. PARSE XML
// ============================================================
function parseXML(): WPItem[] {
  log("Reading XML file...");
  const xml = readFileSync(XML_PATH, "utf-8");

  log("Parsing XML (this may take a moment)...");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "item" || name === "wp:postmeta" || name === "category",
    processEntities: true,
    htmlEntities: true,
    trimValues: true,
  });

  const parsed = parser.parse(xml);
  const items: WPItem[] = parsed.rss.channel.item || [];
  logOk(`Parsed ${items.length} items from XML`);
  return items;
}

// ============================================================
// 2. BUILD HELPER MAPS
// ============================================================
function getMetaMap(item: WPItem): MetaMap {
  const meta: MetaMap = {};
  const postmeta = item["wp:postmeta"];
  if (!postmeta) return meta;
  const entries = Array.isArray(postmeta) ? postmeta : [postmeta];
  for (const m of entries) {
    const key = String(m["wp:meta_key"] ?? "");
    const val = String(m["wp:meta_value"] ?? "");
    if (key && !key.startsWith("_")) {
      meta[key] = val;
    }
  }
  return meta;
}

function getCategories(item: WPItem, domain: string): string[] {
  if (!item.category) return [];
  const cats = Array.isArray(item.category) ? item.category : [item.category];
  return cats
    .filter((c) => c["@_domain"] === domain)
    .map((c) => String(c["#text"] || ""));
}

function buildAttachmentMap(items: WPItem[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const item of items) {
    if (item["wp:post_type"] === "attachment" && item["wp:attachment_url"]) {
      map.set(Number(item["wp:post_id"]), String(item["wp:attachment_url"]));
    }
  }
  logOk(`Built attachment map: ${map.size} media files`);
  return map;
}

// ============================================================
// 3. PHP SERIALIZED ARRAY PARSER (simple)
// ============================================================
function phpUnserializeArray(str: string): string[] {
  if (!str || !str.startsWith("a:")) return [];
  const values: string[] = [];
  // Match s:N:"value"; patterns
  const regex = /s:(\d+):"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    values.push(match[2]);
  }
  return values;
}

// ============================================================
// 4. ACF REPEATER EXTRACTOR
// ============================================================
function extractRepeater(meta: MetaMap, prefix: string, subFields: string[]): Record<string, string>[] {
  const count = parseInt(meta[prefix] || "0", 10);
  if (!count || isNaN(count)) return [];
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    const row: Record<string, string> = {};
    for (const field of subFields) {
      row[field] = meta[`${prefix}_${i}_${field}`] || "";
    }
    rows.push(row);
  }
  return rows;
}

function extractNestedRepeater(
  meta: MetaMap,
  prefix: string,
  parentFields: string[],
  nestedName: string,
  nestedFields: string[]
): { parent: Record<string, string>; children: Record<string, string>[] }[] {
  const count = parseInt(meta[prefix] || "0", 10);
  if (!count || isNaN(count)) return [];
  const results: { parent: Record<string, string>; children: Record<string, string>[] }[] = [];
  for (let i = 0; i < count; i++) {
    const parent: Record<string, string> = {};
    for (const f of parentFields) {
      parent[f] = meta[`${prefix}_${i}_${f}`] || "";
    }
    const childCount = parseInt(meta[`${prefix}_${i}_${nestedName}`] || "0", 10);
    const children: Record<string, string>[] = [];
    for (let j = 0; j < childCount; j++) {
      const child: Record<string, string> = {};
      for (const f of nestedFields) {
        child[f] = meta[`${prefix}_${i}_${nestedName}_${j}_${f}`] || "";
      }
      children.push(child);
    }
    results.push({ parent, children });
  }
  return results;
}

// ============================================================
// 5. DATE PARSER
// ============================================================
function parseWPDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // YYYYMMDD format (ACF date_picker)
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  // DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
  }
  return null;
}

// ============================================================
// 6. PRICE PARSER - normalize to numeric or null
// ============================================================
function parsePrice(val: string): number | null {
  if (!val || val.trim() === "") return null;
  // Replace comma with dot, remove spaces
  const cleaned = val.replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ============================================================
// 7. PENSIONE PARSER
// ============================================================
function parsePensione(val: string): string[] {
  if (!val) return ["completa"];
  // PHP serialized array
  if (val.startsWith("a:")) {
    const result = phpUnserializeArray(val);
    return result.length > 0 ? result : ["completa"];
  }
  // Plain value
  if (["no", "mezza", "completa"].includes(val)) return [val];
  return ["completa"];
}

// ============================================================
// 8. SAFE DB INSERT
// ============================================================
async function safeInsert(table: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  if (DRY_RUN) return null;
  const { data: result, error } = await supabase.from(table).insert(data).select();
  if (error) {
    logErr(`Insert into ${table} failed: ${error.message}`);
    return null;
  }
  return result;
}

async function safeUpsert(table: string, data: Record<string, unknown> | Record<string, unknown>[], onConflict: string) {
  if (DRY_RUN) return null;
  const { data: result, error } = await supabase.from(table).upsert(data, { onConflict }).select();
  if (error) {
    logErr(`Upsert into ${table} failed: ${error.message}`);
    return null;
  }
  return result;
}

// ============================================================
// 9. IMAGE MIGRATION HELPERS
// ============================================================
async function downloadAndUpload(wpUrl: string, bucket: string, path: string): Promise<string | null> {
  if (!wpUrl || DRY_RUN) return wpUrl || null;
  const idx = nextImageIndex();
  try {
    const resp = await fetch(wpUrl);
    if (!resp.ok) {
      logWarn(`Failed to download ${wpUrl}: ${resp.status}`);
      return wpUrl; // Keep WP URL as fallback
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    const contentType = resp.headers.get("content-type") || "image/jpeg";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      logWarn(`Upload failed for ${path}: ${error.message}`);
      return wpUrl;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    logImage(idx, imageTotal, `${bucket}/${path}`);
    return urlData.publicUrl;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logWarn(`Image migration failed for ${wpUrl}: ${msg}`);
    return wpUrl;
  }
}

async function resolveImageUrl(
  attachmentMap: Map<number, string>,
  wpIdOrUrl: string,
  bucket: string,
  folder: string
): Promise<string | null> {
  if (!wpIdOrUrl) return null;
  let url = wpIdOrUrl;
  // If it's a numeric WP attachment ID, resolve to URL
  if (/^\d+$/.test(wpIdOrUrl)) {
    const resolved = attachmentMap.get(parseInt(wpIdOrUrl, 10));
    if (!resolved) return null;
    url = resolved;
  }
  if (!url.startsWith("http")) return null;

  if (MIGRATE_IMAGES) {
    const filename = url.split("/").pop() || `img-${Date.now()}`;
    return downloadAndUpload(url, bucket, `${folder}/${filename}`);
  }
  return url;
}

// ============================================================
// 10. CLEAR EXISTING DATA
// ============================================================
async function clearExistingData() {
  if (!FORCE || DRY_RUN) return;
  logSection("CLEARING EXISTING DATA");

  const tables = [
    // Sub-tables first (FK constraints)
    "tour_optional_excursions", "tour_penalties", "tour_terms",
    "tour_inclusions", "tour_supplements", "tour_departures",
    "tour_hotels", "tour_itinerary_days", "tour_locations", "tour_gallery",
    "cruise_penalties", "cruise_terms", "cruise_inclusions",
    "cruise_supplements", "cruise_departures", "cruise_cabins",
    "cruise_itinerary_days", "cruise_locations", "cruise_gallery",
    "ship_cabin_details", "ship_gallery", "ship_services",
    "ship_activities", "ship_suitable_for",
    "blog_posts", "blog_categories",
    // Main tables
    "cruises", "tours", "ships", "destinations",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      logWarn(`Clear ${table}: ${error.message}`);
    } else {
      logOk(`Cleared ${table}`);
    }
  }
}

// ============================================================
// 11. COUNT TOTAL IMAGES (for progress tracking)
// ============================================================
function countTotalImages(items: WPItem[]): number {
  if (!MIGRATE_IMAGES) return 0;
  let count = 0;

  const attachmentMap = new Map<number, string>();
  for (const item of items) {
    if (item["wp:post_type"] === "attachment" && item["wp:attachment_url"]) {
      attachmentMap.set(Number(item["wp:post_id"]), String(item["wp:attachment_url"]));
    }
  }

  function hasThumb(item: WPItem): boolean {
    const entries = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]].filter(Boolean);
    const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
    if (thumbEntry) {
      const val = String(thumbEntry["wp:meta_value"]);
      if (/^\d+$/.test(val) && attachmentMap.has(parseInt(val, 10))) return true;
      if (val.startsWith("http")) return true;
    }
    return false;
  }

  // Destinations: 1 thumbnail each
  const destinations = items.filter(i => i["wp:post_type"] === "destinazioni" && i["wp:status"] === "publish");
  for (const item of destinations) {
    if (hasThumb(item)) count++;
  }

  // Ships: thumbnail + deck plan + gallery + cabin images
  const ships = items.filter(i => i["wp:post_type"] === "imbarcazioni" && i["wp:status"] === "publish");
  for (const item of ships) {
    const meta = getMetaMap(item);
    if (hasThumb(item)) count++;
    if (meta.piani_ponte) count++;
    count += phpUnserializeArray(meta.galleria || "").length;
    const cabine = extractRepeater(meta, "cabine_dettaglio", ["immagine_cabina"]);
    for (const cab of cabine) {
      if (cab.immagine_cabina) count++;
    }
  }

  // Tours: thumbnail + pdf + gallery
  const tours = items.filter(i => i["wp:post_type"] === "tours" && i["wp:status"] === "publish");
  for (const item of tours) {
    const meta = getMetaMap(item);
    if (hasThumb(item)) count++;
    if (meta.d_programma) count++;
    count += phpUnserializeArray(meta.gallery || "").length;
  }

  // Cruises: thumbnail + pdf + gallery
  const cruises = items.filter(i => i["wp:post_type"] === "crociere" && i["wp:status"] === "publish");
  for (const item of cruises) {
    const meta = getMetaMap(item);
    if (hasThumb(item)) count++;
    if (meta.programma_pdf) count++;
    count += phpUnserializeArray(meta.gallery || "").length;
  }

  // Blog: thumbnail each
  const blogPosts = items.filter(i => i["wp:post_type"] === "post" && i["wp:status"] === "publish");
  for (const item of blogPosts) {
    if (hasThumb(item)) count++;
  }

  return count;
}

// ============================================================
// 12. IMPORT DESTINATIONS
// ============================================================
async function importDestinations(
  items: WPItem[],
  attachmentMap: Map<number, string>
): Promise<Map<string, string>> {
  logSection("IMPORTING DESTINATIONS");
  const slugToId = new Map<string, string>();

  const destinations = items.filter(
    (i) => i["wp:post_type"] === "destinazioni" && i["wp:status"] === "publish"
  );
  log(`Found ${destinations.length} published destinations`);

  for (const item of destinations) {
    const meta = getMetaMap(item);
    const slug = String(item["wp:post_name"] || "");
    const title = String(item.title || "");
    const content = String(item["content:encoded"] || "");
    const coordinate = meta.coordinate || "";
    const macroAreas = getCategories(item, "destinazione");
    const macroArea = macroAreas[0] || "";
    const thumbnailId = meta._thumbnail_id || (getMetaMap({ ...item, "wp:postmeta": item["wp:postmeta"] } as WPItem))["_thumbnail_id"];

    // Get thumbnail from meta (need to also check underscore-prefixed keys)
    // NOTE: "destinations" bucket does not exist, so we use "general" bucket
    // with a "destinations/" subfolder prefix
    let coverUrl: string | null = null;
    const thumbMeta = item["wp:postmeta"];
    if (thumbMeta) {
      const entries = Array.isArray(thumbMeta) ? thumbMeta : [thumbMeta];
      const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
      if (thumbEntry) {
        coverUrl = await resolveImageUrl(
          attachmentMap,
          String(thumbEntry["wp:meta_value"]),
          "general",
          `destinations/${slug}`
        );
      }
    }

    if (DRY_RUN) {
      logOk(`[DRY] ${title} (${slug}) - ${macroArea} - coord: ${coordinate}`);
      slugToId.set(slug, `dry-${slug}`);
      continue;
    }

    const result = await safeUpsert("destinations", {
      name: title,
      slug,
      description: content || null,
      cover_image_url: coverUrl,
      coordinate: coordinate || null,
      macro_area: macroArea || null,
      status: "published",
    }, "slug");

    if (result?.[0]) {
      slugToId.set(slug, result[0].id);
      // Also map by name for tour matching
      slugToId.set(title.toLowerCase(), result[0].id);
      logOk(`${title} → ${result[0].id}`);
    }
  }

  logOk(`Imported ${slugToId.size} destinations`);
  return slugToId;
}

// ============================================================
// 13. IMPORT SHIPS
// ============================================================
async function importShips(
  items: WPItem[],
  attachmentMap: Map<number, string>
): Promise<Map<string, string>> {
  logSection("IMPORTING SHIPS");
  const nameToId = new Map<string, string>();

  const ships = items.filter(
    (i) => i["wp:post_type"] === "imbarcazioni" && i["wp:status"] === "publish"
  );
  log(`Found ${ships.length} published ships`);

  for (const item of ships) {
    const meta = getMetaMap(item);
    const slug = String(item["wp:post_name"] || "");
    const name = String(item.title || "");
    const description = String(item["content:encoded"] || "");

    // Thumbnail
    let coverUrl: string | null = null;
    const entries = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]].filter(Boolean);
    const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
    if (thumbEntry) {
      coverUrl = await resolveImageUrl(attachmentMap, String(thumbEntry["wp:meta_value"]), "ships", slug);
    }

    // Deck plan image
    const pianiPonteUrl = await resolveImageUrl(
      attachmentMap, meta.piani_ponte || "", "ships", `${slug}/deck-plan`
    );

    if (DRY_RUN) {
      logOk(`[DRY] ${name} (${slug})`);
      nameToId.set(name.toLowerCase(), `dry-${slug}`);
      continue;
    }

    const result = await safeUpsert("ships", {
      name,
      slug,
      description: description || null,
      cover_image_url: coverUrl,
      cabine_disponibili: meta.cabine_disponibili || null,
      servizi_cabine: meta.servizi_cabine || null,
      piani_ponte_url: pianiPonteUrl,
      status: "published",
    }, "slug");

    if (!result?.[0]) continue;
    const shipId = result[0].id;
    nameToId.set(name.toLowerCase(), shipId);
    logOk(`${name} → ${shipId}`);

    // Sub-tables
    // Suitable for
    const adattoPer = extractRepeater(meta, "adatto_per", ["testo"]);
    if (adattoPer.length) {
      await safeInsert("ship_suitable_for",
        adattoPer.map((r, i) => ({ ship_id: shipId, testo: r.testo, sort_order: i }))
      );
    }

    // Activities
    const attivita = extractRepeater(meta, "attivita", ["attivita"]);
    if (attivita.length) {
      await safeInsert("ship_activities",
        attivita.map((r, i) => ({ ship_id: shipId, attivita: r.attivita, sort_order: i }))
      );
    }

    // Services
    const servizi = extractRepeater(meta, "servizi", ["testo"]);
    if (servizi.length) {
      await safeInsert("ship_services",
        servizi.map((r, i) => ({ ship_id: shipId, testo: r.testo, sort_order: i }))
      );
    }

    // Gallery (with concurrency limiter)
    const galleryIds = phpUnserializeArray(meta.galleria || "");
    if (galleryIds.length) {
      const galleryTasks = galleryIds.map((gid, i) => () =>
        resolveImageUrl(attachmentMap, gid, "ships", `${slug}/gallery`).then(imgUrl => ({
          imgUrl, index: i,
        }))
      );
      const galleryResults = await runWithConcurrency(galleryTasks, IMAGE_CONCURRENCY);
      const galleryRows = galleryResults
        .filter(r => r.imgUrl)
        .map(r => ({ ship_id: shipId, image_url: r.imgUrl!, sort_order: r.index }));
      if (galleryRows.length) await safeInsert("ship_gallery", galleryRows);
    }

    // Cabin details (with concurrency limiter for images)
    const cabine = extractRepeater(meta, "cabine_dettaglio", ["titolo", "tipologia", "immagine_cabina", "descrizione"]);
    if (cabine.length) {
      const cabinTasks = cabine.map((cab, i) => async () => {
        const imgUrl = await resolveImageUrl(attachmentMap, cab.immagine_cabina, "ships", `${slug}/cabins`);
        return {
          ship_id: shipId,
          titolo: cab.titolo,
          tipologia: cab.tipologia || null,
          immagine_url: imgUrl,
          descrizione: cab.descrizione || null,
          sort_order: i,
        };
      });
      const cabinRows = await runWithConcurrency(cabinTasks, IMAGE_CONCURRENCY);
      await safeInsert("ship_cabin_details", cabinRows);
    }
  }

  logOk(`Imported ${nameToId.size} ships`);
  return nameToId;
}

// ============================================================
// 14. IMPORT TOURS
// ============================================================
async function importTours(
  items: WPItem[],
  attachmentMap: Map<number, string>,
  destinationMap: Map<string, string>
) {
  logSection("IMPORTING TOURS");

  const tours = items.filter(
    (i) => i["wp:post_type"] === "tours" && i["wp:status"] === "publish"
  );
  log(`Found ${tours.length} published tours`);

  let imported = 0;
  for (const item of tours) {
    const meta = getMetaMap(item);
    const slug = String(item["wp:post_name"] || "");
    const title = String(item.title || "");
    const content = String(item["content:encoded"] || "");

    // Try to match destination from locations or title
    const destinationId = matchDestination(meta, title, destinationMap);

    // Thumbnail
    let coverUrl: string | null = null;
    const entries = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]].filter(Boolean);
    const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
    if (thumbEntry) {
      coverUrl = await resolveImageUrl(attachmentMap, String(thumbEntry["wp:meta_value"]), "tours", slug);
    }

    // PDF
    const pdfUrl = await resolveImageUrl(attachmentMap, meta.d_programma || "", "tours", `${slug}/pdf`);

    // Pensione
    const pensione = parsePensione(meta.pensione || "");

    if (DRY_RUN) {
      logOk(`[DRY] ${title} (${slug}) - durata: ${meta.durata} - dest: ${destinationId ? "matched" : "none"}`);
      imported++;
      continue;
    }

    const result = await safeUpsert("tours", {
      title,
      slug,
      content: content || null,
      cover_image_url: coverUrl,
      destination_id: destinationId,
      a_partire_da: meta.a_partire_da || null,
      prezzo_su_richiesta: meta.prezzo_su_richiesta === "1",
      numero_persone: parseInt(meta.numero_persone || "30", 10) || 30,
      durata_notti: meta.durata || null,
      pensione: `{${pensione.join(",")}}`,
      tipo_voli: meta.tipo_voli || null,
      note_importanti: meta.note_importanti || null,
      nota_penali: meta.nota_penali || null,
      programma_pdf_url: pdfUrl,
      status: "published",
    }, "slug");

    if (!result?.[0]) continue;
    const tourId = result[0].id;
    logOk(`${title} → ${tourId}`);
    imported++;

    // --- Sub-tables ---

    // Locations
    const locations = extractRepeater(meta, "localita", ["nome", "coordinate"]);
    if (locations.length) {
      await safeInsert("tour_locations",
        locations.map((r, i) => ({
          tour_id: tourId, nome: r.nome, coordinate: r.coordinate || null, sort_order: i,
        }))
      );
    }

    // Itinerary days
    const programma = extractRepeater(meta, "programma", ["numero_giorno", "localita", "descrizione"]);
    if (programma.length) {
      await safeInsert("tour_itinerary_days",
        programma.map((r, i) => ({
          tour_id: tourId,
          numero_giorno: r.numero_giorno || null,
          localita: r.localita || null,
          descrizione: r.descrizione || null,
          sort_order: i,
        }))
      );
    }

    // Hotels (nested repeater: alberghi -> alberghi)
    const hotels = extractNestedRepeater(meta, "alberghi", ["localita"], "alberghi", ["nome_albergo", "stelle"]);
    if (hotels.length) {
      const hotelRows: Record<string, unknown>[] = [];
      let sortIdx = 0;
      for (const h of hotels) {
        for (const child of h.children) {
          hotelRows.push({
            tour_id: tourId,
            localita: h.parent.localita,
            nome_albergo: child.nome_albergo || null,
            stelle: parseInt(child.stelle, 10) || null,
            sort_order: sortIdx++,
          });
        }
        // If no children but has locality, still add the location
        if (h.children.length === 0 && h.parent.localita) {
          hotelRows.push({
            tour_id: tourId,
            localita: h.parent.localita,
            nome_albergo: null,
            stelle: null,
            sort_order: sortIdx++,
          });
        }
      }
      if (hotelRows.length) await safeInsert("tour_hotels", hotelRows);
    }

    // Departures
    const departures = extractRepeater(meta, "calendario_partenze", ["from", "data_partenza", "3_price", "4_price"]);
    if (departures.length) {
      await safeInsert("tour_departures",
        departures.map((r, i) => ({
          tour_id: tourId,
          from_city: r.from || null,
          data_partenza: parseWPDate(r.data_partenza),
          prezzo_3_stelle: parsePrice(r["3_price"]),
          prezzo_4_stelle: r["4_price"] || null,
          sort_order: i,
        }))
      );
    }

    // Supplements
    const supplements = extractRepeater(meta, "supplementi", ["titolo", "prezzo"]);
    if (supplements.length) {
      await safeInsert("tour_supplements",
        supplements.map((r, i) => ({
          tour_id: tourId, titolo: r.titolo, prezzo: r.prezzo || null, sort_order: i,
        }))
      );
    }

    // Inclusions (included + not_included in one table)
    const included = extractRepeater(meta, "included", ["titolo"]);
    const notIncluded = extractRepeater(meta, "not_included", ["titolo"]);
    const inclusionRows = [
      ...included.map((r, i) => ({
        tour_id: tourId, titolo: r.titolo, is_included: true, sort_order: i,
      })),
      ...notIncluded.map((r, i) => ({
        tour_id: tourId, titolo: r.titolo, is_included: false, sort_order: included.length + i,
      })),
    ];
    if (inclusionRows.length) await safeInsert("tour_inclusions", inclusionRows);

    // Terms
    const terms = extractRepeater(meta, "termini", ["titolo"]);
    if (terms.length) {
      await safeInsert("tour_terms",
        terms.map((r, i) => ({ tour_id: tourId, titolo: r.titolo, sort_order: i }))
      );
    }

    // Penalties
    const penalties = extractRepeater(meta, "penalty", ["titolo"]);
    if (penalties.length) {
      await safeInsert("tour_penalties",
        penalties.map((r, i) => ({ tour_id: tourId, titolo: r.titolo, sort_order: i }))
      );
    }

    // Gallery (with concurrency limiter)
    const galleryIds = phpUnserializeArray(meta.gallery || "");
    if (galleryIds.length) {
      const galleryTasks = galleryIds.map((gid, i) => () =>
        resolveImageUrl(attachmentMap, gid, "tours", `${slug}/gallery`).then(imgUrl => ({
          imgUrl, index: i,
        }))
      );
      const galleryResults = await runWithConcurrency(galleryTasks, IMAGE_CONCURRENCY);
      const galleryRows = galleryResults
        .filter(r => r.imgUrl)
        .map(r => ({ tour_id: tourId, image_url: r.imgUrl!, sort_order: r.index }));
      if (galleryRows.length) await safeInsert("tour_gallery", galleryRows);
    }

    // Optional excursions
    const extras = extractRepeater(meta, "programmi_extra", ["titolo", "descrizione", "prezzo"]);
    if (extras.length) {
      await safeInsert("tour_optional_excursions",
        extras.map((r, i) => ({
          tour_id: tourId,
          titolo: r.titolo,
          descrizione: r.descrizione || null,
          prezzo: parsePrice(r.prezzo),
          sort_order: i,
        }))
      );
    }
  }

  logOk(`Imported ${imported} tours`);
}

// ============================================================
// 15. IMPORT CRUISES
// ============================================================
async function importCruises(
  items: WPItem[],
  attachmentMap: Map<number, string>,
  destinationMap: Map<string, string>,
  shipMap: Map<string, string>
) {
  logSection("IMPORTING CRUISES");

  const cruises = items.filter(
    (i) => i["wp:post_type"] === "crociere" && i["wp:status"] === "publish"
  );
  log(`Found ${cruises.length} published cruises`);

  let imported = 0;
  for (const item of cruises) {
    const meta = getMetaMap(item);
    const slug = String(item["wp:post_name"] || "");
    const title = String(item.title || "");
    const content = String(item["content:encoded"] || "");

    // Match ship from title
    const shipId = matchShip(title, shipMap);
    // Match destination
    const destinationId = matchDestinationForCruise(meta, title, destinationMap);

    // Thumbnail
    let coverUrl: string | null = null;
    const entries = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]].filter(Boolean);
    const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
    if (thumbEntry) {
      coverUrl = await resolveImageUrl(attachmentMap, String(thumbEntry["wp:meta_value"]), "cruises", slug);
    }

    // PDF
    const pdfUrl = await resolveImageUrl(attachmentMap, meta.programma_pdf || "", "cruises", `${slug}/pdf`);

    const pensione = parsePensione(meta.pensione || "");

    // Validate tipo_crociera against enum
    const tipoCrociera = meta.tipo_crociera === "Crociera di Gruppo" ? "Crociera di Gruppo" :
                         meta.tipo_crociera === "Crociera" ? "Crociera" : null;

    if (DRY_RUN) {
      logOk(`[DRY] ${title} (${slug}) - ship: ${shipId ? "matched" : "none"} - dest: ${destinationId ? "matched" : "none"}`);
      imported++;
      continue;
    }

    const result = await safeUpsert("cruises", {
      title,
      slug,
      content: content || null,
      cover_image_url: coverUrl,
      ship_id: shipId,
      destination_id: destinationId,
      tipo_crociera: tipoCrociera,
      a_partire_da: meta.a_partire_da || null,
      prezzo_su_richiesta: meta.prezzo_su_richiesta === "1",
      numero_minimo_persone: parseInt(meta.numero_minimo_di_persone || "0", 10) || null,
      durata_notti: meta.durata_notti || null,
      pensione: `{${pensione.join(",")}}`,
      tipo_voli: meta.tipo_voli || null,
      etichetta_primo_deck: meta.etichetta_primo_deck || null,
      etichetta_secondo_deck: meta.etichetta_secondo_deck || null,
      etichetta_terzo_deck: meta.etichetta_terzo_deck || null,
      note_importanti: meta.note_importanti || null,
      nota_penali: meta.nota_penali || null,
      programma_pdf_url: pdfUrl,
      status: "published",
    }, "slug");

    if (!result?.[0]) continue;
    const cruiseId = result[0].id;
    logOk(`${title} → ${cruiseId}${shipId ? " (ship linked)" : ""}`);
    imported++;

    // --- Sub-tables ---

    // Locations
    const locations = extractRepeater(meta, "localita", ["nome", "coordinate"]);
    if (locations.length) {
      await safeInsert("cruise_locations",
        locations.map((r, i) => ({
          cruise_id: cruiseId, nome: r.nome, coordinate: r.coordinate || null, sort_order: i,
        }))
      );
    }

    // Itinerary days
    const programma = extractRepeater(meta, "programma", ["numero_giorno", "localita", "descrizione"]);
    if (programma.length) {
      await safeInsert("cruise_itinerary_days",
        programma.map((r, i) => ({
          cruise_id: cruiseId,
          numero_giorno: r.numero_giorno || null,
          localita: r.localita || null,
          descrizione: r.descrizione || null,
          sort_order: i,
        }))
      );
    }

    // Cabins (nested repeater: alberghi -> alberghi, but for cruises it's cabin types)
    const cabins = extractNestedRepeater(meta, "alberghi", ["localita"], "alberghi", ["nome_albergo", "stelle"]);
    if (cabins.length) {
      const cabinRows: Record<string, unknown>[] = [];
      let sortIdx = 0;
      for (const cab of cabins) {
        for (const child of cab.children) {
          cabinRows.push({
            cruise_id: cruiseId,
            localita: cab.parent.localita || null,
            tipologia_camera: child.nome_albergo || null,
            ponte: child.stelle || null,
            sort_order: sortIdx++,
          });
        }
      }
      if (cabinRows.length) await safeInsert("cruise_cabins", cabinRows);
    }

    // Departures (3 price columns for cruises)
    const departures = extractRepeater(meta, "calendario_partenze", ["from", "data_partenza", "3_price", "4_price", "terz"]);
    if (departures.length) {
      await safeInsert("cruise_departures",
        departures.map((r, i) => ({
          cruise_id: cruiseId,
          from_city: r.from || null,
          data_partenza: parseWPDate(r.data_partenza),
          prezzo_main_deck: parsePrice(r["3_price"]),
          prezzo_middle_deck: r["4_price"] || null,
          prezzo_superior_deck: r.terz || null,
          sort_order: i,
        }))
      );
    }

    // Supplements
    const supplements = extractRepeater(meta, "supplementi", ["titolo", "prezzo"]);
    if (supplements.length) {
      await safeInsert("cruise_supplements",
        supplements.map((r, i) => ({
          cruise_id: cruiseId, titolo: r.titolo, prezzo: r.prezzo || null, sort_order: i,
        }))
      );
    }

    // Inclusions
    const included = extractRepeater(meta, "included", ["titolo"]);
    const notIncluded = extractRepeater(meta, "not_included", ["titolo"]);
    const inclusionRows = [
      ...included.map((r, i) => ({
        cruise_id: cruiseId, titolo: r.titolo, is_included: true, sort_order: i,
      })),
      ...notIncluded.map((r, i) => ({
        cruise_id: cruiseId, titolo: r.titolo, is_included: false, sort_order: included.length + i,
      })),
    ];
    if (inclusionRows.length) await safeInsert("cruise_inclusions", inclusionRows);

    // Terms
    const terms = extractRepeater(meta, "termini", ["titolo"]);
    if (terms.length) {
      await safeInsert("cruise_terms",
        terms.map((r, i) => ({ cruise_id: cruiseId, titolo: r.titolo, sort_order: i }))
      );
    }

    // Penalties
    const penalties = extractRepeater(meta, "penalty", ["titolo"]);
    if (penalties.length) {
      await safeInsert("cruise_penalties",
        penalties.map((r, i) => ({ cruise_id: cruiseId, titolo: r.titolo, sort_order: i }))
      );
    }

    // Gallery (with concurrency limiter)
    const galleryIds = phpUnserializeArray(meta.gallery || "");
    if (galleryIds.length) {
      const galleryTasks = galleryIds.map((gid, i) => () =>
        resolveImageUrl(attachmentMap, gid, "cruises", `${slug}/gallery`).then(imgUrl => ({
          imgUrl, index: i,
        }))
      );
      const galleryResults = await runWithConcurrency(galleryTasks, IMAGE_CONCURRENCY);
      const galleryRows = galleryResults
        .filter(r => r.imgUrl)
        .map(r => ({ cruise_id: cruiseId, image_url: r.imgUrl!, sort_order: r.index }));
      if (galleryRows.length) await safeInsert("cruise_gallery", galleryRows);
    }
  }

  logOk(`Imported ${imported} cruises`);
}

// ============================================================
// 16. IMPORT BLOG
// ============================================================
async function importBlog(items: WPItem[], attachmentMap: Map<number, string>) {
  logSection("IMPORTING BLOG");

  // First, import categories
  const blogPosts = items.filter(
    (i) => i["wp:post_type"] === "post" && i["wp:status"] === "publish"
  );
  log(`Found ${blogPosts.length} published blog posts`);

  // Collect all unique categories
  const categorySet = new Set<string>();
  for (const post of blogPosts) {
    const cats = getCategories(post, "category");
    cats.forEach((cat) => {
      if (cat !== "Uncategorized") categorySet.add(cat);
    });
  }

  const categoryMap = new Map<string, string>();
  for (const catName of categorySet) {
    const catSlug = catName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (DRY_RUN) {
      logOk(`[DRY] Category: ${catName}`);
      categoryMap.set(catName, `dry-${catSlug}`);
      continue;
    }
    const result = await safeUpsert("blog_categories", {
      name: catName,
      slug: catSlug,
    }, "slug");
    if (result?.[0]) {
      categoryMap.set(catName, result[0].id);
      logOk(`Category: ${catName} → ${result[0].id}`);
    }
  }

  // Import posts
  for (const item of blogPosts) {
    const slug = String(item["wp:post_name"] || "");
    const title = String(item.title || "");
    const content = String(item["content:encoded"] || "");
    const excerpt = String(item["excerpt:encoded"] || "");
    const pubDate = String(item["wp:post_date"] || "");

    const cats = getCategories(item, "category").filter((c) => c !== "Uncategorized");
    const categoryId = cats[0] ? categoryMap.get(cats[0]) || null : null;

    // Thumbnail
    let coverUrl: string | null = null;
    const entries = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]].filter(Boolean);
    const thumbEntry = entries.find(m => String(m["wp:meta_key"]) === "_thumbnail_id");
    if (thumbEntry) {
      coverUrl = await resolveImageUrl(attachmentMap, String(thumbEntry["wp:meta_value"]), "blog", slug);
    }

    if (DRY_RUN) {
      logOk(`[DRY] ${title} (${slug})`);
      continue;
    }

    const result = await safeUpsert("blog_posts", {
      title,
      slug,
      content: content || null,
      excerpt: excerpt || null,
      cover_image_url: coverUrl,
      category_id: categoryId,
      status: "published",
      published_at: pubDate || new Date().toISOString(),
    }, "slug");

    if (result?.[0]) {
      logOk(`${title} → ${result[0].id}`);
    }
  }
}

// ============================================================
// 17. DESTINATION MATCHING LOGIC
// ============================================================
// Maps of known tour-destination associations based on common patterns
const DESTINATION_KEYWORDS: Record<string, string[]> = {
  "india": ["india", "triangolo d'oro", "rajasthan", "kerala"],
  "nepal": ["nepal", "kathmandu"],
  "giordania": ["giordania", "petra", "wadi rum"],
  "turchia": ["turchia", "istanbul", "cappadocia", "anatolia", "troia"],
  "uzbekistan": ["uzbekistan", "samarcanda", "bukhara"],
  "georgia": ["georgia", "tbilisi"],
  "armenia": ["armenia", "yerevan"],
  "azerbaijan": ["azerbaijan", "baku"],
  "kirghizistan": ["kirghizistan", "bishkek"],
  "mongolia": ["mongolia", "ulaanbaatar"],
  "giappone": ["giappone", "tokyo", "kyoto"],
  "filippine": ["filippine", "manila"],
  "russia": ["russia", "mosca", "san pietroburgo", "transiberiana"],
  "marocco": ["marocco", "marrakech", "fes"],
  "egitto": ["egitto", "cairo", "luxor"],
  "tunisia": ["tunisia", "tunisi"],
  "argentina": ["argentina", "buenos aires", "patagonia"],
  "cile": ["cile", "santiago", "atacama"],
  "brasile": ["brasile", "rio"],
  "peru": ["peru", "lima", "cusco", "machu picchu"],
  "uruguay": ["uruguay", "montevideo"],
  "bolivia": ["bolivia", "la paz", "uyuni"],
  "spagna": ["spagna", "madrid", "barcellona", "andalusia"],
  "portogallo": ["portogallo", "lisbona", "porto"],
  "polonia": ["polonia", "varsavia", "cracovia"],
  // River cruise destinations (slug "duero" for Douro)
  "danubio": ["danubio", "budapest", "vienna", "bratislava"],
  "reno": ["reno", "strasburgo", "colonia", "rhin"],
  "senna": ["senna", "parigi"],
  "duero": ["douro", "duero", "porto"],
  "mosella": ["mosella"],
  "schelda": ["schelda", "bruges", "anversa", "fiamminghi", "fiamminghe", "olandesi"],
};

function matchDestination(
  meta: MetaMap,
  title: string,
  destinationMap: Map<string, string>
): string | null {
  const titleLower = title.toLowerCase();

  // First, try exact name match from locations
  const locationCount = parseInt(meta.localita || "0", 10);
  for (let i = 0; i < locationCount; i++) {
    const locName = (meta[`localita_${i}_nome`] || "").toLowerCase();
    if (locName && destinationMap.has(locName)) {
      return destinationMap.get(locName)!;
    }
  }

  // Try keyword matching from title
  for (const [destSlug, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    for (const kw of keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        const destId = destinationMap.get(destSlug);
        if (destId) return destId;
      }
    }
  }

  return null;
}

function matchDestinationForCruise(
  meta: MetaMap,
  title: string,
  destinationMap: Map<string, string>
): string | null {
  // For cruises, try river names from locations or title
  return matchDestination(meta, title, destinationMap);
}

// Ship name aliases (WP title variant → DB ship name keyword)
const SHIP_ALIASES: Record<string, string> = {
  "vistagracia": "vistario",  // MS Vistagracia is likely MS Vistario or similar
  "river sapphire": "river sapphire",
};

function matchShip(title: string, shipMap: Map<string, string>): string | null {
  const titleLower = title.toLowerCase();
  // Try to find ship name in cruise title
  for (const [shipName, shipId] of shipMap.entries()) {
    if (titleLower.includes(shipName)) {
      return shipId;
    }
    // Also try without "ms " prefix
    const shortName = shipName.replace(/^ms\s+/, "");
    if (shortName.length > 3 && titleLower.includes(shortName)) {
      return shipId;
    }
  }
  // Try aliases
  for (const [alias, target] of Object.entries(SHIP_ALIASES)) {
    if (titleLower.includes(alias)) {
      for (const [shipName, shipId] of shipMap.entries()) {
        if (shipName.includes(target)) return shipId;
      }
    }
  }
  return null;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log(`
${c.bold}${c.cyan}╔══════════════════════════════════════════════════════╗
║     MishaTravel - WordPress → Supabase Migration     ║
╚══════════════════════════════════════════════════════╝${c.reset}
`);

  log(`Mode: ${FORCE ? "FORCE (delete & re-import)" : DRY_RUN ? "DRY RUN (no writes)" : "NORMAL (skip existing)"}`);
  if (MIGRATE_IMAGES) log("Image migration: ENABLED (download + re-upload to Supabase Storage)");
  else log("Image migration: DISABLED (using WordPress URLs - add --images to enable)");

  // Parse XML
  const items = parseXML();

  // Build attachment map
  const attachmentMap = buildAttachmentMap(items);

  // Count total images for progress tracking
  if (MIGRATE_IMAGES) {
    const totalImages = countTotalImages(items);
    resetImageProgress(totalImages);
    log(`Total images to migrate: ~${totalImages} (max ${IMAGE_CONCURRENCY} concurrent downloads)`);
  }

  // Count items by type
  const typeCounts: Record<string, number> = {};
  for (const item of items) {
    const t = String(item["wp:post_type"] || "unknown");
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  log("Post types found:");
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    if (["tours", "crociere", "imbarcazioni", "destinazioni", "post", "attachment"].includes(type)) {
      console.log(`  ${c.green}→${c.reset} ${type}: ${count}`);
    }
  }

  // Clear if forced
  await clearExistingData();

  // Import in dependency order
  const destinationMap = await importDestinations(items, attachmentMap);
  const shipMap = await importShips(items, attachmentMap);
  await importTours(items, attachmentMap, destinationMap);
  await importCruises(items, attachmentMap, destinationMap, shipMap);
  await importBlog(items, attachmentMap);

  // Summary
  logSection("MIGRATION COMPLETE");
  if (MIGRATE_IMAGES) {
    logOk(`Image migration: ${imageCount} images processed`);
  }
  if (DRY_RUN) {
    logWarn("This was a DRY RUN - no data was written to the database.");
    log("Run without --dry-run to perform the actual migration.");
  } else {
    logOk("All content has been imported into Supabase!");
    log("Next steps:");
    log("  1. Check the admin panel at /admin to verify the imported data");
    log("  2. Check the public site to verify pages render correctly");
    if (!MIGRATE_IMAGES) {
      log("  3. Run with --images flag to migrate images to Supabase Storage:");
      log("     npx tsx scripts/migrate-wp.ts --force --images");
    }
  }
}

main().catch((err) => {
  logErr(`Migration failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
