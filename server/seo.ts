import type { Express, Request, Response } from "express";

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\n");
  });
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    const baseUrl = process.env.PUBLIC_URL || "https://restaurantsitefinder.com";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/report</loc><priority>0.8</priority></url>
</urlset>`;
    res.type("application/xml").send(xml);
  });
}
