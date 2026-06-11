# Content Calendar — Restaurant Site Finder Blog

**Created:** 2026-05-28  
**Cadence:** **1 new guide every day** (automated)  
**Every post must:** funnel to [Restaurant Site Finder](https://restaurantsitefinder.com/) (free GO/NO-GO) and [Horeca Store equipment](https://www.thehorecastore.com/restaurant-equipment).

---

## Automated daily publishing

The queue lives in **`content/calendar/queue.json`** (30 topics pre-loaded). State is tracked in **`content/calendar/state.json`**.

| Command | What it does |
|---------|----------------|
| `pnpm run blog:daily` | Generate + write the next queued post (skips if already published today) |
| `pnpm run blog:daily:dry` | Generate only, no file writes |
| `node scripts/publish-daily-blog.mjs --force` | Publish even if one went out today |
| `node scripts/publish-daily-blog.mjs --slug=restaurant-lease-red-flags-before-signing` | Publish a specific queue item |

**GitHub Actions:** paste `scripts/daily-blog.workflow.yml` into `.github/workflows/daily-blog.yml` on GitHub (web UI). Runs at **14:00 UTC daily**, commits the new markdown, updates `llms.txt`, and pushes to `main` (Render auto-deploys).

> **Push note:** If `git push` fails with “workflow scope”, add the workflow file on GitHub.com instead of in git—or regenerate your PAT with the **workflow** scope checked.

**Required secret:** `OPENAI_API_KEY` in GitHub repo settings → Secrets.  
**Optional variable:** `OPENAI_MODEL` (default `gpt-4o`).

To pause automation: set repo secret or env `BLOG_AUTOMATION_ENABLED=false`.

To extend the queue after 30 days: append objects to `content/calendar/queue.json` using the same schema as existing entries.

---

## Priority queue (next 5 articles)

### 1. Restaurant lease red flags before you sign

| Field | Value |
|-------|-------|
| **Slug** | `restaurant-lease-red-flags-before-signing` |
| **Category** | Site Selection |
| **Target keywords** | restaurant lease red flags, before signing restaurant lease, restaurant LOI checklist, tenant improvement allowance restaurant |
| **Search intent** | Operator has a finalist address; wants a walk-away list before legal fees |
| **Why now** | High pre-lease intent; complements existing location + market analysis guides |
| **Outline** | TI allowance caps · exclusive use · grease trap/hood pass-through · CAM estimates · personal guarantee · co-tenancy · radius restrictions · use this with free GO/NO-GO on the address |
| **Internal links** | `how-to-choose-restaurant-location`, `restaurant-market-analysis-guide`, glossary `break-even-point` |
| **Horeca CTA** | Equipment budget only after site passes — link to restaurant-equipment |

---

### 2. How many direct competitors is too many?

| Field | Value |
|-------|-------|
| **Slug** | `how-many-restaurant-competitors-is-too-many` |
| **Category** | Site Selection |
| **Target keywords** | restaurant competitor analysis, too many restaurants in area, direct competitors restaurant, market saturation restaurant |
| **Search intent** | User saw “0 direct competitors” or “15 competitors nearby” and wants interpretation |
| **Why now** | Matches product output (direct vs. all competitors, multi-mile radius) |
| **Outline** | All restaurants vs. direct competitors · saturation by cuisine · cluster effects (QSR) · when zero competitors is a warning · 5-mile trade area by format · run concept-specific scan |
| **Internal links** | `restaurant-market-analysis-guide`, `ghost-kitchen-vs-traditional-restaurant` |
| **Tool hook** | Step-by-step: pick Burgers + Fast Casual, enter ZIP, read direct competitor count |

---

### 3. QSR vs fast casual vs full service: different location rules

| Field | Value |
|-------|-------|
| **Slug** | `qsr-fast-casual-full-service-location-rules` |
| **Category** | Site Selection |
| **Target keywords** | QSR site selection, fast casual location analysis, full service restaurant location, drive-thru site selection |
| **Search intent** | User picked service model in tool; wants format-specific site criteria |
| **Why now** | Unique to concept selector; competitors write generic “restaurant location” content |
| **Outline** | Trade area size by format · daypart traffic · drive-thru/ingress · rent % targets · competitor clustering · equipment implications at Horeca |
| **Internal links** | `how-to-choose-restaurant-location`, `restaurant-concept-development-guide`, `commercial-kitchen-equipment-buying-guide` |

---

### 4. Second-generation restaurant space: when the location wins

| Field | Value |
|-------|-------|
| **Slug** | `second-generation-restaurant-space-location` |
| **Category** | Site Selection |
| **Target keywords** | second generation restaurant space, restaurant lease take over, former restaurant space, restaurant buildout savings |
| **Search intent** | Cost-conscious opener evaluating existing restaurant shell |
| **Why now** | Pairs with 2026 cost guide; high save intent on equipment + buildout |
| **Outline** | Hood/grease trap reuse · health dept history · why previous tenant failed · rent vs. TI · still run market analysis · equipment refresh at Horeca |
| **Internal links** | `how-much-does-it-cost-to-open-a-restaurant-2026`, `restaurant-equipment-checklist-new-owners` |

---

### 5. GO vs NO-GO vs CAUTION: how to read your location report

| Field | Value |
|-------|-------|
| **Slug** | `restaurant-location-go-no-go-explained` |
| **Category** | Site Selection |
| **Target keywords** | restaurant GO NO GO, restaurant location report, opportunity score restaurant, concept fit score |
| **Search intent** | User completed scan; wants to interpret verdict before unlocking full report |
| **Why now** | Product-led SEO; captures branded + problem-aware queries |
| **Outline** | What GO/NO-GO/CAUTION mean · concept fit vs. market score · direct competitors · alternatives section · when to re-run another address · equipment checklist next step |
| **Internal links** | All site selection guides, glossary `trade-area-analysis` (add term if missing) |

---

## Backlog (weeks 6–10)

| Week | Topic | Primary keyword |
|------|-------|-----------------|
| 6 | Opening a burger restaurant: location checklist | burger restaurant location analysis |
| 7 | Pizza restaurant site selection | pizza restaurant location |
| 8 | Food hall vs standalone: location tradeoffs | food hall restaurant location |
| 9 | Restaurant rent calculator: what % of sales is safe | restaurant rent to sales ratio |
| 10 | How to compare two finalist restaurant addresses | compare restaurant locations |

---

## Publishing workflow (each article)

1. Copy `content/blog/_TEMPLATE.md`  
2. Fill frontmatter (see `CONTENT-WORKFLOW.md`)  
3. Include TL;DR + GEO validation section + 6 FAQs (include free tool FAQ)  
4. Run `node scripts/update-blog-seo.mjs` only for **new** posts if script is extended — or copy GEO block from any updated guide  
5. Add URL to `content/llms.txt` under Expert guides  
6. Add 2–3 `relatedSlugs` cross-links from existing posts (edit their `relatedSlugs` too)  
7. Deploy → verify with `curl` + View Source  
8. Optional: link from Horeca Store blog/footer (see `OFFPAGE-SEO-PLAYBOOK.md`)

---

## KPIs to track (monthly)

| Metric | Tool |
|--------|------|
| Organic impressions by guide | Google Search Console |
| Clicks to `/` from `/blog/*` | GA4 / Plausible |
| Lead captures after blog → home | Internal lead DB / Sheets |
| LLM citations (manual) | Search brand + “Restaurant Site Finder” in ChatGPT/Perplexity |
| Ranking for “free restaurant location analysis” | GSC queries |

---

## What NOT to publish (yet)

- **Thin city pages** (“Best location for restaurant in Dallas”) without unique data  
- **Diner keywords** (“restaurants near me”) — wrong audience  
- **Enterprise site selection** content — SiteZeus/Buxton buyer, not your user  

Focus on **first-time and independent operators** deciding whether to sign a lease for a **specific concept**.
