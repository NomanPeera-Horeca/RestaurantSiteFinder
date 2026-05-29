import type { Express, Request, Response } from "express";
import { getAllBlogSlugs } from "./content/blog";
import { getAllGlossarySlugs } from "./content/glossary";

function getBaseUrl(): string {
  return (process.env.PUBLIC_URL || "https://restaurantsitefinder.com").replace(/\/$/, "");
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {}
): string {
  let entry = `  <url><loc>${xmlEscape(loc)}</loc>`;
  if (opts.lastmod) entry += `<lastmod>${opts.lastmod}</lastmod>`;
  if (opts.changefreq) entry += `<changefreq>${opts.changefreq}</changefreq>`;
  if (opts.priority) entry += `<priority>${opts.priority}</priority>`;
  entry += `</url>`;
  return entry;
}

export function registerSeoRoutes(app: Express): void {
  const today = new Date().toISOString().split("T")[0];

  app.get("/robots.txt", (_req: Request, res: Response) => {
    const base = getBaseUrl();
    res.type("text/plain").send(`User-agent: *
Allow: /

# AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${base}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    const base = getBaseUrl();
    // Omit /report — it requires query params; bare /report duplicates home and triggers Soft 404 in GSC.
    const urls: string[] = [
      urlEntry(`${base}/`, { lastmod: today, changefreq: "weekly", priority: "1.0" }),
      urlEntry(`${base}/blog`, { lastmod: today, changefreq: "weekly", priority: "0.9" }),
      urlEntry(`${base}/glossary`, { lastmod: today, changefreq: "weekly", priority: "0.9" }),
    ];

    try {
      for (const slug of getAllBlogSlugs()) {
        urls.push(
          urlEntry(`${base}/blog/${slug}`, {
            lastmod: today,
            changefreq: "monthly",
            priority: "0.8",
          })
        );
      }

      for (const slug of getAllGlossarySlugs()) {
        urls.push(
          urlEntry(`${base}/glossary/${slug}`, {
            lastmod: today,
            changefreq: "monthly",
            priority: "0.7",
          })
        );
      }
    } catch (err) {
      console.error("[sitemap] Failed to load content URLs:", err);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });
}
