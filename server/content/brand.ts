/** Server-side Horeca brand constants (mirrors client/src/lib/horeca-brand.ts) */
export const HORECA = {
  name: "Horeca Store",
  tagline: "100,000+ restaurant equipment products",
  email: "sales@thehorecastore.com",
  phone: "866.446.7322",
  phoneHref: "tel:+18664467322",
  website: "https://www.thehorecastore.com",
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663403284701/HwLz9SBGbDEkubjg5ygWVH/horeca-store-logo_8ae0f7bd.png",
  icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663403284701/HwLz9SBGbDEkubjg5ygWVH/favicon-192_49573d7a.png",
  links: {
    cooking: "https://www.thehorecastore.com/commercial-cooking-equipment",
    equipment: "https://www.thehorecastore.com/restaurant-equipment",
    refrigeration: "https://www.thehorecastore.com/commercial-refrigeration-equipment",
    categories: "https://www.thehorecastore.com/all-categories",
    searchOrder: "https://www.thehorecastore.com/order-tracking",
  },
} as const;

export const SITE = {
  name: "Restaurant Site Finder",
  url: process.env.PUBLIC_URL || "https://restaurantsitefinder.com",
  toolCta: "Analyze your location free",
} as const;
