/** Server-side Horeca brand constants (mirrors client/src/lib/horeca-brand.ts) */
const SITE_BASE = (process.env.PUBLIC_URL || "https://restaurantsitefinder.com").replace(/\/$/, "");

export const HORECA = {
  name: "Horeca Store",
  tagline: "100,000+ restaurant equipment products",
  email: "sales@thehorecastore.com",
  phone: "866.446.7322",
  phoneHref: "tel:+18664467322",
  website: "https://www.thehorecastore.com",
  logo: `${SITE_BASE}/horeca-store-logo.png`,
  icon: `${SITE_BASE}/horeca-store-icon.png`,
  links: {
    cooking: "https://www.thehorecastore.com/commercial-cooking-equipment",
    equipment: "https://www.thehorecastore.com/restaurant-equipment",
    refrigeration: "https://www.thehorecastore.com/commercial-refrigeration-equipment",
    categories: "https://www.thehorecastore.com/all-categories",
    searchOrder: "https://www.thehorecastore.com/order-tracking",
  },
  social: {
    facebook: "https://www.facebook.com/horecastoreamerica",
    linkedin: "https://www.linkedin.com/company/horecastoreamerica",
  },
} as const;

export const SITE = {
  name: "Restaurant Site Finder",
  url: process.env.PUBLIC_URL || "https://restaurantsitefinder.com",
  toolCta: "Analyze your location free",
  ogImage: "/og-image.jpg",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/jpeg",
  ogImageAlt: "Restaurant Site Finder : Free AI Restaurant Location Analysis",
} as const;

export function siteOgImageUrl(baseUrl: string = SITE.url): string {
  return `${baseUrl.replace(/\/$/, "")}${SITE.ogImage}`;
}
