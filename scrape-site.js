const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mishatravel.com';
const OUTPUT_DIR = path.join(__dirname, 'scraped-data');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

// Create output directories
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePage(page, url, name) {
  console.log(`\n📄 Scraping: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);

    // Take full-page screenshot
    const screenshotName = name.replace(/\//g, '_') || 'homepage';
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${screenshotName}.png`),
      fullPage: true
    });

    // Extract page structure
    const pageData = await page.evaluate(() => {
      // Get all text content by sections
      function getElementData(el) {
        const tag = el.tagName.toLowerCase();
        const classes = el.className && typeof el.className === 'string' ? el.className : '';
        const id = el.id || '';
        const text = el.textContent?.trim().substring(0, 300) || '';
        const href = el.getAttribute('href') || '';
        const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
        const alt = el.getAttribute('alt') || '';
        const style = el.getAttribute('style') || '';
        return { tag, classes, id, text, href, src, alt, style };
      }

      // Get navigation
      const navLinks = [];
      document.querySelectorAll('nav a, .menu a, .navbar a, header a').forEach(a => {
        navLinks.push({
          text: a.textContent?.trim(),
          href: a.getAttribute('href'),
          classes: a.className
        });
      });

      // Get all internal links
      const allLinks = new Set();
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && (href.startsWith('/') || href.includes('mishatravel.com'))) {
          allLinks.add(href);
        }
      });

      // Get header structure
      const header = document.querySelector('header');
      const headerHTML = header ? header.outerHTML : '';

      // Get footer structure
      const footer = document.querySelector('footer');
      const footerHTML = footer ? footer.outerHTML : '';

      // Get main content sections
      const sections = [];
      document.querySelectorAll('section, .section, main > div, .elementor-section, .elementor-widget-wrap').forEach(section => {
        const sectionData = {
          tag: section.tagName.toLowerCase(),
          classes: section.className && typeof section.className === 'string' ? section.className : '',
          id: section.id || '',
          headings: [],
          images: [],
          links: [],
          buttons: [],
          text: ''
        };

        // Get headings
        section.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
          sectionData.headings.push({
            tag: h.tagName.toLowerCase(),
            text: h.textContent?.trim()
          });
        });

        // Get images
        section.querySelectorAll('img').forEach(img => {
          sectionData.images.push({
            src: img.getAttribute('src') || img.getAttribute('data-src') || '',
            alt: img.getAttribute('alt') || '',
            width: img.getAttribute('width') || '',
            height: img.getAttribute('height') || ''
          });
        });

        // Get buttons/CTAs
        section.querySelectorAll('a.btn, a.button, .btn, .button, a[class*="cta"], button').forEach(btn => {
          sectionData.buttons.push({
            text: btn.textContent?.trim(),
            href: btn.getAttribute('href') || '',
            classes: btn.className
          });
        });

        // Get direct text (first 500 chars)
        const textContent = section.textContent?.trim().substring(0, 500);
        sectionData.text = textContent;

        if (sectionData.headings.length > 0 || sectionData.images.length > 0 || sectionData.text.length > 50) {
          sections.push(sectionData);
        }
      });

      // Get meta tags
      const metaTags = {};
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
        const content = meta.getAttribute('content') || '';
        if (name && content) metaTags[name] = content;
      });

      // Get page title
      const title = document.title;

      // Get body classes
      const bodyClasses = document.body.className;

      // Get color scheme from CSS variables or computed styles
      const colors = [];
      const heroEl = document.querySelector('.hero, .banner, .slider, [class*="hero"], [class*="banner"]');
      if (heroEl) {
        const styles = window.getComputedStyle(heroEl);
        colors.push({
          element: 'hero',
          bg: styles.backgroundColor,
          color: styles.color
        });
      }

      // Get fonts
      const fonts = new Set();
      document.querySelectorAll('*').forEach(el => {
        const font = window.getComputedStyle(el).fontFamily;
        if (font) fonts.add(font);
      });

      return {
        title,
        bodyClasses,
        metaTags,
        navLinks: [...new Set(navLinks.map(JSON.stringify))].map(JSON.parse),
        allLinks: [...allLinks],
        headerHTML: headerHTML.substring(0, 5000),
        footerHTML: footerHTML.substring(0, 5000),
        sections: sections.slice(0, 30),
        colors,
        fonts: [...fonts].slice(0, 10)
      };
    });

    return { url, name, ...pageData };
  } catch (err) {
    console.error(`  ❌ Error scraping ${url}: ${err.message}`);
    return { url, name, error: err.message };
  }
}

async function discoverAllLinks(page) {
  console.log('🔍 Discovering all site links from homepage...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await delay(2000);

  const links = await page.evaluate(() => {
    const allLinks = new Set();
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href) {
        if (href.startsWith('/') && !href.startsWith('//')) {
          allLinks.add(href);
        } else if (href.includes('mishatravel.com')) {
          try {
            const url = new URL(href);
            allLinks.add(url.pathname);
          } catch(e) {}
        }
      }
    });
    return [...allLinks];
  });

  return links;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Step 1: Discover all links from homepage
  const discoveredLinks = await discoverAllLinks(page);
  console.log(`\n📋 Discovered ${discoveredLinks.length} internal links`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'discovered-links.json'), JSON.stringify(discoveredLinks, null, 2));

  // Step 2: Group links by category
  const categories = {
    homepage: ['/'],
    tour: [],
    crociere: [],
    destinazioni: [],
    flotta: [],
    blog: [],
    cataloghi: [],
    other: []
  };

  discoveredLinks.forEach(link => {
    if (link === '/' || link === '') return;
    if (link.includes('/tour')) categories.tour.push(link);
    else if (link.includes('/crocier') || link.includes('/river-cruise') || link.includes('/cruise')) categories.crociere.push(link);
    else if (link.includes('/destinazion') || link.includes('/destination')) categories.destinazioni.push(link);
    else if (link.includes('/flotta') || link.includes('/fleet') || link.includes('/nave') || link.includes('/ship')) categories.flotta.push(link);
    else if (link.includes('/blog') || link.includes('/news') || link.includes('/articol')) categories.blog.push(link);
    else if (link.includes('/catalogo') || link.includes('/catalog') || link.includes('/brochure')) categories.cataloghi.push(link);
    else categories.other.push(link);
  });

  console.log('\n📊 Link categories:');
  Object.entries(categories).forEach(([cat, links]) => {
    console.log(`  ${cat}: ${Array.isArray(links) ? links.length : 1} pages`);
  });

  // Step 3: Scrape all unique pages (limit samples per category to avoid timeouts)
  const pagesToScrape = [
    { url: BASE_URL, name: 'homepage' }
  ];

  // Add all pages from each category
  Object.entries(categories).forEach(([cat, links]) => {
    if (cat === 'homepage') return;
    const linksArray = Array.isArray(links) ? links : [];
    // Scrape all links, but limit blog posts to 3
    const limit = cat === 'blog' ? 3 : linksArray.length;
    linksArray.slice(0, limit).forEach(link => {
      pagesToScrape.push({ url: `${BASE_URL}${link}`, name: `${cat}/${link}` });
    });
  });

  console.log(`\n🚀 Scraping ${pagesToScrape.length} pages...\n`);

  const allPagesData = [];
  for (const { url, name } of pagesToScrape) {
    const data = await scrapePage(page, url, name);
    allPagesData.push(data);
    await delay(1500); // Be polite
  }

  // Step 4: Save all data
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'site-structure.json'),
    JSON.stringify(allPagesData, null, 2)
  );

  // Step 5: Generate structure summary
  const summary = {
    totalPages: allPagesData.length,
    categories: Object.entries(categories).map(([cat, links]) => ({
      category: cat,
      count: Array.isArray(links) ? links.length : 1,
      sampleUrls: Array.isArray(links) ? links.slice(0, 5) : ['/']
    })),
    navigation: allPagesData[0]?.navLinks || [],
    globalFonts: allPagesData[0]?.fonts || [],
    globalMeta: allPagesData[0]?.metaTags || {},
    allDiscoveredLinks: discoveredLinks
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'site-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n✅ Scraping complete!`);
  console.log(`   📁 Data saved to: ${OUTPUT_DIR}`);
  console.log(`   📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`   📊 Total pages scraped: ${allPagesData.length}`);

  await browser.close();
}

main().catch(console.error);
