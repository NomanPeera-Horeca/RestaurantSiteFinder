import { loadAllBlogPosts } from "./blog";
import { getAllGlossaryTerms } from "./glossary";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s: string): string {
  return normalize(s).replace(/\s+/g, "-");
}

/** Highest-priority tag → path mappings (path only, no origin). */
const EXPLICIT_LINKS: Record<string, string> = {
  "2026 costs": "/blog/how-much-does-it-cost-to-open-a-restaurant-2026",
  "ai location analysis": "/blog/ai-restaurant-location-analysis",
  "ai market analysis": "/blog/leveraging-ai-restaurant-market-insights",
  "ai restaurant analytics": "/blog/ai-predicts-restaurant-success-before-lease",
  "ai restaurant location analysis": "/blog/ai-restaurant-location-analysis",
  "ai restaurant tools": "/blog/ai-restaurant-location-analysis",
  "ai site selection": "/blog/ai-predicts-restaurant-success-before-lease",
  "anaheim restaurant": "/blog/find-perfect-location-restaurant-opening-california",
  "brand positioning": "/blog/restaurant-concept-development-guide",
  "break even": "/glossary/break-even-point",
  "break-even": "/glossary/break-even-point",
  "buxton": "/blog/buxton-alternative-restaurant-site-finder-review",
  "buxton alternative": "/blog/buxton-alternative-restaurant-site-finder-review",
  "california restaurant location": "/blog/find-perfect-location-restaurant-opening-california",
  "california zoning": "/blog/find-perfect-location-restaurant-opening-california",
  "catchment area": "/glossary/trade-area",
  "commercial kitchen equipment": "/blog/commercial-kitchen-equipment-buying-guide",
  "commercial lease": "/blog/how-to-choose-a-restaurant-location",
  "competition": "/blog/restaurant-competitive-analysis-success",
  "competitive analysis": "/blog/restaurant-competitive-analysis-success",
  "competitive density mapping": "/blog/ai-restaurant-location-analysis",
  "competitive landscape": "/blog/restaurant-competitive-analysis-success",
  "competitor analysis": "/blog/restaurant-competitive-analysis-success",
  "competitor mapping": "/blog/restaurant-competitive-analysis-success",
  "customer personas": "/blog/restaurant-concept-development-guide",
  "data driven restaurants": "/blog/leveraging-data-restaurant-success",
  "data-driven restaurants": "/blog/leveraging-data-restaurant-success",
  "delivery strategy": "/blog/ghost-kitchen-vs-traditional-restaurant",
  "demographic analysis": "/blog/how-restaurant-location-demographics-impact-success",
  "demographics": "/blog/how-restaurant-location-demographics-impact-success",
  "dfw restaurant": "/blog/find-perfect-location-restaurant-opening-texas",
  "equipment budgeting": "/blog/commercial-kitchen-equipment-buying-guide",
  "esri": "/blog/top-tools-finding-restaurant-locations",
  "feasibility": "/blog/go-no-go-restaurant-location-decision",
  "feasibility study": "/blog/go-no-go-restaurant-location-decision",
  "food cost": "/glossary/food-cost-percentage",
  "food industry research": "/blog/effective-strategies-restaurant-market-research",
  "food service analytics": "/blog/how-restaurant-analytics-software-boosts-profits",
  "foot traffic": "/glossary/foot-traffic",
  "foot traffic analysis": "/blog/maximizing-restaurant-success-foot-traffic-insights",
  "foot traffic analytics": "/blog/restaurant-foot-traffic-analysis-ai",
  "foot traffic data": "/blog/restaurant-foot-traffic-analysis-ai",
  "foot traffic forecasting": "/blog/restaurant-foot-traffic-analysis-ai",
  "franchise development": "/blog/restaurant-location-intelligence-franchise-ai-2026",
  "franchise management": "/blog/restaurant-location-intelligence-franchise-ai-2026",
  "geospatial analytics": "/blog/ai-restaurant-location-analysis",
  "geospatial data": "/blog/ai-restaurant-location-analysis",
  "geospatial intelligence": "/blog/restaurant-location-intelligence-beyond-traffic-data",
  "ghost kitchen": "/glossary/ghost-kitchen",
  "go no go": "/blog/go-no-go-restaurant-location-decision",
  "go no go scoring": "/blog/go-no-go-restaurant-location-decision",
  "go no-go scoring": "/blog/go-no-go-restaurant-location-decision",
  "guest experience": "/blog/restaurant-competitive-analysis-success",
  "health department": "/blog/restaurant-permits-licenses-guide",
  "hood systems": "/glossary/hood-system",
  "hospitality analytics": "/blog/how-restaurant-analytics-software-boosts-profits",
  "how to choose a restaurant location": "/blog/how-to-choose-a-restaurant-location",
  "houston restaurant": "/blog/find-perfect-location-restaurant-opening-texas",
  "investor pitch": "/blog/how-to-write-restaurant-business-plan",
  "kitchen design": "/blog/restaurant-equipment-checklist-new-owners",
  "lease negotiation": "/blog/how-to-choose-a-restaurant-location",
  "lease red flags": "/blog/how-to-choose-a-restaurant-location",
  "liquor license": "/glossary/liquor-license",
  "location analysis": "/",
  "location analytics": "/blog/2026-restaurant-location-analytics-buyers-guide",
  "location criteria": "/blog/key-factors-restaurant-location-planning",
  "location intelligence": "/blog/restaurant-location-intelligence-beyond-traffic-data",
  "location strategy": "/blog/restaurant-location-strategy-most-profitable-spot",
  "market analysis": "/blog/restaurant-market-analysis-guide",
  "market research": "/blog/effective-strategies-restaurant-market-research",
  "market saturation": "/blog/restaurant-market-saturation-trends",
  "market share": "/blog/restaurant-market-saturation-trends",
  "menu development": "/blog/restaurant-concept-development-guide",
  "menu engineering": "/glossary/menu-engineering",
  "menu optimization": "/blog/how-restaurant-analytics-software-boosts-profits",
  "multi location management": "/blog/streamlining-growth-restaurant-software-tools",
  "multi-location management": "/blog/streamlining-growth-restaurant-software-tools",
  "multi unit expansion": "/blog/restaurant-location-intelligence-franchise-ai-2026",
  "multi-unit expansion": "/blog/restaurant-location-intelligence-franchise-ai-2026",
  "namelix": "/blog/unique-restaurant-name-generator-tools-reviewed",
  "opening a restaurant": "/blog/restaurant-site-finder-guide-opening-new-restaurant",
  "opening budget": "/blog/how-much-does-it-cost-to-open-a-restaurant-2026",
  "opening checklist": "/blog/restaurant-equipment-checklist-new-owners",
  "pedestrian volume": "/blog/maximizing-restaurant-success-foot-traffic-insights",
  "placer ai": "/blog/placer-ai-alternative-restaurant-site-finder",
  "placer ai alternative": "/blog/placer-ai-alternative-restaurant-site-finder",
  "pos analytics": "/blog/how-restaurant-analytics-software-boosts-profits",
  "pos integration": "/blog/choosing-best-analytics-software-restaurants",
  "predictive analytics": "/blog/ai-predicts-restaurant-success-before-lease",
  "predictive site selection": "/blog/ai-predicts-restaurant-success-before-lease",
  "prime cost": "/glossary/prime-cost",
  "psychographics": "/blog/restaurant-location-intelligence-beyond-traffic-data",
  "rent ratio": "/blog/restaurant-profit-margins-unit-economics",
  "rent to sales ratio": "/blog/restaurant-profit-margins-unit-economics",
  "rent to revenue": "/blog/restaurant-profit-margins-unit-economics",
  "rent-to-revenue": "/blog/restaurant-profit-margins-unit-economics",
  "restaurant analytics": "/blog/how-restaurant-analytics-software-boosts-profits",
  "restaurant analytics software": "/blog/choosing-best-analytics-software-restaurants",
  "restaurant bi software": "/blog/enhancing-restaurant-operations-business-intelligence",
  "restaurant bi tools": "/blog/enhancing-restaurant-operations-business-intelligence",
  "restaurant branding": "/restaurant-name-generator",
  "restaurant business intelligence": "/blog/enhancing-restaurant-operations-business-intelligence",
  "restaurant business plan": "/blog/how-to-write-restaurant-business-plan",
  "restaurant competitor analysis": "/blog/restaurant-competitive-analysis-success",
  "restaurant compliance": "/blog/restaurant-permits-licenses-guide",
  "restaurant concept": "/blog/restaurant-concept-development-guide",
  "restaurant data analysis": "/blog/leveraging-data-restaurant-success",
  "restaurant data analytics": "/blog/top-restaurant-data-analytics-tools-reviewed",
  "restaurant data warehouse": "/blog/enhancing-restaurant-operations-business-intelligence",
  "restaurant demographics": "/blog/how-restaurant-location-demographics-impact-success",
  "restaurant equipment": "/blog/restaurant-equipment-checklist-new-owners",
  "restaurant expansion software": "/blog/streamlining-growth-restaurant-software-tools",
  "restaurant failure rate": "/blog/restaurant-failure-rate",
  "restaurant feasibility": "/blog/go-no-go-restaurant-location-decision",
  "restaurant finance": "/blog/how-to-write-restaurant-business-plan",
  "restaurant financing": "/blog/how-to-write-restaurant-business-plan",
  "restaurant intelligence tools": "/blog/maximizing-profits-restaurant-intelligence-tools",
  "restaurant investment": "/blog/how-much-does-it-cost-to-open-a-restaurant-2026",
  "restaurant kpis": "/blog/leveraging-data-restaurant-success",
  "restaurant licenses": "/blog/restaurant-permits-licenses-guide",
  "restaurant location": "/blog/how-to-choose-a-restaurant-location",
  "restaurant location analysis": "/blog/key-factors-restaurant-location-analysis",
  "restaurant location analytics": "/blog/2026-restaurant-location-analytics-buyers-guide",
  "restaurant location factors": "/blog/restaurant-site-finder-checklist-15-factors",
  "restaurant location intelligence": "/blog/restaurant-location-intelligence-beyond-traffic-data",
  "restaurant location planning": "/blog/key-factors-restaurant-location-planning",
  "restaurant location selection": "/blog/how-to-select-location-start-new-restaurant",
  "restaurant location strategy": "/blog/restaurant-location-strategy-most-profitable-spot",
  "restaurant location tools": "/blog/top-tools-finding-restaurant-locations",
  "restaurant management software": "/blog/choosing-best-analytics-software-restaurants",
  "restaurant market analysis": "/blog/restaurant-market-analysis-guide",
  "restaurant market research": "/blog/effective-strategies-restaurant-market-research",
  "restaurant name generator": "/restaurant-name-generator",
  "restaurant naming": "/restaurant-name-generator",
  "restaurant performance metrics": "/blog/how-restaurant-analytics-software-boosts-profits",
  "restaurant permits": "/blog/restaurant-permits-licenses-guide",
  "restaurant profit margins": "/blog/restaurant-profit-margins-unit-economics",
  "restaurant profitability": "/blog/restaurant-profit-margins-unit-economics",
  "restaurant real estate": "/blog/how-to-choose-a-restaurant-location",
  "restaurant site analysis": "/blog/maximizing-success-restaurant-site-analysis",
  "restaurant site finder": "/",
  "restaurant site selection": "/restaurant-site-selection-analysis",
  "restaurant site selection analysis": "/blog/restaurant-site-selection-analysis",
  "restaurantsitefinder": "/",
  "restaurant startup costs": "/blog/how-much-does-it-cost-to-open-a-restaurant-2026",
  "restaurant statistics": "/blog/restaurant-failure-rate",
  "restaurant strategy": "/blog/restaurant-location-strategies-maximum-profit",
  "restaurant technology": "/blog/streamlining-growth-restaurant-software-tools",
  "site selection": "/blog/how-to-choose-a-restaurant-location",
  "site selection checklist": "/blog/restaurant-site-selection-checklist",
  "site selection criteria": "/blog/key-factors-restaurant-location-planning",
  "site selection guide": "/blog/restaurant-site-finder-comprehensive-guide-2026",
  "site selection software": "/blog/top-tools-finding-restaurant-locations",
  "startup planning": "/blog/how-to-write-restaurant-business-plan",
  "swot": "/blog/restaurant-competitive-analysis-success",
  "swot analysis": "/blog/restaurant-competitive-analysis-success",
  "tenzo": "/blog/top-restaurant-data-analytics-tools-reviewed",
  "texas restaurant location": "/blog/find-perfect-location-restaurant-opening-texas",
  "texas zoning": "/blog/find-perfect-location-restaurant-opening-texas",
  "trade area": "/glossary/trade-area",
  "trade area analysis": "/blog/trade-area-analysis-restaurants",
  "trade area density": "/blog/restaurant-market-saturation-trends",
  "unit economics": "/glossary/unit-economics",
  "upmenu": "/blog/unique-restaurant-name-generator-tools-reviewed",
  "virtual restaurant": "/glossary/virtual-restaurant",
  "why restaurants fail": "/blog/restaurant-failure-rate",
  "working capital": "/blog/how-much-does-it-cost-to-open-a-restaurant-2026",
  "zoning": "/blog/restaurant-permits-licenses-guide",
  "cloud kitchen": "/glossary/cloud-kitchen",
  "commercial kitchen": "/blog/commercial-kitchen-equipment-buying-guide",
  "new restaurant": "/blog/restaurant-site-finder-guide-opening-new-restaurant",
  "new restaurant owners": "/blog/restaurant-equipment-checklist-new-owners",
};

let glossaryIndex: Map<string, string> | null = null;
let blogSlugs: string[] | null = null;

function getGlossaryIndex(): Map<string, string> {
  if (glossaryIndex) return glossaryIndex;
  glossaryIndex = new Map<string, string>();
  for (const term of getAllGlossaryTerms()) {
    glossaryIndex.set(normalize(term.term), term.slug);
    glossaryIndex.set(term.slug.replace(/-/g, " "), term.slug);
  }
  return glossaryIndex;
}

function getBlogSlugs(): string[] {
  if (blogSlugs) return blogSlugs;
  blogSlugs = loadAllBlogPosts().map(p => p.frontmatter.slug);
  return blogSlugs;
}

function findBlogSlug(tag: string): string | null {
  const slug = slugify(tag);
  const slugs = getBlogSlugs();
  if (slugs.includes(slug)) return slug;

  const words = normalize(tag)
    .split(" ")
    .filter(w => w.length > 2);
  if (!words.length) return null;

  const candidates = slugs.filter(bs => words.every(w => bs.includes(w)));
  if (candidates.length) {
    candidates.sort((a, b) => a.length - b.length);
    return candidates[0] ?? null;
  }

  const prefix = slugs.find(bs => bs.startsWith(slug));
  return prefix ?? null;
}

/**
 * Resolve a blog tag or keyword label to an internal site path (e.g. `/blog/foo`).
 * Returns null when no relevant internal page exists.
 */
export function resolveInternalLink(label: string): string | null {
  const key = normalize(label);
  if (!key) return null;

  const explicit = EXPLICIT_LINKS[key];
  if (explicit) return explicit;

  const glossarySlug = getGlossaryIndex().get(key);
  if (glossarySlug) return `/glossary/${glossarySlug}`;

  const blog = findBlogSlug(label);
  if (blog) return `/blog/${blog}`;

  if (key.includes("name generator") || key.includes("restaurant naming")) {
    return "/restaurant-name-generator";
  }
  if (key.includes("site finder")) return "/";
  if (key.includes("site selection") || key.includes("location analysis")) {
    return "/restaurant-site-selection-analysis";
  }

  return null;
}

export function clearInternalLinksCache(): void {
  glossaryIndex = null;
  blogSlugs = null;
}
