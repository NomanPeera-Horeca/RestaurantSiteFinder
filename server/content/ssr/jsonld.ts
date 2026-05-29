import { HORECA, SITE } from "../brand";
import type { BlogFaq, BlogFrontmatter, BreadcrumbItem } from "../types";

function orgRef() {
  return {
    "@type": "Organization",
    name: HORECA.name,
    url: HORECA.website,
    logo: HORECA.logo,
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageJsonLd(faq: BlogFaq[]): object | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function blogPostingJsonLd(
  fm: BlogFrontmatter,
  url: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: fm.title,
    description: fm.metaDescription,
    image: HORECA.logo,
    author: orgRef(),
    publisher: {
      ...orgRef(),
      "@type": "Organization",
    },
    datePublished: fm.date,
    dateModified: fm.lastModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: fm.keywords.join(", "),
  };
}

export function collectionPageJsonLd(url: string, name: string, description: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    publisher: orgRef(),
  };
}

export function definedTermSetJsonLd(baseUrl: string, termCount: number): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Restaurant Industry & Commercial Kitchen Glossary",
    description: `${termCount} definitions for restaurant operations and commercial kitchen equipment terms.`,
    url: `${baseUrl}/glossary`,
    publisher: orgRef(),
  };
}

export function definedTermJsonLd(
  term: string,
  slug: string,
  description: string,
  baseUrl: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term,
    description,
    url: `${baseUrl}/glossary/${slug}`,
    inDefinedTermSet: `${baseUrl}/glossary`,
  };
}

export function scriptsFromJsonLd(...objects: (object | null)[]): string {
  return objects
    .filter(Boolean)
    .map(
      o =>
        `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`
    )
    .join("\n");
}

export { SITE };
