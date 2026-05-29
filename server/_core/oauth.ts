import type { Express, Request, Response } from "express";

export function registerOAuthRoutes(app: Express) {
  // OAuth disabled in self-hosted deployment.
  // Public users don't need login. Admin access via direct DB queries.
  app.get("/api/oauth/callback", async (_req: Request, res: Response) => {
    res.status(501).json({ error: "OAuth not enabled in this deployment" });
  });
}
