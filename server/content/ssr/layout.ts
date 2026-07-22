import { HORECA, SITE, siteOgImageUrl } from "../brand";
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
  const ogImage = siteOgImageUrl();

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
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:type" content="${SITE.ogImageType}" />
  <meta property="og:image:width" content="${SITE.ogImageWidth}" />
  <meta property="og:image:height" content="${SITE.ogImageHeight}" />
  <meta property="og:image:alt" content="${escapeHtml(SITE.ogImageAlt)}" />
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(SITE.ogImageAlt)}" />
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
  const items = featuredAtItemsHtml();
  return `
  <div class="featured-at">
    <p class="featured-at-label">Featured At</p>
    <div class="featured-at-marquee">
      <div class="featured-at-marquee-track">
        <div class="featured-at-marquee-set">${items}</div>
        <div class="featured-at-marquee-set" aria-hidden="true">${items}</div>
      </div>
    </div>
  </div>`;
}

function featuredAtItemsHtml(): string {
  return `
      <a href="https://submitaitools.org" target="_blank" rel="noopener noreferrer">
        <img src="https://submitaitools.org/static_submitaitools/images/submitaitools.png" alt="Submit AI Tools" width="200" height="60" loading="lazy" />
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
        <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" loading="lazy" />
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
        <img src="https://www.superlaun.ch/badge.png" alt="Featured on Super Launch" width="300" height="300" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.voomo.ai/" target="_blank" rel="noopener noreferrer" class="featured-at-link">AI Corporate Video Maker</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://backlinkhubs.com/?utm_source=badge&utm_medium=embed&utm_campaign=restaurantsitefinder-com" target="_blank" rel="noopener noreferrer">
        <img src="https://backlinkhubs.com/badge.svg?theme=light&label=Listed%20on%20Backlinkhubs" alt="Listed on Backlinkhubs" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://marketingdb.live" target="_blank" rel="noopener noreferrer nofollow sponsored">
        <img src="https://marketingdb.live/badge.svg" alt="Listed on MarketingDB" width="190" height="44" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://z-image.net/" target="_blank" rel="noopener noreferrer" class="featured-at-link">Z-Image</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://dang.ai" target="_blank" rel="dofollow noopener">
        <img src="https://assets.dang.ai/badges/dang-verified-dark.png" alt="Verified on DANG!" width="260" height="94" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://aitooltrek.com" target="_blank" rel="noopener noreferrer" title="AI Tool Trek" class="featured-at-link">AI Tool Trek</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.launchvault.dev" target="_blank" rel="noopener noreferrer" title="Featured on LaunchVault">
        <img src="https://www.launchvault.dev/images/badges/launch-valut-badge.svg" alt="Featured on LaunchVault" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://huzzler.so/products/7xDqGxdOvl/restaurant-site-finder?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing" target="_blank" rel="noopener noreferrer">
        <img alt="Huzzler Embed Badge" src="https://huzzler.so/assets/images/embeddable-badges/featured.png" width="159" height="55" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://launchboard.dev" target="_blank" rel="noopener">
        <img src="https://launchboard.dev/launchboard-badge.png" alt="Launched on LaunchBoard - Product Launch Platform" width="240" height="60" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.foundrlist.com/product/restaurantsitefinder?utm_source=badge&amp;utm_medium=embed" target="_blank" rel="noopener">
        <img src="https://www.foundrlist.com/api/badge/restaurantsitefinder" alt="Featured on FoundrList" width="150" height="48" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://trylaunch.ai/launch/restaurant-site-finder" target="_blank" rel="dofollow">
        <img src="https://trylaunch.ai/badges/badge-color.png" alt="Featured on Launch" height="53" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://proofstories.io/directory/products/restaurant-site-finder/" target="_blank" rel="noopener">
        <img src="https://proofstories.io/directory/badges/l/restaurant-site-finder.svg" alt="Listed on ProofStories" height="44" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://saaspa.ge/product/cmrc3d7r5000bjr04deu8y1n5" target="_blank" rel="nofollow">
        <img src="https://saaspa.ge/api/embed/product/cmrc3d7r5000bjr04deu8y1n5/badge.png?theme=orange" alt="Featured on Saaspa.ge" width="200" height="60" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://indiehunt.io/project/restaurant-site-finder-by-horeca-store" target="_blank" rel="noopener">
        <img src="https://indiehunt.io/badges/indiehunt-badge-light.svg" alt="Featured on IndieHunt" width="265" height="58" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.freewebsubmission.com" target="_blank" rel="noopener noreferrer">
        <img src="https://www.freewebsubmission.com/images/fwsbutton11.gif" alt="Submit Your Site To The Web's Top 50 Search Engines for Free!" width="88" height="31" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.tinystartups.com/startup/restaurant-site-finder-2" target="_blank" rel="noopener" title="Launched on Tiny Startups" class="featured-at-tiny-startups" aria-label="Launched on Tiny Startups">
        <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="tsg" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0%" stop-color="#3525E6" /><stop offset="55%" stop-color="#D81FE0" /><stop offset="100%" stop-color="#22B8F0" /></linearGradient></defs><path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsg)" /></svg>
        <span class="featured-at-tiny-startups-copy"><span class="featured-at-tiny-startups-eyebrow">Launched on</span><span class="featured-at-tiny-startups-name">Tiny Startups</span></span>
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://aitop10.tools/" target="_blank" rel="noopener noreferrer" class="featured-at-link">AiTop10 Tools</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://indieai.directory/" target="_blank" rel="noopener noreferrer" class="featured-at-link">Listed on IndieAI Directory</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://dayslaunch.com" target="_blank" rel="noopener noreferrer">
        <img src="https://dayslaunch.com/badages-awards.svg" alt="Featured on Days Launch" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://starterbest.com" target="_blank" rel="noopener noreferrer">
        <img src="https://starterbest.com/badages-awards.svg" alt="Featured on Starter Best" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://theonestartup.com" target="_blank" rel="noopener noreferrer">
        <img src="https://theonestartup.com/badages-awards.svg" alt="Featured on The One Startup" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://saasfame.com/item/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://saasfame.com/badge-light.svg" alt="Featured on saasfame.com" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://goodaitools.com/ai/restaurantsitefinder" target="_blank" rel="noopener noreferrer">
        <img src="https://goodaitools.com/assets/images/badge-dark.png" alt="Good AI Tools" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://drchecker.net/item/restaurantsitefinder.com" target="_blank" rel="noopener noreferrer">
        <img src="https://drchecker.net/api/badge?domain=restaurantsitefinder.com" alt="DR Checker - Domain Rating" width="200" height="120" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://dofollow.tools" target="_blank" rel="noopener noreferrer">
        <img src="https://dofollow.tools/badge/badge_transparent.svg" alt="Featured on Dofollow.Tools" width="200" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://similarlabs.com" target="_blank" rel="noopener noreferrer">
        <img src="https://similarlabs.com/similarlabs-embed-badge-light.svg" alt="List on Similarlabs" width="124" height="40" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://animatephoto.io" target="_blank" rel="noopener noreferrer" class="featured-at-link">Animate Photo AI</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://submithunt.com" target="_blank" rel="noopener noreferrer">
        <img src="https://submithunt.com/badge-light.svg" alt="Featured on Submit Hunt" width="240" height="66" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://earlyhunt.com/project/restaurant-site-finder" target="_blank" rel="noopener">
        <img src="https://earlyhunt.com/badges/earlyhunt-badge-light.svg" alt="Featured on EarlyHunt" width="265" height="58" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://saasgrow.app?ref=restaurantsitefinder.com" target="_blank" rel="noopener">
        <img src="https://saasgrow.app/api/badge?type=featured&style=blue" alt="Restaurant Site Finder on SaaSGrow" width="240" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://famed.tools/products/free-restaurant-location-analysis-tool?utm_source=famed.tools" target="_blank" rel="noopener">
        <img src="https://famed.tools/badges/famed-tools-badge-light.svg" alt="Featured on famed.tools" width="150" height="48" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://auraplusplus.com/projects/ai-powered-restaurant-location-analysis" target="_blank" rel="noopener">
        <img src="https://auraplusplus.com/images/badges/featured-on-light.svg" alt="Featured on Aura++" width="265" height="58" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://toolfio.com" target="_blank" rel="dofollow">
        <img src="https://toolfio.com/toolfio-light-badge.png" alt="Featured on Toolfio" width="200" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://shipstry.com/" target="_blank" rel="noopener noreferrer">
        <img src="https://shipstry.com/badges/featured.svg" alt="Featured on Shipstry" width="220" height="52" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.startupinspire.com" target="_blank" rel="noopener noreferrer">
        <img src="https://www.startupinspire.com/images/badge_1.svg" alt="Featured on Startup Inspire" width="200" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://aitoolfame.com/item/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://aitoolfame.com/badge-light.svg" alt="Featured on aitoolfame.com" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://toolfame.com/item/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://toolfame.com/badge-light.svg" alt="Featured on toolfame.com" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://allinai.tools" target="_blank" rel="noopener noreferrer" title="All The Best AI Tools" class="featured-at-link">All in AI Tools</a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://daniellaunches.com" target="_blank" rel="noopener noreferrer">
        <img src="https://daniellaunches.com/badge-light.svg" alt="Featured on DanielLaunches" width="220" height="48" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://www.listbulb.com/tools/restaurantsitefinder" target="_blank" rel="noopener">
        <img src="https://www.listbulb.com/featured-on-listbulb-light.svg" alt="Featured on ListBulb" width="240" height="240" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://startupbase.io/products/restaurant-site-finder-3?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light" target="_blank" rel="noopener noreferrer">
        <img src="https://statics.startupbase.io/site/badges/launched-on-sb.svg" alt="Launched on StartupBase" width="175" height="55" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://lemonlaunch.dev/saas/restaurant-site-finder" target="_blank" rel="noopener">
        <img src="https://lemonlaunch.dev/badge/lemonlaunch-badge-light.svg" alt="Featured on LemonLaunch" width="188" height="56" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://submitmysaas.com" target="_blank" rel="noopener noreferrer">
        <img src="https://submitmysaas.com/featured-badge.png" alt="Featured on SubmitMySaas" width="175" height="54" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://aijustbetter.com/item/restaurantsitefinder.com" target="_blank" rel="noopener">
        <img src="https://cdn.aijustbetter.com/badges/badge-dark.svg" alt="Featured on AIJustBetter.com" width="212" height="55" loading="lazy" />
      </a>
      <span class="featured-at-separator" aria-hidden="true">·</span>
      <a href="https://geoly.net/item/restaurant-site-finder" target="_blank" rel="noopener noreferrer">
        <img src="https://geoly.net/badge-light.svg" alt="Featured on geoly.net" width="175" height="54" loading="lazy" />
      </a>`;
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
