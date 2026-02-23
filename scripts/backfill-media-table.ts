/**
 * Backfill script: populates the `media` table from Supabase Storage buckets.
 *
 * Usage:
 *   npx tsx scripts/backfill-media-table.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (reads from .env.local automatically via dotenv)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BUCKETS = ['tours', 'cruises', 'ships', 'blog', 'catalogs', 'agencies', 'general']
const PAGE_SIZE = 200

async function listAllFiles(bucket: string) {
  const allFiles: Array<{
    name: string
    size: number | null
    mimeType: string | null
    createdAt: string
  }> = []

  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.warn(`  Warning: could not list bucket "${bucket}": ${error.message}`)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    for (const file of data) {
      if (!file.name || file.id === null) continue
      allFiles.push({
        name: file.name,
        size: file.metadata?.size ?? null,
        mimeType: file.metadata?.mimetype ?? null,
        createdAt: file.created_at ?? new Date().toISOString(),
      })
    }

    offset += data.length
    hasMore = data.length === PAGE_SIZE
  }

  return allFiles
}

async function main() {
  console.log('=== Media Table Backfill ===\n')

  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const bucket of BUCKETS) {
    console.log(`Scanning bucket: ${bucket}...`)
    const files = await listAllFiles(bucket)
    console.log(`  Found ${files.length} files`)

    for (const file of files) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name)
      const url = urlData.publicUrl

      const { error } = await supabase.from('media').upsert(
        {
          filename: file.name,
          url,
          file_size: file.size,
          mime_type: file.mimeType,
          width: null,
          height: null,
          bucket,
          folder: bucket,
          alt_text: '',
        },
        { onConflict: 'url', ignoreDuplicates: true }
      )

      if (error) {
        if (error.code === '23505') {
          // Duplicate - already exists
          totalSkipped++
        } else {
          console.warn(`  Error inserting ${file.name}: ${error.message}`)
          totalErrors++
        }
      } else {
        totalInserted++
      }
    }

    console.log(`  Done.\n`)
  }

  console.log('=== Summary ===')
  console.log(`Inserted: ${totalInserted}`)
  console.log(`Skipped (already exist): ${totalSkipped}`)
  console.log(`Errors: ${totalErrors}`)
  console.log(`Total: ${totalInserted + totalSkipped + totalErrors}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
