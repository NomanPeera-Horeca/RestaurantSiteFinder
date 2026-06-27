import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerContentRoutes } from "../content/routes";
import { registerSeoRoutes } from "../seo";
import { registerStripeWebhook } from "../routers/stripe-webhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./static";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe webhook must receive raw body (before JSON parser)
  registerStripeWebhook(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Server-rendered blog, glossary, llms.txt (before SPA)
  registerContentRoutes(app);
  // SEO routes (sitemap.xml, robots.txt)
  registerSeoRoutes(app);

  // One-time migration endpoint — creates feedback table in TiDB
  app.get("/api/run-feedback-migration", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ ok: false, error: "No DATABASE_URL" });
      }
      const mysql = await import("mysql2/promise");
      const conn = await mysql.createConnection(process.env.DATABASE_URL);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`feedback\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`category\` enum('bug_report','feature_request','report_is_wrong','missing_my_city','other') NOT NULL,
          \`message\` text NOT NULL,
          \`email\` varchar(320),
          \`page\` varchar(512),
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          CONSTRAINT \`feedback_id\` PRIMARY KEY(\`id\`)
        )
      `);
      await conn.end();
      return res.json({ ok: true, message: "feedback table created or already exists" });
    } catch (err: any) {
      return res.json({ ok: false, error: err.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port =
    process.env.NODE_ENV === "production"
      ? parseInt(process.env.PORT || "3000", 10)
      : await findAvailablePort(parseInt(process.env.PORT || "3000", 10));

  if (process.env.NODE_ENV !== "production") {
    const preferredPort = parseInt(process.env.PORT || "3000", 10);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // One-time migration: create feedback table if it does not exist
  try {
    if (process.env.DATABASE_URL) {
      const mysql = await import("mysql2/promise");
      const conn = await mysql.createConnection(process.env.DATABASE_URL);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`feedback\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`category\` enum('bug_report','feature_request','report_is_wrong','missing_my_city','other') NOT NULL,
          \`message\` text NOT NULL,
          \`email\` varchar(320),
          \`page\` varchar(512),
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          CONSTRAINT \`feedback_id\` PRIMARY KEY(\`id\`)
        )
      `);
      await conn.end();
      console.log("[Migration] feedback table ready");
    }
  } catch (err) {
    console.warn("[Migration] feedback table migration failed:", err);
  }
}

startServer().catch(console.error);
