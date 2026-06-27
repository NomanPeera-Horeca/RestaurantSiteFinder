import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAllBlogSlugs } from "./content/blog";
import { getAllGlossarySlugs } from "./content/glossary";

const LLMS_TXT_PATHS = [
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public/llms.txt"),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/public/llms.txt"),
];

function readLlmsTxt(): string {
  for (const candidate of LLMS_TXT_PATHS) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, "utf8");
    }
  }
  throw new Error("llms.txt not found");
}

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

  app.get("/name-generator", (_req: Request, res: Response) => {
    res.redirect(301, "/restaurant-name-generator");
  });

  app.get("/llms.txt", (_req: Request, res: Response) => {
    try {
      res.type("text/plain").send(readLlmsTxt());
    } catch (err) {
      console.error("[llms.txt] Failed to read file:", err);
      res.status(404).type("text/plain").send("llms.txt not found");
    }
  });

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
      urlEntry(`${base}/restaurant-name-generator`, { lastmod: today, changefreq: "weekly", priority: "0.9" }),
      urlEntry(`${base}/restaurant-failure-rate`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/restaurant-rent-calculator`, { lastmod: today, changefreq: "monthly", priority: "0.85" }),
      urlEntry(`${base}/restaurant-location-analysis`, { lastmod: today, changefreq: "weekly", priority: "0.95" }),
      urlEntry(`${base}/restaurant-location-analysis-houston`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/restaurant-location-analysis-chicago`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/restaurant-location-analysis-new-york`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/restaurant-location-analysis-los-angeles`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/restaurant-location-analysis-dallas`, { lastmod: today, changefreq: "monthly", priority: "0.8" }),
      urlEntry(`${base}/blog`, { lastmod: today, changefreq: "weekly", priority: "0.9" }),
      urlEntry(`${base}/glossary`, { lastmod: today, changefreq: "weekly", priority: "0.9" }),
      urlEntry(`${base}/about`, { lastmod: today, changefreq: "monthly", priority: "0.5" }),
      urlEntry(`${base}/contact`, { lastmod: today, changefreq: "monthly", priority: "0.5" }),
      urlEntry(`${base}/privacy`, { lastmod: today, changefreq: "yearly", priority: "0.3" }),
      urlEntry(`${base}/terms`, { lastmod: today, changefreq: "yearly", priority: "0.3" }),
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
