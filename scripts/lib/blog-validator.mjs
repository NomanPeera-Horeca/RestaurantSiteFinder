import { GEO_SECTION, FREE_TOOL_FAQ } from "./blog-constants.mjs";

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Missing YAML frontmatter");
  return { yaml: match[1], body: match[2] };
}

export function extractField(yaml, field) {
  const m = yaml.match(new RegExp(`^${field}:\\s*"([^"]*)"`, "m"));
  if (m) return m[1];
  const m2 = yaml.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return m2 ? m2[1].trim() : "";
}

export function validatePost(raw, expectedSlug) {
  const errors = [];
  const { yaml, body } = parseFrontmatter(raw);

  const slug = extractField(yaml, "slug");
  if (slug !== expectedSlug) errors.push(`slug mismatch: expected ${expectedSlug}, got ${slug}`);

  const meta = extractField(yaml, "metaDescription");
  if (!meta) errors.push("missing metaDescription");
  else if (meta.length > 155) errors.push(`metaDescription too long (${meta.length} chars)`);

  for (const field of ["title", "date", "excerpt", "category"]) {
    if (!extractField(yaml, field)) errors.push(`missing ${field}`);
  }

  if (!body.includes('class="tldr-box"')) errors.push("missing TL;DR box");
  if (!body.includes("## How Can You Validate This Before Signing a Lease?")) {
    errors.push("missing GEO validation section");
  }
  if (/## Frequently Asked Questions/i.test(body)) {
    errors.push("body must not contain ## Frequently Asked Questions");
  }
  if (!yaml.includes(FREE_TOOL_FAQ.question)) errors.push("missing free tool FAQ in frontmatter");

  const faqCount = (yaml.match(/^\s+- question:/gm) ?? []).length;
  if (faqCount < 6) errors.push(`need 6 FAQs, found ${faqCount}`);

  const wordCount = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (wordCount < 900) errors.push(`body too short (${wordCount} words, min 900)`);

  const h2Count = (body.match(/^## /gm) ?? []).length;
  if (h2Count < 5) errors.push(`need at least 5 H2 sections, found ${h2Count}`);

  return { errors, yaml, body, wordCount };
}

function truncateMeta(text, max = 155) {
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trimEnd() + "...";
}

export function postProcess(raw, spec = {}) {
  let { yaml, body } = parseFrontmatter(raw);
  const today = new Date().toISOString().slice(0, 10);

  if (spec.slug) {
    if (/^slug:/m.test(yaml)) {
      yaml = yaml.replace(/^slug:.*$/m, `slug: ${spec.slug}`);
    } else {
      yaml = `slug: ${spec.slug}\n${yaml}`;
    }
  }

  if (spec.title && /^title:/m.test(yaml)) {
    yaml = yaml.replace(/^title:.*$/m, `title: "${spec.title}"`);
  }

  const meta = extractField(yaml, "metaDescription");
  if (meta && meta.length > 155) {
    const fixed = truncateMeta(meta);
    yaml = yaml.replace(/^metaDescription:.*$/m, `metaDescription: "${fixed.replace(/"/g, '\\"')}"`);
  }

  if (!yaml.includes(FREE_TOOL_FAQ.question)) {
    yaml =
      yaml.trimEnd() +
      `\n  - question: "${FREE_TOOL_FAQ.question}"\n    answer: "${FREE_TOOL_FAQ.answer}"`;
  }

  if (!body.includes('class="tldr-box"')) {
    body =
      `<div class="tldr-box"><p><strong>Key Takeaways</strong></p><ul><li>Validate any finalist address with concept-specific analysis before signing a lease.</li><li>Compare direct competitors within a multi-mile trade area—not all restaurants on the map.</li><li>Stress-test rent and occupancy against realistic covers and check average.</li><li>Use <a href="https://restaurantsitefinder.com/">Restaurant Site Finder</a> for a free GO/NO-GO verdict.</li></ul></div>\n\n` +
      body;
  }

  if (!body.includes("## How Can You Validate This Before Signing a Lease?")) {
    body = body.trimEnd() + "\n\n" + GEO_SECTION + "\n";
  }

  body = body.replace(/\n## Frequently Asked Questions[\s\S]*$/m, "\n");

  yaml = yaml.replace(/lastModified: "[^"]+"/, `lastModified: "${today}"`);
  if (!/lastModified:/.test(yaml)) {
    yaml = yaml.replace(/(date: "[^"]+")/, `$1\nlastModified: "${today}"`);
  }
  if (!/date:/.test(yaml)) {
    yaml = `date: "${today}"\n${yaml}`;
  }

  return `---\n${yaml}\n---\n\n${body.trimEnd()}\n`;
}
