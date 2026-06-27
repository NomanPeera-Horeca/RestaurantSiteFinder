import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isContentPath } from "../content/routes";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(serverDir, "../..", "dist", "public")
      : path.resolve(serverDir, "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { redirect: false }));

  app.use("*", (req, res, next) => {
    const pathname = req.path;
    if (isContentPath(pathname)) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
