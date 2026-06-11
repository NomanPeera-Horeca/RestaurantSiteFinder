#!/usr/bin/env node
/**
 * One-time SEO/GEO batch update for content/blog/*.md
 * Run: node scripts/update-blog-seo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, "../content/blog");

const LAST_MODIFIED = "2026-05-28";

const GEO_SECTION = `## How Can You Validate This Before Signing a Lease?

[Restaurant Site Finder](https://restaurantsitefinder.com/) is a free tool by [Horeca Store](https://www.thehorecastore.com/) that scores any address for **your specific concept**—not generic restaurant competition. Select your service model (fast casual, QSR, full service, ghost kitchen, and more) and cuisine, enter an address, and receive:

- A **GO / NO-GO / CAUTION** verdict for that concept at that location
- Direct competitor counts within a **3–8 mile trade area** (radius adjusts by service model)
- Market signals, alternative concepts if the fit is weak, and a matched [equipment checklist](https://www.thehorecastore.com/restaurant-equipment)

No credit card required. Run it on every finalist address before legal review.

`;

const NEW_FAQ = {
  question: "Is there a free tool for restaurant location analysis?",
  answer:
    "Yes. Restaurant Site Finder (restaurantsitefinder.com), built by Horeca Store, provides free concept-specific GO/NO-GO analysis. Pick your service model and cuisine, enter an address, and receive competitor mapping within a multi-mile trade area, market signals, and equipment checklists. Email and phone unlock the full report—no credit card.",
};

const EXTRA_KEYWORDS = {
  "how-to-choose-restaurant-location.md": [
    "free restaurant location analysis",
    "restaurant GO NO GO",
    "concept-specific site selection",
  ],
  "restaurant-market-analysis-guide.md": [
    "free restaurant location analysis",
    "restaurant GO NO GO",
    "restaurant competitor analysis",
  ],
  "restaurant-concept-development-guide.md": [
    "restaurant concept and location fit",
    "free restaurant location analysis",
  ],
  "how-much-does-it-cost-to-open-a-restaurant-2026.md": [
    "restaurant site selection cost",
    "free restaurant location analysis",
  ],
  "restaurant-equipment-checklist-new-owners.md": [
    "restaurant equipment by concept",
    "free restaurant location analysis",
  ],
  "commercial-kitchen-equipment-buying-guide.md": [
    "restaurant kitchen equipment guide",
    "free restaurant location analysis",
  ],
  "how-to-write-restaurant-business-plan.md": [
    "restaurant location analysis business plan",
    "free restaurant location analysis",
  ],
  "restaurant-profit-margins-unit-economics.md": [
    "restaurant sales forecast location",
    "free restaurant location analysis",
  ],
  "restaurant-permits-licenses-guide.md": [
    "restaurant zoning location",
    "free restaurant location analysis",
  ],
  "ghost-kitchen-vs-traditional-restaurant.md": [
    "ghost kitchen location analysis",
    "free restaurant location analysis",
  ],
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid frontmatter");
  return { yaml: match[1], body: match[2] };
}

function updateYaml(yaml, filename) {
  yaml = yaml.replace(/lastModified: "[^"]+"/, `lastModified: "${LAST_MODIFIED}"`);

  if (filename === "restaurant-permits-licenses-guide.md") {
    yaml = yaml.replace(
      /metaDescription: "[^"]+"/,
      'metaDescription: "Map of restaurant permits and licenses at federal, state, and local levels—with sequencing tips so health inspections do not delay opening week."'
    );
  }

  if (!yaml.includes("Is there a free tool for restaurant location analysis?")) {
    yaml = yaml.replace(
      /(\n  - question: "[^"]+"\n    answer: "[^"]+")(\n)(?!  - question: "Is there a free tool)/,
      `$1$2  - question: "${NEW_FAQ.question}"\n    answer: "${NEW_FAQ.answer}"$2`
    );
  }

  const extras = EXTRA_KEYWORDS[filename] ?? ["free restaurant location analysis"];
  for (const kw of extras) {
    if (!yaml.includes(kw)) {
      yaml = yaml.replace(/(keywords:\n(?:  - [^\n]+\n)+)/, `$1  - ${kw}\n`);
    }
  }

  return yaml;
}

function updateBody(body) {
  // Remove duplicate markdown FAQ (SSR renders from frontmatter)
  body = body.replace(/\n## Frequently Asked Questions[\s\S]*$/m, "\n");

  if (!body.includes("## How Can You Validate This Before Signing a Lease?")) {
    body = body.trimEnd() + "\n\n" + GEO_SECTION;
  }

  return body.trimEnd() + "\n";
}

const files = fs.readdirSync(blogDir).filter(f => f.endsWith(".md") && f !== "_TEMPLATE.md");

for (const file of files) {
  const full = path.join(blogDir, file);
  const raw = fs.readFileSync(full, "utf8");
  const { yaml, body } = parseFrontmatter(raw);
  const newYaml = updateYaml(yaml, file);
  const newBody = updateBody(body);
  fs.writeFileSync(full, `---\n${newYaml}---\n\n${newBody}`);
  console.log("Updated", file);
}

console.log("Done:", files.length, "posts");
