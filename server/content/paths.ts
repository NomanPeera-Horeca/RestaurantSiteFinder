import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function resolveProjectRoot(): string {
  const candidates = [
    process.env.CONTENT_ROOT,
    process.cwd(),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  ].filter((c): c is string => Boolean(c));

  for (const root of candidates) {
    if (fs.existsSync(path.join(root, "content", "blog"))) {
      return root;
    }
  }

  return process.cwd();
}

export const PROJECT_ROOT = resolveProjectRoot();
export const BLOG_DIR = path.join(PROJECT_ROOT, "content", "blog");
export const GLOSSARY_FILE = path.join(PROJECT_ROOT, "content", "glossary", "terms.json");
export const LLMS_TXT_FILE = path.join(PROJECT_ROOT, "content", "llms.txt");
