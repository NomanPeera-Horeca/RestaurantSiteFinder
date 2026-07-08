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
            <li><a href="${SITE.url}/about">About</a></li>
            <li><a href="${SITE.url}/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3>Legal</h3>
          <ul>
            <li><a href="${SITE.url}/privacy">Privacy Policy</a></li>
            <li><a href="${SITE.url}/terms">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3>Follow ${escapeHtml(HORECA.name)}</h3>
          <ul>
            <li><a href="${HORECA.social.facebook}" target="_blank" rel="noopener">Facebook</a></li>
            <li><a href="${HORECA.social.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
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
      </div>
      ${featuredAtBlock()}
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(HORECA.name)}. ${escapeHtml(SITE.name)} is a free tool for restaurant owners.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function featuredAtBlock(): string {
  return `
  <div class="featured-at">
    <p class="featured-at-label">Featured At</p>
    <div class="featured-at-badges">
      <a href="https://submitaitools.org" target="_blank" rel="noopener noreferrer">
        <img src="https://submitaitools.org/static_submitaitools/images/submitaitools.png" alt="Submit AI Tools" width="200" height="60" loading="lazy" style="border-radius: 10px; width: 200px; height: 60px;" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://findly.tools/restaurant-site-finder?utm_source=restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="175" height="55" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.aitoolzdir.com" target="_blank" rel="noopener noreferrer" class="featured-at-link">AI Toolz Dir</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://fazier.com" target="_blank" rel="noopener noreferrer">
        <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light" width="120" alt="Fazier badge" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://turbo0.com/item/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" loading="lazy" style="height: 54px; width: auto;" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://wired.business" target="_blank" rel="noopener noreferrer">
        <img src="https://wired.business/badge0-white.svg" alt="Featured on Wired Business" width="200" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://open-launch.com/projects/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://open-launch.com/api/badge/7193c6a8-bb4f-4668-af13-da78d0d7a545/featured-light.svg" alt="Featured on Open-Launch" width="200" height="50" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.superlaun.ch/products/2795" target="_blank" rel="noopener noreferrer">
        <img src="https://www.superlaun.ch/badge.png" alt="Featured on Super Launch" width="300" height="300" loading="lazy" style="height: 54px; width: auto;" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.voomo.ai/" target="_blank" rel="noopener noreferrer" class="featured-at-link">AI Corporate Video Maker</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://backlinkhubs.com/?utm_source=badge&utm_medium=embed&utm_campaign=restaurantsitefinder-com" target="_blank" rel="noopener noreferrer">
        <img src="https://backlinkhubs.com/badge.svg?theme=light&label=Listed%20on%20Backlinkhubs" alt="Listed on Backlinkhubs" loading="lazy" style="height: 54px; width: auto;" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://marketingdb.live" target="_blank" rel="noopener noreferrer nofollow sponsored">
        <img src="https://marketingdb.live/badge.svg" alt="Listed on MarketingDB" width="190" height="44" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://z-image.net/" target="_blank" rel="noopener noreferrer" class="featured-at-link">Z-Image</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://dang.ai" target="_blank" rel="dofollow noopener" style="display:inline-block;text-decoration:none;">
        <img src="https://assets.dang.ai/badges/dang-verified-dark.png" alt="Verified on DANG!" width="260" height="94" loading="lazy" style="display:block;width:260px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://aitooltrek.com" target="_blank" rel="noopener noreferrer" title="AI Tool Trek" class="featured-at-link">AI Tool Trek</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.launchvault.dev" target="_blank" rel="noopener noreferrer" title="Featured on LaunchVault">
        <img src="https://www.launchvault.dev/images/badges/launch-valut-badge.svg" alt="Featured on LaunchVault" loading="lazy" style="width: 195px; height: auto;" />
      </a>
    </div>
  </div>`;
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
