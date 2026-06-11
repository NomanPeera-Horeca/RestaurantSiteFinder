import fs from "fs";
import path from "path";
import { SITE_BASE } from "./blog-constants.mjs";

export function listExistingSlugs(blogDir) {
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"))
    .map(f => f.replace(/\.md$/, ""));
}

export function updateLlmsTxt(llmsPath, spec) {
  let content = fs.readFileSync(llmsPath, "utf8");
  const url = `${SITE_BASE}/blog/${spec.slug}`;
  const today = new Date().toISOString().slice(0, 10);

  content = content.replace(/# Last updated: \d{4}-\d{2}-\d{2}/, `# Last updated: ${today}`);

  if (content.includes(url)) return content;

  const lines = content.split("\n");
  const expertIdx = lines.findIndex(l => l.startsWith("## Expert guides"));
  if (expertIdx === -1) {
    content += `\n- ${spec.title} — ${url}\n`;
    return content;
  }

  let insertAt = expertIdx + 1;
  while (insertAt < lines.length && /^\d+\./.test(lines[insertAt])) insertAt++;
  const n = lines.slice(expertIdx + 1, insertAt).filter(l => /^\d+\./.test(l)).length + 1;
  lines.splice(insertAt, 0, `${n}. ${spec.title} — ${url}`);
  return lines.join("\n");
}

export function addRelatedSlug(blogDir, targetSlug, newSlug) {
  const filePath = path.join(blogDir, `${targetSlug}.md`);
  if (!fs.existsSync(filePath)) return false;

  let raw = fs.readFileSync(filePath, "utf8");
  if (raw.includes(`- ${newSlug}`)) return false;

  if (!/relatedSlugs:/.test(raw)) return false;

  raw = raw.replace(
    /(relatedSlugs:\n(?:  - [^\n]+\n)+)/,
    `$1  - ${newSlug}\n`
  );
  fs.writeFileSync(filePath, raw);
  return true;
}

export function crossLinkRelated(blogDir, spec) {
  const updated = [];
  for (const slug of spec.relatedSlugs ?? []) {
    if (addRelatedSlug(blogDir, slug, spec.slug)) updated.push(slug);
  }
  return updated;
}
