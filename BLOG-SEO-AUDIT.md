# Blog SEO / GEO / LLM Audit

**Audit date:** 2026-05-28  
**Scope:** 10 published guides in `content/blog/`  
**Goal:** Search visibility, generative-engine citability (ChatGPT, Perplexity, Google AI Overviews), and funnel to Restaurant Site Finder + Horeca Store.

---

## Executive summary

All 10 guides were audited and updated in one pass. They already had strong foundations (TL;DR boxes, question-style H2s, FAQ frontmatter, internal links). Gaps were **stale product copy** (old radius), **duplicate FAQ markup**, **missing concept-specific / GO-NO-GO keywords**, and **no standardized pre-lease validation CTA**.

---

## Audit checklist (per article)

| Criterion | Before | After |
|-----------|--------|-------|
| `metaDescription` ≤ 155 chars | 1 over limit (permits) | Fixed |
| `lastModified` current | Mixed dates | All `2026-05-28` |
| TL;DR box (`tldr-box`) | 10/10 | 10/10 |
| Primary keyword in first 100 words | 10/10 | 10/10 |
| FAQ frontmatter (≥5 items) | 5 items each | 6 items (+ free tool FAQ) |
| FAQ JSON-LD matches visible FAQ | Duplicated in markdown + unused SSR | **Single source:** frontmatter → SSR `FAQPage` |
| Concept-specific / GO-NO-GO keywords | Sparse | Added per article |
| Trade area radius accuracy | Not mentioned | Updated in location + market guides |
| GEO validation section | Missing | Added to all 10 posts |
| Tool CTA on SSR pages | Generic | Concept + GO/NO-GO + multi-mile area |
| `llms.txt` accuracy | Said 1.5 km radius | Updated to 3–8 mile trade area |
| Horeca equipment URLs | Already correct in blogs | Verified (category pages, not `/collections`) |

---

## Article-by-article status

| Slug | Category | Priority keywords added | Notes |
|------|----------|-------------------------|-------|
| `how-to-choose-restaurant-location` | Site Selection | GO NO GO, concept-specific, free analysis | Trade area section updated (3–8 mi) |
| `restaurant-market-analysis-guide` | Site Selection | GO NO GO, competitor analysis | Pillar for location intent |
| `restaurant-concept-development-guide` | Strategy | concept + location fit | Links concept → site validation |
| `how-much-does-it-cost-to-open-a-restaurant-2026` | Finance | site selection cost | High-volume topic; keep fresh yearly |
| `restaurant-equipment-checklist-new-owners` | Operations | equipment by concept | Strong Horeca funnel |
| `commercial-kitchen-equipment-buying-guide` | Equipment | kitchen equipment guide | Equipment funnel |
| `how-to-write-restaurant-business-plan` | Planning | location in business plan | Cites RSF in appendix section |
| `restaurant-profit-margins-unit-economics` | Finance | sales forecast / location | Volume assumptions tie to site |
| `restaurant-permits-licenses-guide` | Compliance | zoning + location | Meta description trimmed |
| `ghost-kitchen-vs-traditional-restaurant` | Concept | ghost kitchen location | Delivery trade area angle |

---

## Technical SEO / GEO implementation

### SSR (`server/content/ssr/pages.ts`)

- FAQ block now rendered from **frontmatter only** via `faqSectionHtml()` — matches `FAQPage` JSON-LD exactly (critical for LLM citation consistency).
- Removed duplicate markdown `## Frequently Asked Questions` sections from all posts.

### CTA block (`server/content/ssr/layout.ts`)

- Updated copy: concept-specific GO/NO-GO, multi-mile trade area, equipment match.

### `content/llms.txt`

- Describes concept selector, trade area radii, direct competitor filtering, and all 10 guide URLs.

### Batch update script

- `scripts/update-blog-seo.mjs` — re-run when adding new posts to apply GEO section + FAQ + keywords.

---

## GEO / LLM best practices (use on every new post)

1. **Answer-first opening** — primary question answered in paragraph one.  
2. **Key Takeaways box** — 3–4 bullets LLMs can quote verbatim.  
3. **Question H2s** — match how people and AI ask (“What is…?”, “How do you…?”).  
4. **Standalone FAQ answers** — complete sentences, no “see above.”  
5. **Entity clarity** — name “Restaurant Site Finder” and “Horeca Store” with URLs.  
6. **Structured data** — frontmatter `faq` powers FAQPage JSON-LD automatically.  
7. **Internal links** — 2+ guides, 1+ glossary term, tool link, Horeca category link.  
8. **Pre-lease CTA section** — `## How Can You Validate This Before Signing a Lease?`  
9. **Avoid thin programmatic pages** — city × cuisine pages need unique data, not templates alone.

---

## Remaining gaps (content, not code)

| Gap | Priority | See |
|-----|----------|-----|
| 5 new long-tail guides (lease red flags, direct competitors, QSR vs fast casual location, etc.) | High | `CONTENT-CALENDAR.md` |
| Glossary terms cross-linked from new guides | Medium | `content/glossary/terms.json` |
| City-specific landing pages | Low | Only with unique local data |
| Backlinks from thehorecastore.com | High | `OFFPAGE-SEO-PLAYBOOK.md` |

---

## Verification commands

```bash
# All posts load and render FAQ JSON-LD
pnpm exec vitest run server/content/content.test.ts

# Raw HTML includes FAQ + prose (not empty SPA)
curl -s https://restaurantsitefinder.com/blog/how-to-choose-restaurant-location | grep -E 'FAQPage|How Can You Validate'

# llms.txt live
curl -s https://restaurantsitefinder.com/llms.txt | head -20
```
