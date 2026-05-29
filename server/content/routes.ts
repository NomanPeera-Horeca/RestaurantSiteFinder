import type { Express, Request, Response } from "express";
import fs from "fs";
import { LLMS_TXT_FILE } from "./paths";
import {
  renderBlogArticle,
  renderBlogListing,
  renderGlossaryIndex,
  renderGlossaryTerm,
} from "./ssr/pages";

export function registerContentRoutes(app: Express): void {
  /** Bare /report has no content without query params; redirect to avoid Soft 404 */
  app.get("/report", (req: Request, res: Response, next) => {
    const hasParams =
      typeof req.query.address === "string" &&
      req.query.lat &&
      req.query.lng &&
      req.query.leadId;
    if (!hasParams) {
      res.redirect(301, "/");
      return;
    }
    next();
  });

  app.get("/blog", (_req: Request, res: Response) => {
    res.type("html").send(renderBlogListing());
  });

  app.get("/blog/:slug", (req: Request, res: Response) => {
    const html = renderBlogArticle(req.params.slug);
    if (!html) {
      res.status(404).type("html").send(notFoundHtml("Article not found"));
      return;
    }
    res.type("html").send(html);
  });

  app.get("/glossary", (_req: Request, res: Response) => {
    res.type("html").send(renderGlossaryIndex());
  });

  app.get("/glossary/:slug", (req: Request, res: Response) => {
    const html = renderGlossaryTerm(req.params.slug);
    if (!html) {
      res.status(404).type("html").send(notFoundHtml("Term not found"));
      return;
    }
    res.type("html").send(html);
  });

  app.get("/llms.txt", (_req: Request, res: Response) => {
    if (fs.existsSync(LLMS_TXT_FILE)) {
      res.type("text/plain").send(fs.readFileSync(LLMS_TXT_FILE, "utf-8"));
    } else {
      res.status(404).type("text/plain").send("Not found");
    }
  });
}

function notFoundHtml(message: string): string {
  return `<!DOCTYPE html><html><head><title>404</title></head><body><h1>${message}</h1><p><a href="/">Return home</a></p></body></html>`;
}

/** Paths handled by SSR (skip SPA fallback) */
export function isContentPath(pathname: string): boolean {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/glossary" ||
    pathname.startsWith("/glossary/") ||
    pathname === "/llms.txt"
  );
}
