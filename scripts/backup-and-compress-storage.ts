/**
 * Backup originals to Cloudflare R2 + compress Supabase Storage in place.
 *
 * Phases:
 *   --phase=analyze  (default) Read-only inventory of every Supabase bucket.
 *   --phase=backup            Stream every file Supabase -> R2. No local disk.
 *   --phase=compress          Stream Supabase -> sharp (resize 1920, q90) -> Supabase upsert.
 *                             Refuses to run unless --backup-confirmed is set,
 *                             which is only true after a successful backup phase
 *                             (the script writes a sentinel object to R2).
 *   --phase=all               analyze -> backup -> compress, with confirmations.
 *
 * Optional flags:
 *   --bucket=<name>      Limit to a single Supabase bucket (default: all 7).
 *   --quality=<n>        JPEG quality (default 90).
 *   --max-side=<px>      Max long edge after resize (default 1920).
 *   --dry-run            Compress phase: log savings without uploading.
 *   --yes                Skip interactive prompts (CI/non-interactive).
 *
 * Run with:
 *   npx tsx scripts/backup-and-compress-storage.ts
 *   npx tsx scripts/backup-and-compress-storage.ts --phase=backup
 *   npx tsx scripts/backup-and-compress-storage.ts --phase=compress --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'

// ---------------------------------------------------------------------------
// Env loading (no dotenv dep)
// ---------------------------------------------------------------------------

function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {
    /* .env.local optional if env already set */
  }
}
loadEnv()

const SUPABASE_URL = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_SERVICE_KEY = mustEnv('SUPABASE_SERVICE_ROLE_KEY')
const R2_ENDPOINT = mustEnv('R2_ENDPOINT')
const R2_BUCKET = mustEnv('R2_BUCKET_NAME')
const R2_KEY = mustEnv('R2_ACCESS_KEY_ID')
const R2_SECRET = mustEnv('R2_SECRET_ACCESS_KEY')

function mustEnv(k: string): string {
  const v = process.env[k]
  if (!v) {
    console.error(`Missing env var: ${k}`)
    process.exit(1)
  }
  return v
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? 'true']
  }),
)

const PHASE = (args.phase ?? 'analyze') as 'analyze' | 'backup' | 'compress' | 'all'
const ONLY_BUCKET = args.bucket as string | undefined
const QUALITY = Number(args.quality ?? 90)
const MAX_SIDE = Number(args['max-side'] ?? 1920)
const DRY_RUN = args['dry-run'] === 'true'
const YES = args.yes === 'true'

const SUPABASE_BUCKETS = ONLY_BUCKET
  ? [ONLY_BUCKET]
  : ['tours', 'cruises', 'ships', 'blog', 'catalogs', 'agencies', 'general']

const SENTINEL_KEY = '_backup-completed.json'

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY, secretAccessKey: R2_SECRET },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

type FileEntry = { bucket: string; path: string; size: number; mime: string | null }

async function listBucketFiles(bucket: string): Promise<FileEntry[]> {
  const all: FileEntry[] = []

  async function walk(prefix: string) {
    let offset = 0
    const PAGE = 1000
    while (true) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(prefix, { limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } })
      if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`)
      if (!data || data.length === 0) break
      for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name
        const isFolder = !item.id // Supabase marks folders with null id
        if (isFolder) {
          await walk(fullPath)
        } else {
          all.push({
            bucket,
            path: fullPath,
            size: (item.metadata as any)?.size ?? 0,
            mime: (item.metadata as any)?.mimetype ?? null,
          })
        }
      }
      if (data.length < PAGE) break
      offset += PAGE
    }
  }

  await walk('')
  return all
}

async function r2Has(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function r2HasSentinel(): Promise<boolean> {
  return r2Has(SENTINEL_KEY)
}

async function downloadFromSupabase(bucket: string, path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) throw new Error(`download ${bucket}/${path}: ${error?.message}`)
  return Buffer.from(await data.arrayBuffer())
}

async function uploadToR2(key: string, body: Buffer, contentType: string | null) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? 'application/octet-stream',
    }),
  )
}

async function uploadToSupabase(
  bucket: string,
  path: string,
  body: Buffer,
  contentType: string,
) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: true,
  })
  if (error) throw new Error(`upload ${bucket}/${path}: ${error.message}`)
}

async function confirm(prompt: string): Promise<boolean> {
  if (YES) return true
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ans = (await rl.question(`${prompt} [y/N] `)).trim().toLowerCase()
  rl.close()
  return ans === 'y' || ans === 'yes' || ans === 's' || ans === 'si'
}

// ---------------------------------------------------------------------------
// Phase: ANALYZE
// ---------------------------------------------------------------------------

async function phaseAnalyze(): Promise<FileEntry[]> {
  console.log('━━━ FASE 1: ANALISI (read-only) ━━━\n')

  const inventory: FileEntry[] = []
  for (const bucket of SUPABASE_BUCKETS) {
    process.stdout.write(`📦 ${bucket}: scansiono… `)
    try {
      const files = await listBucketFiles(bucket)
      const total = files.reduce((s, f) => s + f.size, 0)
      console.log(`${files.length} file, ${fmtBytes(total)}`)
      inventory.push(...files)
    } catch (e) {
      console.log(`⚠️  errore: ${(e as Error).message}`)
    }
  }

  console.log('\n━━━ Riepilogo per bucket ━━━')
  const byBucket = new Map<string, { count: number; size: number }>()
  for (const f of inventory) {
    const cur = byBucket.get(f.bucket) ?? { count: 0, size: 0 }
    cur.count++
    cur.size += f.size
    byBucket.set(f.bucket, cur)
  }
  console.log('Bucket'.padEnd(12), 'File'.padStart(8), 'Dimensione'.padStart(14))
  for (const [b, s] of byBucket) {
    console.log(b.padEnd(12), String(s.count).padStart(8), fmtBytes(s.size).padStart(14))
  }
  const totalSize = inventory.reduce((s, f) => s + f.size, 0)
  console.log('─'.repeat(38))
  console.log(
    'TOTALE'.padEnd(12),
    String(inventory.length).padStart(8),
    fmtBytes(totalSize).padStart(14),
  )

  const images = inventory.filter((f) => f.mime?.startsWith('image/') ?? /\.(jpe?g|png|webp|gif)$/i.test(f.path))
  const imagesTotal = images.reduce((s, f) => s + f.size, 0)
  console.log(`\nDi cui immagini: ${images.length} (${fmtBytes(imagesTotal)})`)

  console.log('\n━━━ Top 20 file più pesanti ━━━')
  const top = [...inventory].sort((a, b) => b.size - a.size).slice(0, 20)
  for (const f of top) {
    console.log(`${fmtBytes(f.size).padStart(10)}  ${f.bucket}/${f.path}`)
  }

  // Estimate compression savings (heuristic: q90 + maxSide=1920 typically saves 40-55% on WP-source JPGs)
  const estSaved = Math.round(imagesTotal * 0.45)
  console.log(
    `\n💡 Stima risparmio con compressione (q=${QUALITY}, max=${MAX_SIDE}px): ~${fmtBytes(estSaved)} (${Math.round((estSaved / imagesTotal) * 100)}%)`,
  )

  return inventory
}

// ---------------------------------------------------------------------------
// Phase: BACKUP
// ---------------------------------------------------------------------------

async function phaseBackup(inventory: FileEntry[]) {
  console.log('\n━━━ FASE 2: BACKUP su R2 (cloud-to-cloud) ━━━\n')

  const totalSize = inventory.reduce((s, f) => s + f.size, 0)
  console.log(`Saranno copiati ${inventory.length} file (${fmtBytes(totalSize)}) su r2://${R2_BUCKET}/<bucket>/<path>`)
  console.log(`Nessun byte tocca il disco locale.\n`)

  if (!(await confirm('Procedo con il backup?'))) {
    console.log('Annullato.')
    process.exit(0)
  }

  let done = 0
  let bytesDone = 0
  let skipped = 0
  let errors = 0

  for (const f of inventory) {
    const r2Key = `${f.bucket}/${f.path}`
    try {
      if (await r2Has(r2Key)) {
        skipped++
      } else {
        const buf = await downloadFromSupabase(f.bucket, f.path)
        await uploadToR2(r2Key, buf, f.mime)
        bytesDone += buf.byteLength
      }
      done++
    } catch (e) {
      errors++
      console.error(`  ⚠️  ${r2Key}: ${(e as Error).message}`)
    }
    if (done % 20 === 0 || done === inventory.length) {
      const pct = Math.round((done / inventory.length) * 100)
      process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ${done}/${inventory.length}  copiati ${fmtBytes(bytesDone)}  saltati ${skipped}  errori ${errors}   `)
    }
  }
  console.log('\n')

  if (errors > 0) {
    console.error(`❌ ${errors} errori durante il backup. NON proseguire con la compressione.`)
    process.exit(1)
  }

  // Write sentinel so compress phase knows backup is done
  await uploadToR2(
    SENTINEL_KEY,
    Buffer.from(
      JSON.stringify(
        {
          completedAt: new Date().toISOString(),
          fileCount: inventory.length,
          totalBytes: totalSize,
          buckets: SUPABASE_BUCKETS,
        },
        null,
        2,
      ),
    ),
    'application/json',
  )
  console.log(`✅ Backup completato. ${done} file su R2, ${fmtBytes(bytesDone)} trasferiti, ${skipped} già presenti.`)
}

// ---------------------------------------------------------------------------
// Phase: COMPRESS
// ---------------------------------------------------------------------------

async function phaseCompress(inventory: FileEntry[]) {
  console.log('\n━━━ FASE 3: COMPRESSIONE in place su Supabase ━━━\n')

  if (!(await r2HasSentinel())) {
    console.error(`❌ Sentinel _backup-completed.json non trovato su R2.`)
    console.error(`   Esegui prima: npx tsx scripts/backup-and-compress-storage.ts --phase=backup`)
    process.exit(1)
  }
  console.log('✅ Backup R2 verificato (sentinel presente).')

  const images = inventory.filter(
    (f) =>
      (f.mime?.startsWith('image/') ?? /\.(jpe?g|png)$/i.test(f.path)) &&
      !f.path.endsWith('.svg') &&
      !f.path.endsWith('.webp'),
  )
  console.log(`Verranno processati ${images.length} file (JPG/PNG, esclusi SVG e WebP già esistenti).`)
  console.log(`Parametri: quality=${QUALITY}, max-side=${MAX_SIDE}px${DRY_RUN ? ', DRY-RUN (nessun upload)' : ''}\n`)

  if (!DRY_RUN && !(await confirm('Procedo con la compressione (sovrascrive originali su Supabase)?'))) {
    console.log('Annullato.')
    process.exit(0)
  }

  let done = 0
  let savedBytes = 0
  let skippedSmall = 0
  let errors = 0
  const sample: { path: string; before: number; after: number }[] = []

  for (const f of images) {
    try {
      if (f.size < 80 * 1024) {
        skippedSmall++
        done++
        continue
      }

      const original = await downloadFromSupabase(f.bucket, f.path)
      const isPng = /\.png$/i.test(f.path) || f.mime === 'image/png'

      let pipeline = sharp(original, { failOn: 'none' }).rotate().resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })

      let outBuf: Buffer
      let outMime: string
      if (isPng) {
        outBuf = await pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true }).toBuffer()
        outMime = 'image/png'
      } else {
        outBuf = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toBuffer()
        outMime = 'image/jpeg'
      }

      // If compressed is somehow larger, keep original
      if (outBuf.byteLength >= original.byteLength) {
        skippedSmall++
        done++
        continue
      }

      const saved = original.byteLength - outBuf.byteLength
      savedBytes += saved

      if (sample.length < 5) {
        sample.push({ path: `${f.bucket}/${f.path}`, before: original.byteLength, after: outBuf.byteLength })
      }

      if (!DRY_RUN) {
        await uploadToSupabase(f.bucket, f.path, outBuf, outMime)
      }
      done++
    } catch (e) {
      errors++
      console.error(`  ⚠️  ${f.bucket}/${f.path}: ${(e as Error).message}`)
      done++
    }

    if (done % 10 === 0 || done === images.length) {
      const pct = Math.round((done / images.length) * 100)
      process.stdout.write(
        `\r  [${pct.toString().padStart(3)}%] ${done}/${images.length}  risparmiati ${fmtBytes(savedBytes)}  saltati ${skippedSmall}  errori ${errors}   `,
      )
    }
  }
  console.log('\n')

  console.log('━━━ Esempi (5 file) ━━━')
  for (const s of sample) {
    const pct = Math.round(((s.before - s.after) / s.before) * 100)
    console.log(`  ${s.path}: ${fmtBytes(s.before)} → ${fmtBytes(s.after)} (-${pct}%)`)
  }

  console.log(
    `\n${DRY_RUN ? '🧪 DRY-RUN' : '✅ Compressione'} completata. Risparmio totale stimato: ${fmtBytes(savedBytes)}.`,
  )
  if (!DRY_RUN) {
    console.log(
      `📦 Originali integri su R2 (bucket "${R2_BUCKET}"). Per ripristinare un file: scaricalo da R2 e ricaricalo su Supabase con upsert.`,
    )
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Phase: ${PHASE}  Buckets: ${SUPABASE_BUCKETS.join(', ')}\n`)

  if (PHASE === 'analyze') {
    await phaseAnalyze()
    console.log(
      `\nPer procedere col backup: npx tsx scripts/backup-and-compress-storage.ts --phase=backup`,
    )
    return
  }

  if (PHASE === 'backup') {
    const inv = await phaseAnalyze()
    await phaseBackup(inv)
    console.log(
      `\nPer procedere con la compressione: npx tsx scripts/backup-and-compress-storage.ts --phase=compress`,
    )
    return
  }

  if (PHASE === 'compress') {
    const inv = await phaseAnalyze()
    await phaseCompress(inv)
    return
  }

  if (PHASE === 'all') {
    const inv = await phaseAnalyze()
    await phaseBackup(inv)
    await phaseCompress(inv)
    return
  }

  console.error(`Phase sconosciuta: ${PHASE}`)
  process.exit(1)
}

main().catch((e) => {
  console.error('💥 Errore fatale:', e)
  process.exit(1)
})
