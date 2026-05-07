import { NextResponse, type NextRequest } from 'next/server'
import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthContext } from '@/lib/supabase/auth'
import { ADMIN_ROLES } from '@/lib/auth/role-config'
import { registerMediaAction } from '@/app/admin/media/actions'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_BUCKETS = new Set([
  'tours',
  'cruises',
  'ships',
  'blog',
  'catalogs',
  'agencies',
  'general',
])

const PASS_THROUGH_TYPES = new Set(['image/svg+xml', 'image/gif'])
const MAX_SIDE = 1920
const QUALITY = 87

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth.user || !auth.role || !ADMIN_ROLES.includes(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const file = form.get('file')
  const bucketRaw = form.get('bucket')
  const bucket = typeof bucketRaw === 'string' && bucketRaw ? bucketRaw : 'general'

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: `Bucket "${bucket}" not allowed` }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: `Not an image: ${file.type}` }, { status: 400 })
  }

  const original = Buffer.from(await file.arrayBuffer())
  const originalSize = original.byteLength

  let outBuf: Buffer
  let outMime: string
  let outName: string

  if (PASS_THROUGH_TYPES.has(file.type)) {
    // SVG/GIF skip processing entirely
    outBuf = original
    outMime = file.type
    outName = sanitize(file.name)
  } else {
    const isPng = file.type === 'image/png'
    try {
      const pipeline = sharp(original, { failOn: 'none' }).rotate().resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })

      if (isPng) {
        outBuf = await pipeline
          .png({ quality: QUALITY, compressionLevel: 9, palette: true })
          .toBuffer()
        outMime = 'image/png'
      } else {
        // Treat anything else (jpeg, webp, heic decoded by libvips) as JPEG output
        outBuf = await pipeline
          .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
          .toBuffer()
        outMime = 'image/jpeg'
      }

      // If the encoder made it bigger somehow, keep the original
      if (outBuf.byteLength >= originalSize) {
        outBuf = original
        outMime = file.type
      }
    } catch (e) {
      return NextResponse.json(
        { error: `Image processing failed: ${(e as Error).message}` },
        { status: 422 },
      )
    }

    // Force the right extension on the stored filename
    const baseName = sanitize(file.name).replace(/\.[^.]+$/, '')
    const ext = outMime === 'image/png' ? 'png' : 'jpg'
    outName = `${baseName}.${ext}`
  }

  const filePath = `${Date.now()}_${outName}`
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, outBuf, {
      contentType: outMime,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: `Storage upload failed: ${error.message}` }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  registerMediaAction({
    filename: filePath,
    url: urlData.publicUrl,
    file_size: outBuf.byteLength,
    mime_type: outMime,
    bucket,
  }).catch(() => {
    // Non-blocking: media DB insert is best-effort
  })

  return NextResponse.json({
    url: urlData.publicUrl,
    path: data.path,
    bucket,
    mime: outMime,
    originalSize,
    compressedSize: outBuf.byteLength,
  })
}
