const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE_URL = 'https://mishatravel.com';
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

// Create directories
const dirs = [
  'images/logo',
  'images/hero',
  'images/destinations',
  'images/tours',
  'images/cruises',
  'images/blog',
  'images/ships',
  'images/cataloghi',
  'images/misc',
];
dirs.forEach(d => fs.mkdirSync(path.join(PUBLIC_DIR, d), { recursive: true }));

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url || url.startsWith('data:')) return resolve(null);

    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const protocol = fullUrl.startsWith('https') ? https : http;

    const file = fs.createWriteStream(dest);
    protocol.get(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      timeout: 15000
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return resolve(null);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(null);
    });
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').toLowerCase();
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log('🌐 Loading homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await delay(3000);

  // Scroll to bottom to trigger lazy loading
  console.log('📜 Scrolling to load lazy images...');
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 500) {
      window.scrollTo(0, i);
      await new Promise(r => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
  });
  await delay(2000);

  // Extract all images with context
  const imageData = await page.evaluate(() => {
    const images = [];

    // Logo
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
      const alt = img.alt || '';
      const parent = img.closest('a');
      const parentHref = parent ? parent.getAttribute('href') : '';
      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;

      // Determine category
      let category = 'misc';
      const srcLower = src.toLowerCase();
      const altLower = alt.toLowerCase();

      if (srcLower.includes('logo') || altLower.includes('logo') || altLower.includes('misha travel')) {
        category = 'logo';
      } else if (img.closest('.elementor-widget-slides, .elementor-slides, [data-widget_type="slides"], .swiper-slide') ||
                 img.closest('[class*="hero"], [class*="banner"], [class*="slider"]')) {
        category = 'hero';
      }

      // Check parent sections for context
      const section = img.closest('section, .elementor-section, .elementor-widget-wrap');
      if (section) {
        const sectionText = section.textContent || '';
        if (sectionText.includes('destinazion') || sectionText.includes('Scegli la tua')) {
          if (category === 'misc') category = 'destinations';
        } else if (sectionText.includes('tour') || sectionText.includes('Tour')) {
          if (category === 'misc') category = 'tours';
        } else if (sectionText.includes('crocier') || sectionText.includes('Crocier')) {
          if (category === 'misc') category = 'cruises';
        } else if (sectionText.includes('blog') || sectionText.includes('articol')) {
          if (category === 'misc') category = 'blog';
        } else if (sectionText.includes('flotta') || sectionText.includes('imbarcaz') || sectionText.includes('nave')) {
          if (category === 'misc') category = 'ships';
        } else if (sectionText.includes('catalogo') || sectionText.includes('locandine')) {
          if (category === 'misc') category = 'cataloghi';
        }
      }

      // From link context
      if (parentHref) {
        if (parentHref.includes('/destinazion')) category = 'destinations';
        else if (parentHref.includes('/tour')) category = 'tours';
        else if (parentHref.includes('/crocier')) category = 'cruises';
        else if (parentHref.includes('/blog') || parentHref.includes('/category')) category = 'blog';
        else if (parentHref.includes('/imbarcaz') || parentHref.includes('/flotta')) category = 'ships';
      }

      if (src && !src.startsWith('data:') && width > 50 && height > 50) {
        images.push({
          src,
          alt,
          category,
          parentHref: parentHref || '',
          width,
          height,
        });
      }
    });

    // Also get background images from hero/slider
    document.querySelectorAll('.swiper-slide, [class*="slide"], [class*="hero"], [class*="banner"]').forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1]) {
          images.push({
            src: match[1],
            alt: 'hero-background',
            category: 'hero',
            parentHref: '',
            width: 1440,
            height: 600,
          });
        }
      }
    });

    return images;
  });

  console.log(`\n📸 Found ${imageData.length} images on homepage\n`);

  // Download all images
  const downloaded = { logo: [], hero: [], destinations: [], tours: [], cruises: [], blog: [], ships: [], cataloghi: [], misc: [] };

  for (const img of imageData) {
    try {
      const url = new URL(img.src);
      const ext = path.extname(url.pathname) || '.jpg';
      let filename = '';

      if (img.category === 'logo') {
        filename = `logo${ext}`;
      } else {
        // Extract meaningful name from URL or alt
        const urlName = path.basename(url.pathname, ext);
        filename = sanitizeFilename(img.alt || urlName) + ext;
      }

      // Avoid duplicates
      const destPath = path.join(PUBLIC_DIR, 'images', img.category, filename);
      if (fs.existsSync(destPath)) {
        const base = path.basename(filename, ext);
        filename = `${base}-${Date.now()}${ext}`;
      }

      const finalPath = path.join(PUBLIC_DIR, 'images', img.category, filename);
      console.log(`  ⬇ [${img.category}] ${filename}`);

      const result = await downloadFile(img.src, finalPath);
      if (result) {
        downloaded[img.category].push({
          filename,
          path: `/images/${img.category}/${filename}`,
          alt: img.alt,
          originalSrc: img.src,
          parentHref: img.parentHref,
        });
      }
    } catch(err) {
      // skip
    }
  }

  // Also try to get favicon/logo from common locations
  console.log('\n🔍 Downloading logo variants...');
  const logoUrls = [
    'https://mishatravel.com/wp-content/uploads/2025/05/cropped-logo-270x270.png',
    'https://mishatravel.com/wp-content/uploads/2025/05/logo.png',
  ];

  for (const logoUrl of logoUrls) {
    try {
      const ext = path.extname(new URL(logoUrl).pathname) || '.png';
      const filename = `logo-${path.basename(new URL(logoUrl).pathname)}`;
      const destPath = path.join(PUBLIC_DIR, 'images', 'logo', filename);
      console.log(`  ⬇ [logo] ${filename}`);
      await downloadFile(logoUrl, destPath);
    } catch(err) {}
  }

  // Also get the favicon
  try {
    await downloadFile('https://mishatravel.com/wp-content/uploads/2025/05/cropped-logo-270x270.png',
                       path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log('  ⬇ favicon.ico');
  } catch(err) {}

  // Save image mapping for reference
  const imageMap = path.join(PUBLIC_DIR, 'images', 'image-map.json');
  fs.writeFileSync(imageMap, JSON.stringify(downloaded, null, 2));

  console.log('\n✅ Download complete!');
  console.log('📊 Summary:');
  Object.entries(downloaded).forEach(([cat, imgs]) => {
    console.log(`   ${cat}: ${imgs.length} images`);
  });

  await browser.close();
}

main().catch(console.error);
