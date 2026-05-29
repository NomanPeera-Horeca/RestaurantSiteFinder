# Weekly Blog Content Workflow

Restaurant Site Finder serves blog and glossary pages as **server-rendered HTML** (not client-side React). New posts are added by dropping a markdown file into the repo—no React or route changes required.

## Add a new blog post (weekly)

### 1. Copy the template

```bash
cp content/blog/_TEMPLATE.md content/blog/your-article-slug.md
```

Use a **kebab-case** filename that matches the `slug` in frontmatter (e.g. `winter-menu-planning.md` → `slug: winter-menu-planning`).

### 2. Fill in frontmatter

Required YAML fields at the top of the file:

| Field | Description |
|-------|-------------|
| `title` | Article H1 (also used in `<title>` tag) |
| `slug` | URL path: `/blog/{slug}` |
| `metaDescription` | Under **155 characters** for Google snippets |
| `date` | ISO date published, e.g. `"2026-06-15"` |
| `lastModified` | ISO date last updated |
| `author` | Usually `"Horeca Store"` |
| `category` | e.g. Site Selection, Finance, Operations |
| `tags` | YAML array of topic tags |
| `excerpt` | 1–2 sentences for blog index |
| `keywords` | YAML array for SEO |
| `relatedSlugs` | 2–3 other blog slugs for “Related guides” |
| `faq` | 3–5 items with `question` and `answer` (powers FAQPage JSON-LD) |

### 3. Write the body

- Start with the **TL;DR box** (HTML `div.tldr-box` with bullet takeaways).
- Use **question-style H2 headings** (e.g. “What Should You Look for in Foot Traffic?”).
- Include tables or numbered lists where helpful.
- Link to glossary: `/glossary/prime-cost`
- Link to other guides: `/blog/how-to-choose-restaurant-location`
- Link to the tool: `https://restaurantsitefinder.com/`
- Link to Horeca equipment: `https://www.thehorecastore.com/...`
- End with `## Frequently Asked Questions` (match frontmatter `faq`).

### 4. Deploy

After merge/deploy:

- Post appears on `/blog` automatically (sorted by `date`).
- `/blog/your-article-slug` is live as full HTML (verify with **View Source** or `curl`).
- `sitemap.xml` includes the new URL on next server start.

### 5. Verify SEO

```bash
curl -s https://restaurantsitefinder.com/blog/your-article-slug | head -80
```

Confirm:

- Article text is in raw HTML (not empty `#root`).
- `<title>`, `<meta name="description">`, `<link rel="canonical">` are correct.
- JSON-LD includes `BlogPosting`, `BreadcrumbList`, and `FAQPage`.

## Glossary updates

Edit `content/glossary/terms.json`—add an object with `term`, `slug`, `shortDefinition`, `longDefinition` (paragraphs separated by `\n\n`), `relatedTerms`, `relatedBlogSlugs`, and `category`. Redeploy; term pages and sitemap update automatically.

## Files you do **not** need to change for a new post

- `client/src/App.tsx`
- `server/content/routes.ts`
- `server/seo.ts` (sitemap is dynamic)

## Optional: update llms.txt

Add the new guide URL under “Expert guides” in `content/llms.txt` so AI crawlers discover it faster.
