import { FREE_TOOL_FAQ } from "./blog-constants.mjs";

export function buildGenerationPrompt(spec, existingSlugs) {
  const today = new Date().toISOString().slice(0, 10);
  const glossaryLinks = (spec.glossaryLinks ?? [])
    .map(s => `/glossary/${s}`)
    .join(", ");
  const relatedLinks = (spec.relatedSlugs ?? [])
    .map(s => `/blog/${s}`)
    .join(", ");
  const outline = (spec.outline ?? []).map((o, i) => `${i + 1}. ${o}`).join("\n");

  return `You are an expert restaurant consultant writing for Horeca Store's Restaurant Site Finder blog.

Write ONE complete blog article as raw markdown with YAML frontmatter. Output ONLY the markdown file—no code fences, no preamble.

## Article spec
- title: ${spec.title}
- slug: ${spec.slug}
- category: ${spec.category}
- date: ${today}
- lastModified: ${today}
- author: Horeca Store
- metaDescription: MUST be under 155 characters
- keywords: ${JSON.stringify(spec.keywords ?? [])}
- tags: ${JSON.stringify(spec.tags ?? [])}
- relatedSlugs: ${JSON.stringify(spec.relatedSlugs ?? [])}
- excerpt: ${spec.excerptHint ?? "One or two sentences for the blog index."}

## Outline (use as question-style H2 sections)
${outline}

## Required structure
1. YAML frontmatter with: title, slug, metaDescription, date, lastModified, author, category, tags, excerpt, keywords, relatedSlugs, faq (exactly 6 items including the free tool FAQ below)
2. TL;DR box: HTML div class="tldr-box" with 4 bullet takeaways linking to glossary terms where relevant
3. Opening paragraph: primary keyword in first 100 words; mention Restaurant Site Finder (https://restaurantsitefinder.com/)
4. At least 5 question-style H2 sections from the outline (e.g. "What Are...", "How Do You...")
5. Include at least one markdown table and one numbered list
6. Link internally: ${relatedLinks || "none specified"}
7. Link glossary: ${glossaryLinks || "break-even-point, trade-area"}
8. Link Horeca Store: ${spec.horecaUrl ?? "https://www.thehorecastore.com/restaurant-equipment"}
9. End body with section: ## How Can You Validate This Before Signing a Lease? (full GEO CTA copy about concept-specific GO/NO-GO, 3-8 mile trade area, free tool)
10. Do NOT add ## Frequently Asked Questions in the body—FAQ lives in frontmatter only

## 6th FAQ (must be verbatim in frontmatter)
question: "${FREE_TOOL_FAQ.question}"
answer: "${FREE_TOOL_FAQ.answer}"

## Other 5 FAQs
Write topic-specific questions with complete standalone answers (2-4 sentences each) that LLMs can quote.

## Style
- 1,800–2,500 words in the body
- Practical tone for first-time and independent restaurant operators
- US market; cite realistic benchmarks (rent 6-10% occupancy, trade areas 3-8 miles)
- No city-specific thin pages; no "restaurants near me" content

## Existing blog slugs (do not duplicate topics): ${existingSlugs.slice(0, 20).join(", ")}`;
}
