import sharp from "sharp";
import { writeFileSync } from "fs";
import { join } from "path";

const SOURCE = "faviconmishattravel.png";
const PUBLIC = "public";
const APP = "src/app";

// Circular mask SVG generator
function circleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
  );
}

async function main() {
  const input = await sharp(SOURCE)
    .resize(512, 512, { fit: "cover" })
    .toBuffer();

  // --- 1. Circular crop at 512px (base for all sizes) ---
  const circular512 = await sharp(input)
    .composite([{ input: circleMask(512), blend: "dest-in" }])
    .png()
    .toBuffer();

  // --- 2. favicon.ico (32x32) ---
  const ico32 = await sharp(circular512).resize(32, 32).png().toBuffer();
  // ICO format: we'll use a PNG-in-ICO approach
  const icoHeader = createIco([ico32], [32]);
  writeFileSync(join(APP, "favicon.ico"), icoHeader);
  console.log("✓ src/app/favicon.ico (32x32)");

  // --- 3. icon.png for Next.js App Router (32x32) ---
  await sharp(circular512).resize(32, 32).png().toFile(join(APP, "icon.png"));
  console.log("✓ src/app/icon.png (32x32)");

  // --- 4. apple-icon.png (180x180) ---
  await sharp(circular512)
    .resize(180, 180)
    .png()
    .toFile(join(APP, "apple-icon.png"));
  console.log("✓ src/app/apple-icon.png (180x180)");

  // --- 5. Various sizes in public/ for web manifest ---
  for (const size of [16, 32, 192, 512]) {
    await sharp(circular512)
      .resize(size, size)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(join(PUBLIC, `favicon-${size}x${size}.png`));
    console.log(`✓ public/favicon-${size}x${size}.png`);
  }

  // --- 6. OG image / site thumbnail (already have logo, skip) ---

  console.log("\nAll favicons generated!");
}

/**
 * Create a minimal ICO file containing one or more PNG images.
 * ICO format: 6-byte header + 16-byte directory entry per image + PNG data.
 */
function createIco(pngBuffers, sizes) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let dataOffset = headerSize + dirSize;

  // ICO header: reserved(2) + type(2, 1=ico) + count(2)
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = ICO
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  const imageDataParts = [];

  for (let i = 0; i < numImages; i++) {
    const png = pngBuffers[i];
    const size = sizes[i];

    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // image size
    entry.writeUInt32LE(dataOffset, 12); // offset

    dirEntries.push(entry);
    imageDataParts.push(png);
    dataOffset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageDataParts]);
}

main().catch(console.error);
