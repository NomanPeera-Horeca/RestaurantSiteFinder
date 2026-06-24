export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "go-no-go-restaurant-location-decision",
    title: "Mastering Go/No-Go Restaurant Location Decision",
    excerpt: "Use a formal Go/No-Go framework, site scoring matrix, and non-negotiable criteria to decide whether a location fits your concept before you sign.",
    date: "2026-06-06",
    category: "Site Selection",
    readTime: "8 min",
  },
  {
    slug: "restaurant-location-strategies-maximum-profit",
    title: "Restaurant Location Strategies for Maximum Profit",
    excerpt: "Balance urban versus suburban trade-offs, anchor tenants, rent versus visibility, and feasibility math to position your restaurant for maximum profit.",
    date: "2026-06-05",
    category: "Site Selection",
    readTime: "8 min",
  },
  {
    slug: "restaurant-market-saturation-trends",
    title: "Understanding Restaurant Market Saturation Trends",
    excerpt: "Evaluate supply versus demand in your trade area, benchmark competitors, and find gaps that let you thrive even in crowded dining corridors.",
    date: "2026-06-04",
    category: "Site Selection",
    readTime: "7 min",
  },
  {
    slug: "trade-area-analysis-restaurants",
    title: "Understanding Trade Area Analysis for Restaurants",
    excerpt: "Map your restaurant trade area with primary, secondary, and tertiary zones—and learn why circles lie but drive-time polygons tell the truth.",
    date: "2026-06-03",
    category: "Site Selection",
    readTime: "7 min",
  },
  {
    slug: "choosing-perfect-spot-restaurants",
    title: "Choosing the Perfect Spot for Restaurants",
    excerpt: "Learn how to evaluate visibility, traffic quality, demographics, competition, and rent before signing a restaurant lease.",
    date: "2026-06-02",
    category: "Site Selection",
    readTime: "8 min",
  },
  {
    slug: "restaurant-site-selection-checklist",
    title: "Restaurant Site Selection: Ultimate Checklist Guide",
    excerpt: "Use this comprehensive restaurant site selection checklist to evaluate demographics, competition, zoning, lease terms, and property condition before you sign a lease.",
    date: "2026-06-01",
    category: "Site Selection",
    readTime: "10 min",
  },
  {
    slug: "how-to-choose-restaurant-location",
    title: "How to Choose a Restaurant Location: A Data-Driven Site Selection Guide",
    excerpt: "Choosing where to open is the highest-leverage decision in restaurant development. This guide walks through trade areas, rent economics, and due diligence so you sign a lease with confidence.",
    date: "2026-05-01",
    category: "Site Selection",
    readTime: "12 min",
  },
  {
    slug: "restaurant-market-analysis-guide",
    title: "Restaurant Market Analysis: How to Validate Demand Before You Sign",
    excerpt: "A market analysis turns gut feel into a go/no-go decision. Learn how to size demand, map competitors, and forecast sales that survive banker and investor scrutiny.",
    date: "2026-05-10",
    category: "Site Selection",
    readTime: "10 min",
  },
];

export default blogArticles;
