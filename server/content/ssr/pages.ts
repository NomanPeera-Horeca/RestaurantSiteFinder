import { HORECA, SITE } from "../brand";
import { loadAllBlogPosts, loadBlogPost } from "../blog";
import { getAllGlossaryTerms, getGlossaryByCategory, getGlossaryTerm } from "../glossary";
import { markdownToHtml } from "../markdown";
import type { BlogFaq, GlossaryTerm } from "../types";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  definedTermJsonLd,
  definedTermSetJsonLd,
  faqPageJsonLd,
  scriptsFromJsonLd,
  SITE as siteConfig,
} from "./jsonld";
import { breadcrumbHtml, renderPage, toolCtaBlock } from "./layout";

const base = () => siteConfig.url.replace(/\/$/, "");

function faqSectionHtml(faq: BlogFaq[]): string {
  if (!faq.length) return "";
  const items = faq
    .map(
      f => `
    <div class="faq-item">
      <h3>${escapeHtml(f.question)}</h3>
      <p>${escapeHtml(f.answer)}</p>
    </div>`
    )
    .join("");
  return `<section class="faq-section" id="faq"><h2>Frequently Asked Questions</h2>${items}</section>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relatedPostsHtml(slugs: string[], currentSlug: string): string {
  const posts = loadAllBlogPosts().filter(
    p => slugs.includes(p.frontmatter.slug) && p.frontmatter.slug !== currentSlug
  );
  if (!posts.length) return "";
  const links = posts
    .map(
      p =>
        `<li><a href="${base()}/blog/${p.frontmatter.slug}">${escapeHtml(p.frontmatter.title)}</a></li>`
    )
    .join("");
  return `<div class="related-links"><h3>Related guides</h3><ul>${links}</ul></div>`;
}

function relatedTermsHtml(slugs: string[]): string {
  const terms = getAllGlossaryTerms().filter(t => slugs.includes(t.slug));
  if (!terms.length) return "";
  const links = terms
    .map(t => `<li><a href="${base()}/glossary/${t.slug}">${escapeHtml(t.term)}</a></li>`)
    .join("");
  return `<div class="related-links"><h3>Related glossary terms</h3><ul>${links}</ul></div>`;
}

export function renderBlogListing(): string {
  const posts = loadAllBlogPosts();
  const url = `${base()}/blog`;
  const jsonLd = scriptsFromJsonLd(
    collectionPageJsonLd(
      url,
      "Restaurant Opening Guides",
      "Expert guides on restaurant location selection, equipment, costs, and operations."
    ),
    breadcrumbJsonLd([
      { name: "Home", url: `${base()}/` },
      { name: "Guides", url },
    ])
  );

  const cards = posts
    .map(
      p => `
    <article class="blog-card">
      <p class="cat">${escapeHtml(p.frontmatter.category)}</p>
      <h2><a href="${base()}/blog/${p.frontmatter.slug}">${escapeHtml(p.frontmatter.title)}</a></h2>
      <p>${escapeHtml(p.frontmatter.excerpt)}</p>
      <p style="margin-top:0.75rem;font-size:0.75rem;color:var(--muted);">${p.readTimeMinutes} min read · ${escapeHtml(p.frontmatter.date)}</p>
    </article>`
    )
    .join("");

  const body = `
    ${breadcrumbHtml([{ name: "Home", href: `${base()}/` }, { name: "Guides" }])}
    <div class="page-hero">
      <h1>Restaurant Opening Guides</h1>
      <p class="excerpt">Practical, expert-written guides on location selection, equipment, costs, permits, and concept development. Free resources from ${escapeHtml(HORECA.name)}.</p>
    </div>
    <div class="blog-grid">${cards}</div>
    ${toolCtaBlock()}`;

  return renderPage(
    {
      title: "Restaurant Guides | Restaurant Site Finder",
      description:
        "Free expert guides on choosing a restaurant location, equipment checklists, opening costs, permits, and market analysis.",
      canonical: url,
      jsonLdScripts: jsonLd,
    },
    body,
    "blog"
  );
}

export function renderBlogArticle(slug: string): string | null {
  const post = loadBlogPost(slug);
  if (!post) return null;

  const fm = post.frontmatter;
  const url = `${base()}/blog/${fm.slug}`;
  const jsonLd = scriptsFromJsonLd(
    blogPostingJsonLd(fm, url),
    breadcrumbJsonLd([
      { name: "Home", url: `${base()}/` },
      { name: "Guides", url: `${base()}/blog` },
      { name: fm.title, url },
    ]),
    faqPageJsonLd(fm.faq)
  );

  const tags = fm.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const body = `
    ${breadcrumbHtml([
      { name: "Home", href: `${base()}/` },
      { name: "Guides", href: `${base()}/blog` },
      { name: fm.title },
    ])}
    <article>
      <header class="page-hero">
        <p class="cat" style="font-size:0.75rem;color:var(--primary);font-weight:600;text-transform:uppercase;">${escapeHtml(fm.category)}</p>
        <h1>${escapeHtml(fm.title)}</h1>
        <div class="meta">
          <span>By ${escapeHtml(fm.author)}</span>
          <span>${escapeHtml(fm.date)}</span>
          <span>${post.readTimeMinutes} min read</span>
        </div>
        <p class="excerpt">${escapeHtml(fm.excerpt)}</p>
        <div class="tag-list">${tags}</div>
      </header>
      <div class="prose">${post.html}</div>
      ${relatedPostsHtml(fm.relatedSlugs ?? [], fm.slug)}
      ${toolCtaBlock()}
    </article>`;

  const title =
    fm.title.length > 52 ? `${fm.title.slice(0, 49)}...` : fm.title;
  return renderPage(
    {
      title: `${title} | Restaurant Site Finder`,
      description: fm.metaDescription,
      canonical: url,
      ogType: "article",
      jsonLdScripts: jsonLd,
    },
    body,
    "blog"
  );
}

export function renderGlossaryIndex(): string {
  const terms = getAllGlossaryTerms();
  const grouped = getGlossaryByCategory();
  const url = `${base()}/glossary`;

  const jsonLd = scriptsFromJsonLd(
    definedTermSetJsonLd(base(), terms.length),
    breadcrumbJsonLd([
      { name: "Home", url: `${base()}/` },
      { name: "Glossary", url },
    ])
  );

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([cat, items]) => `
      <section class="glossary-cat">
        <h2>${escapeHtml(cat)}</h2>
        <ul class="term-list">
          ${items
            .map(
              t => `
            <li>
              <a href="${base()}/glossary/${t.slug}">${escapeHtml(t.term)}</a>
              <span class="term-short">${escapeHtml(t.shortDefinition)}</span>
            </li>`
            )
            .join("")}
        </ul>
      </section>`
    )
    .join("");

  const body = `
    ${breadcrumbHtml([{ name: "Home", href: `${base()}/` }, { name: "Glossary" }])}
    <div class="page-hero">
      <h1>Restaurant &amp; Kitchen Equipment Glossary</h1>
      <p class="excerpt">${terms.length} definitions for restaurant operations, finance, and commercial kitchen equipment. Built for owners, managers, and first-time operators.</p>
    </div>
    <div class="glossary-index">${sections}</div>
    ${toolCtaBlock()}`;

  return renderPage(
    {
      title: "Restaurant Glossary | 50+ Industry Terms",
      description:
        "Definitions for prime cost, food cost percentage, combi oven, walk-in cooler, FOH, BOH, and 50+ restaurant industry terms.",
      canonical: url,
      jsonLdScripts: jsonLd,
    },
    body,
    "glossary"
  );
}

function termLongHtml(term: GlossaryTerm): string {
  const paragraphs = term.longDefinition.split(/\n\n+/).filter(Boolean);
  return paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join("");
}

export function renderGlossaryTerm(slug: string): string | null {
  const term = getGlossaryTerm(slug);
  if (!term) return null;

  const url = `${base()}/glossary/${term.slug}`;
  const jsonLd = scriptsFromJsonLd(
    definedTermJsonLd(term.term, term.slug, term.shortDefinition, base()),
    breadcrumbJsonLd([
      { name: "Home", url: `${base()}/` },
      { name: "Glossary", url: `${base()}/glossary` },
      { name: term.term, url },
    ])
  );

  const relatedTermLinks = term.relatedTerms
    .map(rs => {
      const t = getGlossaryTerm(rs);
      return t
        ? `<li><a href="${base()}/glossary/${t.slug}">${escapeHtml(t.term)}</a></li>`
        : "";
    })
    .filter(Boolean)
    .join("");

  const relatedBlogLinks = term.relatedBlogSlugs
    .map(bs => {
      const p = loadBlogPost(bs);
      return p
        ? `<li><a href="${base()}/blog/${p.frontmatter.slug}">${escapeHtml(p.frontmatter.title)}</a></li>`
        : "";
    })
    .filter(Boolean)
    .join("");

  const body = `
    ${breadcrumbHtml([
      { name: "Home", href: `${base()}/` },
      { name: "Glossary", href: `${base()}/glossary` },
      { name: term.term },
    ])}
    <article>
      <header class="page-hero">
        <p class="cat" style="font-size:0.75rem;color:var(--primary);font-weight:600;">${escapeHtml(term.category)}</p>
        <h1>${escapeHtml(term.term)}</h1>
        <p class="excerpt"><strong>Definition:</strong> ${escapeHtml(term.shortDefinition)}</p>
      </header>
      <div class="prose">${termLongHtml(term)}</div>
      ${
        relatedTermLinks
          ? `<div class="related-links"><h3>Related terms</h3><ul>${relatedTermLinks}</ul></div>`
          : ""
      }
      ${
        relatedBlogLinks
          ? `<div class="related-links"><h3>Related guides</h3><ul>${relatedBlogLinks}</ul></div>`
          : ""
      }
      ${toolCtaBlock()}
    </article>`;

  const title =
    term.term.length > 45
      ? `${term.term.slice(0, 42)}...`
      : term.term;

  return renderPage(
    {
      title: `What Is ${title}? | Glossary`,
      description: term.shortDefinition.slice(0, 155),
      canonical: url,
      jsonLdScripts: jsonLd,
    },
    body,
    "glossary"
  );
}
