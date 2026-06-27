import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RentCalculator } from "@/components/RentCalculator";
import { captureEvent } from "@/lib/posthog";

const PAGE_TITLE = "Free Restaurant Rent Calculator: Know Before You Sign";
const PAGE_DESCRIPTION =
  "Calculate if you can afford a restaurant location before signing the lease. Enter your monthly rent and see your break-even covers, table turns, and risk rating. Free tool by Restaurant Site Finder.";
const CANONICAL_URL = "https://restaurantsitefinder.com/restaurant-rent-calculator";

const FAQ_ITEMS = [
  {
    q: "What percentage of revenue should restaurant rent be?",
    a: "Restaurant rent should be 5 to 8% of gross revenue according to the National Restaurant Association benchmark. If rent exceeds 10% of revenue, the location is considered high risk. Above 12% and most restaurant concepts cannot survive a slow month.",
  },
  {
    q: "How do I calculate if I can afford a restaurant location?",
    a: "Divide your monthly rent by 0.08 to find the minimum monthly revenue you need to keep rent at 8% of sales. Then divide that by your average check size and days open per month to find required daily covers. If that number exceeds 70% of your seating capacity at 2.5 turns per day, the location is likely too expensive for your concept.",
  },
  {
    q: "What is a good rent-to-revenue ratio for a restaurant?",
    a: "A rent-to-revenue ratio under 8% is considered healthy. Between 8 and 10% is workable but tight. Above 10% is high risk, and above 12% most restaurant operators cannot sustain the location through normal slow periods.",
  },
  {
    q: "How many table turns per day does a restaurant need?",
    a: "Most casual dining restaurants target 2 to 3 table turns per day. Fast casual and QSR concepts target 4 to 6 turns. If your break-even calculation requires more than 3 turns for a full-service concept, your rent is too high relative to your concept's realistic volume.",
  },
] as const;

function usePageSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);

    let canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href") ?? "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", CANONICAL_URL);

    const appScript = document.createElement("script");
    appScript.type = "application/ld+json";
    appScript.setAttribute("data-seo", "rent-calculator-app");
    appScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Restaurant Rent Calculator",
      description:
        "Free calculator that shows restaurant owners if they can afford a location. Calculates required monthly revenue, daily covers, table turns, and rent risk rating.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: CANONICAL_URL,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-seo", "rent-calculator-faq");
    faqScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    document.head.appendChild(appScript);
    document.head.appendChild(faqScript);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
      if (canonical) {
        if (previousCanonical) canonical.setAttribute("href", previousCanonical);
        else canonical.remove();
      }
      appScript.remove();
      faqScript.remove();
    };
  }, []);
}

function InternalLinksSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
        More Free Tools for Restaurant Owners
      </h2>
      <ul className="space-y-4 max-w-3xl mx-auto">
        <li>
          <a href="/" className="text-primary font-medium hover:underline">
            Restaurant Location Analysis
          </a>
        </li>
        <li>
          <a href="/restaurant-failure-rate" className="text-primary font-medium hover:underline">
            Restaurant Failure Rate Data
          </a>
        </li>
        <li>
          <a href="/restaurant-name-generator" className="text-primary font-medium hover:underline">
            Restaurant Name Generator
          </a>
        </li>
      </ul>
    </section>
  );
}

export default function RestaurantRentCalculator() {
  usePageSeo();

  useEffect(() => {
    captureEvent("rent_calculator_page_viewed");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="rent-calculator" />

      <main className="pt-28 pb-20">
        <div className="container max-w-5xl px-4">
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              Restaurant Rent Calculator
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Rent is the #1 fixed cost that kills restaurants. The industry benchmark is 5 to 8% of
              gross revenue. Enter your monthly rent below to find out exactly how many covers you need
              per day to survive before you talk to a broker.
            </p>
          </header>

          <RentCalculator />

          <InternalLinksSection />
        </div>
      </main>
    </div>
  );
}
