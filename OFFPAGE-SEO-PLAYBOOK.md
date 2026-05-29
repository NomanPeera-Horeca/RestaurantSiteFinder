# Off-Page SEO Playbook — Restaurant Site Finder

Practical priorities for the site owner. On-page and server-rendered content are handled in the codebase; this document is what **you** execute manually over 90 days.

---

## Phase 1: Foundation (Days 1–14)

### 1. Google Search Console & Bing

- Verify `restaurantsitefinder.com` in [Google Search Console](https://search.google.com/search-console).
- Submit `https://restaurantsitefinder.com/sitemap.xml`.
- Inspect URL: `/blog/how-to-choose-restaurant-location` → Request indexing.
- Repeat for `/glossary` and home page.
- Add site to [Bing Webmaster Tools](https://www.bing.com/webmasters) and submit the same sitemap.

### 2. Horeca Store internal authority (highest ROI)

Every link from a strong domain you control matters:

- Add a permanent footer or resources link on **thehorecastore.com**: “Free restaurant location analysis” → restaurantsitefinder.com.
- Create a `/restaurant-resources` or blog post on Horeca that embeds the tool and links to 3–5 pillar guides.
- Email signature for sales@thehorecastore.com: one line + link to the free tool.
- Post-opening email flows: “Analyze your next location free.”

Use descriptive anchor text: “free restaurant location analysis,” not “click here.”

### 3. Google Business Profile (if applicable)

If Horeca Store has GBP locations, add the tool URL in the website field or posts section where allowed.

---

## Phase 2: Links & listings (Days 15–45)

### 4. Industry directories (dofollow where possible)

Submit or claim listings with consistent NAP and the tool URL:

| Target | Notes |
|--------|--------|
| Crunchbase / product directories | “Free SaaS for restaurateurs” angle |
| Capterra / G2 (if free tools qualify) | Category: restaurant software |
| Local SBA / SCORE resource pages | Pitch as free feasibility aid |
| State restaurant association resource pages | Offer guest article + tool link |
| National Restaurant Association (member resources) | Longer shot; worth one email |

### 5. Guest posts (target 4–6 in 90 days)

Pitch **data + free tool**, not product spam:

- **Topics:** “What we learned building a free location analyzer,” “5 mistakes before signing a restaurant lease.”
- **Targets:** RestaurantOwner.com, QSR Magazine contributor pages, local business journals, commercial real estate blogs, equipment dealer blogs (non-competing regions).
- **CTA:** Link to pillar `/blog/how-to-choose-restaurant-location` and tool home.

Template outreach line: *“We published a free, no-paywall location analysis tool and a 2,000-word guide on site selection—happy to adapt a version for your audience with original data from our users (anonymized).”*

### 6. Digital PR angles

- **Press hook:** “Horeca Store releases $5,000-style location analysis free for independents.”
- Wire to: local business editors, restaurant trade press, “small business” verticals on regional news sites.
- Use HARO / Connectively / Qwoted: respond to queries about “opening a restaurant,” “commercial lease,” “food business startup.”
- Include one stat from your reports (e.g. average competitor count per scan) once you have volume.

### 7. Partnerships

- Commercial brokers who serve restaurant tenants: co-branded PDF “Site selection checklist” linking to your tool.
- Restaurant consultants: affiliate-style referral (they send clients to free report; you send equipment to Horeca).
- Culinary schools / hospitality programs: syllabus resource link.

---

## Phase 3: AI citation & social (Days 46–90)

### 8. Getting cited by ChatGPT, Perplexity, Gemini

LLMs favor **clear, extractable, authoritative** pages (you now have SSR + `llms.txt`):

- Keep `llms.txt` updated with new guide URLs.
- Ensure Wikipedia-neutral tone on glossary definitions (standalone quotable sentences).
- Earn mentions on **high-trust domains** (university extensions, .gov small business resources, established trade media)—LLMs weight these heavily.
- Publish original **statistics** quarterly (“Average opportunity score by metro”) from anonymized lead data—a single cited stat spreads across AI answers.

Do **not** spam AI training opt-out; you want GPTBot and PerplexityBot allowed (see `robots.txt`).

### 9. Social distribution (weekly rhythm)

| Channel | Action |
|---------|--------|
| LinkedIn (Horeca + founder) | 1 insight + link to new guide |
| Facebook groups | Restaurant owners, “opening a restaurant”—answer questions, link tool when relevant |
| Reddit | r/restaurantowners, r/Entrepreneur—follow rules; value-first comments |
| YouTube Shorts / TikTok | “3 signs a location is wrong” → link in bio |
| Email list | If Horeca has list, announce tool + best guides |

### 10. Reviews & proof

- Collect 3–5 short testimonials from beta users (“saved us from a bad lease”).
- Add quotes to home page (when you choose to update React)—until then, use in outreach decks.

---

## 90-day timeline (realistic)

| Week | Focus | KPI |
|------|--------|-----|
| 1–2 | GSC, sitemap, Horeca internal links | 5+ internal links from thehorecastore.com |
| 3–4 | 2 directory listings, 1 guest post pitch sent | 10 pitches sent |
| 5–6 | First guest post live, HARO 2x/week | 1 external dofollow link |
| 7–8 | Broker/consultant outreach | 2 partnership conversations |
| 9–10 | PR email to 20 trade journalists | 1 media mention |
| 11–12 | Second guest post, social cadence steady | 20 referring domains in GSC (stretch) |

Organic rankings for competitive terms (“restaurant location analysis”) often take **4–8 months**; glossary long-tail (“what is prime cost restaurant”) can rank in **6–12 weeks** with indexation and a few links.

---

## What to avoid

- Buying bulk backlinks or PBNs (penalty risk).
- Identical guest posts on 50 sites (duplicate content).
- Keyword-stuffed anchor text on every link (“restaurant location analysis tool free AI best”).
- Hiding the tool behind more gates than email/phone (hurts shares and links).

---

## Monthly checklist

- [ ] One new blog post (`content/blog/*.md`)
- [ ] Update `llms.txt` with new URL
- [ ] Request indexing in GSC for new URLs
- [ ] 5 outreach emails (guest post or partnership)
- [ ] 1 HARO/Connectively response
- [ ] Review GSC: impressions, top queries, crawl errors
- [ ] Confirm Horeca site still links to tool prominently

---

## Success metrics

- **Indexing:** All blog + glossary URLs in GSC “URL inspection: Indexed.”
- **Traffic:** Organic sessions to `/blog/*` and `/glossary/*` (GA4).
- **Links:** Referring domains in Ahrefs/Search Console (quality over quantity).
- **Leads:** Tool completions attributed to organic (UTM `utm_source=organic` on CTA tests).
- **AI:** Brand search for “Restaurant Site Finder” + manual checks in Perplexity/ChatGPT for “free restaurant location analysis.”

This playbook complements the technical SEO built into the app; execution consistency matters more than any single tactic.
