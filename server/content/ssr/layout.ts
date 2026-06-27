import { HORECA, SITE } from "../brand";
import { SSR_STYLES } from "./styles";

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  jsonLdScripts?: string;
  noindex?: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPage(meta: PageMeta, body: string, activeNav?: string): string {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const canonical = escapeHtml(meta.canonical);
  const ogImage = HORECA.logo;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonical}" />
  ${meta.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />'}
  <meta name="author" content="${escapeHtml(HORECA.name)}" />
  <meta property="og:type" content="${meta.ogType ?? "website"}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="theme-color" content="#166534" />
  <link rel="icon" type="image/png" href="${HORECA.icon}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${SSR_STYLES}</style>
  ${meta.jsonLdScripts ?? ""}
</head>
<body>
  <div class="horeca-banner">
    <a href="${HORECA.website}" target="_blank" rel="noopener">A free tool by <strong>${escapeHtml(HORECA.name)}</strong> — ${escapeHtml(HORECA.tagline)}</a>
  </div>
  <header class="site-header">
    <div class="container inner">
      <a href="${SITE.url}/" class="brand">
        <span class="brand-icon" aria-hidden="true">📍</span>
        ${escapeHtml(SITE.name)}
      </a>
      <nav class="nav" aria-label="Main">
        <a href="${SITE.url}/"${activeNav === "home" ? ' class="active"' : ""}>Analyze Location</a>
        <a href="${SITE.url}/blog"${activeNav === "blog" ? ' class="active"' : ""}>Guides</a>
        <a href="${SITE.url}/glossary"${activeNav === "glossary" ? ' class="active"' : ""}>Glossary</a>
        <a href="${HORECA.website}" target="_blank" rel="noopener" class="horeca-logo">
          <img src="${HORECA.logo}" alt="${escapeHtml(HORECA.name)} logo" width="120" height="28" loading="lazy" />
        </a>
      </nav>
    </div>
  </header>
  <main>
    <div class="container">
      ${body}
    </div>
  </main>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <strong>${escapeHtml(SITE.name)}</strong>
          <p style="font-size:0.875rem;color:var(--muted);margin:0.75rem 0 0;">Free AI restaurant location analysis by <a href="${HORECA.website}">${escapeHtml(HORECA.name)}</a>.</p>
        </div>
        <div>
          <h3>Resources</h3>
          <ul>
            <li><a href="${SITE.url}/blog">Restaurant Guides</a></li>
            <li><a href="${SITE.url}/glossary">Industry Glossary</a></li>
            <li><a href="${SITE.url}/how-to-choose-restaurant-location">How to Choose a Location</a></li>
            <li><a href="${SITE.url}/about">About</a></li>
            <li><a href="${SITE.url}/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3>${escapeHtml(HORECA.name)}</h3>
          <ul>
            <li><a href="${HORECA.links.equipment}">Restaurant Equipment</a></li>
            <li><a href="${HORECA.links.cooking}">Commercial Cooking</a></li>
            <li><a href="mailto:${HORECA.email}">${HORECA.email}</a></li>
            <li><a href="${HORECA.phoneHref}">${HORECA.phone}</a></li>
          </ul>
        </div>
        <div>
          <h3>Legal</h3>
          <ul>
            <li><a href="${SITE.url}/privacy">Privacy Policy</a></li>
            <li><a href="${SITE.url}/terms">Terms of Service</a></li>
          </ul>
          <h3 style="margin-top:1.5rem;">Follow ${escapeHtml(HORECA.name)}</h3>
          <ul>
            <li><a href="${HORECA.social.facebook}" target="_blank" rel="noopener">Facebook</a></li>
            <li><a href="${HORECA.social.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(HORECA.name)}. ${escapeHtml(SITE.name)} is a free tool for restaurant owners.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function toolCtaBlock(): string {
  return `
  <div class="cta-box">
    <h2>Run a free location analysis</h2>
    <p>Enter any address to get competitor mapping, market gaps, opportunity scoring, and concept ideas.</p>
    <a href="${SITE.url}/" class="btn btn-primary">${escapeHtml(SITE.toolCta)}</a>
    <a href="${HORECA.links.equipment}" class="btn btn-outline" target="_blank" rel="noopener">Shop equipment at ${escapeHtml(HORECA.name)}</a>
  </div>`;
}

export function breadcrumbHtml(items: { name: string; href?: string }[]): string {
  const parts = items.map((item, i) => {
    if (item.href && i < items.length - 1) {
      return `<a href="${item.href}">${escapeHtml(item.name)}</a>`;
    }
    return `<span>${escapeHtml(item.name)}</span>`;
  });
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join(" <span>/</span> ")}</nav>`;
}
