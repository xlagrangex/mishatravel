const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://mishatravel.com";

// Pages to scrape - mapped from footer links + key content pages
const PAGES_TO_SCRAPE = [
  // Link Rapidi
  { slug: "chi-siamo", urls: ["/chi-siamo/", "/about/", "/about-us/"] },
  // Pagine Legali
  { slug: "privacy-policy", urls: ["/privacy-policy/"] },
  { slug: "cookie-policy", urls: ["/cookie-policy/"] },
  { slug: "termini-condizioni", urls: ["/termini-e-condizioni/", "/termini-condizioni/", "/terms/"] },
  { slug: "condizioni-vendita", urls: ["/condizioni-generali-di-vendita/", "/condizioni-vendita/", "/condizioni-di-vendita/"] },
  { slug: "gdpr", urls: ["/informativa-gdpr/", "/gdpr/"] },
  // Info Utili
  { slug: "come-prenotare-guida-completa", urls: ["/come-prenotare-guida-completa/", "/come-prenotare/"] },
  { slug: "coperture-assicurative", urls: ["/coperture-assicurative/", "/assicurazioni-viaggio/", "/assicurazioni/"] },
  { slug: "documenti-di-viaggio", urls: ["/documenti-di-viaggio/", "/documenti/"] },
  { slug: "faq", urls: ["/faq/", "/domande-frequenti/"] },
  { slug: "reclami", urls: ["/reclami/", "/modulo-reclami/"] },
  { slug: "cancellazioni-e-penali", urls: ["/cancellazioni-e-penali/"] },
  { slug: "fondo-di-garanzia", urls: ["/fondo-di-garanzia/"] },
  // Area Agenzie
  { slug: "diventa-partner", urls: ["/diventa-partner/", "/diventa-agenzia/"] },
  { slug: "contatti", urls: ["/contatti/", "/contattaci/"] },
  // Extra pages that may exist
  { slug: "materiale-marketing", urls: ["/materiale-marketing/", "/marketing/"] },
  { slug: "formazione", urls: ["/formazione/", "/training/"] },
];

async function scrapePage(page, slug, urls) {
  for (const urlPath of urls) {
    const fullUrl = BASE_URL + urlPath;
    try {
      const response = await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      if (!response || response.status() === 404) {
        console.log(`  [404] ${fullUrl}`);
        continue;
      }

      // Wait a bit for content to render
      await page.waitForTimeout(1000);

      const data = await page.evaluate(() => {
        // Get page title
        const titleEl =
          document.querySelector("h1") ||
          document.querySelector(".entry-title") ||
          document.querySelector(".page-title");
        const title = titleEl ? titleEl.textContent.trim() : "";

        // Get main content - try multiple selectors
        const contentSelectors = [
          ".entry-content",
          ".page-content",
          ".elementor-widget-container",
          "article",
          "main .container",
          "main",
          "#content",
          ".content-area",
        ];

        let contentEl = null;
        for (const sel of contentSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim().length > 50) {
            contentEl = el;
            break;
          }
        }

        if (!contentEl) {
          return { title, html: "", text: "", found: false };
        }

        // Get the HTML content, cleaning up scripts and styles
        const clone = contentEl.cloneNode(true);
        clone.querySelectorAll("script, style, nav, header, footer, .sidebar, .widget-area, .comments-area").forEach(el => el.remove());

        return {
          title,
          html: clone.innerHTML,
          text: clone.textContent.replace(/\s+/g, " ").trim(),
          found: true,
          url: window.location.href,
        };
      });

      if (data.found && data.text.length > 30) {
        console.log(`  [OK] ${fullUrl} - "${data.title}" (${data.text.length} chars)`);
        return { slug, ...data };
      } else {
        console.log(`  [EMPTY] ${fullUrl} - content too short`);
      }
    } catch (err) {
      console.log(`  [ERR] ${fullUrl}: ${err.message}`);
    }
  }

  return { slug, title: "", html: "", text: "", found: false };
}

async function main() {
  console.log("Starting footer pages scraper...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  // First, get the actual footer links from the live site
  console.log("Fetching footer links from mishatravel.com...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2000);

  const footerLinks = await page.evaluate(() => {
    const footer = document.querySelector("footer") || document.querySelector("#footer") || document.querySelector(".footer");
    if (!footer) return [];
    const links = Array.from(footer.querySelectorAll("a[href]"));
    return links
      .map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute("href"),
      }))
      .filter((l) => l.href && l.href.startsWith("/") || l.href.startsWith("https://mishatravel.com"));
  });

  console.log(`Found ${footerLinks.length} footer links:`);
  footerLinks.forEach((l) => console.log(`  - ${l.text}: ${l.href}`));
  console.log("");

  // Scrape each page
  const results = [];
  for (const pageConfig of PAGES_TO_SCRAPE) {
    console.log(`Scraping: ${pageConfig.slug}`);
    const result = await scrapePage(page, pageConfig.slug, pageConfig.urls);
    results.push(result);
  }

  await browser.close();

  // Save results
  const outputPath = path.join(__dirname, "scraped-data", "footer-pages.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} pages to ${outputPath}`);

  // Summary
  const found = results.filter((r) => r.found);
  const notFound = results.filter((r) => !r.found);
  console.log(`\nSummary: ${found.length} found, ${notFound.length} not found`);
  if (notFound.length > 0) {
    console.log("Not found:");
    notFound.forEach((r) => console.log(`  - ${r.slug}`));
  }
}

main().catch(console.error);
