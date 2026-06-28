import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { captureEvent } from "@/lib/posthog";
import { ArrowRight, MapPin } from "lucide-react";

const PAGE_TITLE = "Restaurant Failure Rate: The Real Statistics (2024–2025)";
const PAGE_DESCRIPTION =
  "The real restaurant failure rate data: about 60% fail in year 1, 80% within 5 years. See what actually causes restaurants to close and how to avoid the #1 mistake.";
const CANONICAL_URL = "https://restaurantsitefinder.com/restaurant-failure-rate";

const FAQ_ITEMS = [
  {
    q: "What percentage of restaurants fail in the first year?",
    a: "Approximately 60% of restaurants fail in their first year, according to Cornell University research. The commonly cited '90% fail in year one' figure is a myth that has been debunked by multiple academic studies. The real failure rate is serious enough without exaggeration. Roughly 3 in 5 new restaurants don't survive year one.",
  },
  {
    q: "What is the #1 reason restaurants fail?",
    a: "The #1 reason restaurants fail is location, which accounts for 60-70% of a restaurant's performance variance according to Cornell University's School of Hotel Administration. A wrong location (mismatched demographics, excessive competition, or rent too high relative to realistic revenue) almost always leads to closure regardless of food quality.",
  },
  {
    q: "How do you calculate if a restaurant location is viable?",
    a: "To calculate restaurant location viability, check four metrics: (1) rent as a percentage of projected gross revenue: must be under 8% to be sustainable, (2) competition density: direct competitors within your trade area, (3) demographic match: neighborhood income and daytime population relative to your concept, (4) foot traffic quality at your peak hours. Restaurant Site Finder calculates all four automatically for any US address, free.",
  },
  {
    q: "Do restaurants in good locations still fail?",
    a: "Yes, restaurants in good locations still fail, but significantly less often than those in poor locations. A good location reduces the required execution quality to survive. A bad location requires near-perfect execution just to break even. Most restaurant owners don't have the capital runway to execute perfectly for 18+ months while waiting for a bad location to improve.",
  },
  {
    q: "How much does restaurant site selection research cost?",
    a: "Professional restaurant site selection research costs $50,000–$200,000 per location for enterprise chains. Tools like SiteZeus and Placer.ai charge $500–$2,000/month for software access. Restaurant Site Finder provides the core location analysis (competitor mapping, market demand, concept fit, opportunity score) for free.",
  },
  {
    q: "What is a good opportunity score for a restaurant location?",
    a: "A good restaurant location opportunity score is 7 or above on Restaurant Site Finder's 1–10 scale. Scores of 5–6 indicate a viable but competitive market that requires the right concept fit. Scores below 5 indicate significant headwinds: either too much competition, insufficient market demand, or poor concept-market fit for the analyzed area.",
  },
] as const;

const FAILURE_CAUSES = [
  {
    title: "Wrong Location",
    body: "Location accounts for 60–70% of a restaurant's success variance according to Cornell University research. A great concept in the wrong location almost always fails. The inverse is also true: a mediocre concept in a high-traffic, well-matched location often survives. 80% of restaurants in mismatched locations fail within 3 years regardless of food quality.",
  },
  {
    title: "Rent Too High Relative to Revenue",
    body: "The industry benchmark is rent at 5–8% of gross revenue. Most failed restaurants were paying 12–15% or more. At that ratio, a single slow month becomes a survival crisis. The problem is almost always locked in on the day the lease is signed.",
  },
  {
    title: "Undercapitalization",
    body: "The average restaurant requires 12–18 months to reach consistent profitability. Most owners budget for 3–6 months of operating losses. Running out of runway before reaching break-even is the most common cause of year-one closures.",
  },
  {
    title: "Concept-Market Mismatch",
    body: "Opening a fine dining concept in a neighborhood with median household income under $50,000, or a fast casual in an area with no lunch traffic: these are survivable mistakes only if the owner has enough capital to wait. Most don't.",
  },
  {
    title: "Ignoring Competition Density",
    body: "Areas with more than 20 restaurants per square mile have a 25% higher failure rate for new entrants. Market saturation is measurable before you sign. Most owners never check.",
  },
  {
    title: "No Parking or Poor Visibility",
    body: "38% of independent restaurant owners cite poor location visibility and limited parking as a primary factor in their financial struggles. Both are observable on a site visit and unfixable after signing.",
  },
] as const;

const FAILURE_BY_YEAR = [
  { year: "End of Year 1", rate: "~60%" },
  { year: "End of Year 2", rate: "~70%" },
  { year: "End of Year 3", rate: "~75%" },
  { year: "End of Year 5", rate: "~80%" },
  { year: "End of Year 10", rate: "~90%" },
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

    let robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute("content") ?? "";
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "index, follow");

    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.setAttribute("data-seo", "failure-rate-article");
    articleScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Restaurant Failure Rate: The Real Statistics (2024–2025)",
      description:
        "Comprehensive data on restaurant failure rates, causes, and how location impacts survival.",
      author: {
        "@type": "Organization",
        name: "Restaurant Site Finder",
        url: "https://restaurantsitefinder.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Horeca Store",
        url: "https://www.thehorecastore.com",
      },
      datePublished: "2025-01-01",
      dateModified: "2026-06-27",
    });

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-seo", "failure-rate-faq");
    faqScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    const speakableScript = document.createElement("script");
    speakableScript.type = "application/ld+json";
    speakableScript.setAttribute("data-seo", "failure-rate-speakable");
    speakableScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".key-stat", ".direct-answer"],
      },
      url: CANONICAL_URL,
    });

    document.head.appendChild(articleScript);
    document.head.appendChild(faqScript);
    document.head.appendChild(speakableScript);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
      if (canonical) {
        if (previousCanonical) canonical.setAttribute("href", previousCanonical);
        else canonical.remove();
      }
      if (robots) {
        if (previousRobots) robots.setAttribute("content", previousRobots);
        else robots.remove();
      }
      articleScript.remove();
      faqScript.remove();
      speakableScript.remove();
    };
  }, []);
}

export default function RestaurantFailureRate() {
  usePageSeo();

  useEffect(() => {
    captureEvent("failure_rate_page_viewed");
  }, []);

  const handleCtaClick = () => {
    captureEvent("failure_rate_cta_clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="failure-rate" />

      <main className="pt-28 pb-20">
        <article className="container max-w-[800px] mx-auto px-4">
          {/* Hero */}
          <header className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              Restaurant Failure Rate: The Real Statistics
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              What the data actually says, and the #1 factor most owners never check before signing a
              lease.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
            {[
              { value: "60%", label: "fail in year 1" },
              { value: "80%", label: "fail within 5 years" },
              { value: "91,500", label: "closed in 2024 alone" },
            ].map(stat => (
              <Card key={stat.label} className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <p className="key-stat text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mb-8">
            Sources: National Restaurant Association, Cornell University School of Hotel Administration,
            Kalibrate Research 2024
          </p>

          <div className="quick-facts border rounded-lg p-6 bg-muted/30 my-8">
            <h2 className="text-lg font-semibold mb-4">Restaurant Failure Rate: Quick Facts</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Year 1 failure rate:</strong> ~60% (Cornell University)
              </li>
              <li>
                <strong>5-year failure rate:</strong> ~80% (NRA composite)
              </li>
              <li>
                <strong>Restaurants closed in 2024:</strong> 91,500 (Kalibrate)
              </li>
              <li>
                <strong>#1 cause of failure:</strong> Location (Cornell Hospitality Quarterly)
              </li>
              <li>
                <strong>Location&apos;s impact:</strong> 60-70% of success variance (Cornell)
              </li>
              <li>
                <strong>Safe rent benchmark:</strong> 5-8% of gross revenue (NRA)
              </li>
              <li>
                <strong>Unprofitable operators in 2026:</strong> 42% (NRA State of the Industry)
              </li>
            </ul>
          </div>

          {/* Section 1 */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What Is the Real Restaurant Failure Rate?</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Approximately 60% of restaurants fail in their first year, not 90%, as commonly cited. The 90%
              figure has been debunked by Cornell University researchers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              According to the National Restaurant Association and Cornell University research:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>Approximately 60% of restaurants close within their first year of operation</li>
              <li>Around 80% close within five years</li>
              <li>In 2024, an estimated 91,500 restaurants closed across the United States (Kalibrate)</li>
              <li>42% of restaurant operators reported being unprofitable entering 2026 (NRA State of the Industry)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These numbers have remained consistent for decades. The restaurant business is genuinely
              difficult, but the reasons restaurants fail are more predictable than most people realize.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Why Do Restaurants Fail? The Real Causes</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              The #1 reason restaurants fail is location, accounting for 60-70% of performance variance
              according to Cornell University&apos;s School of Hotel Administration.
            </p>
            <ol className="space-y-6">
              {FAILURE_CAUSES.map((item, i) => (
                <li key={item.title} className="space-y-2">
                  <p className="font-semibold text-foreground">
                    {i + 1}. {item.title}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Section 3 */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Restaurant Failure Rate by Year</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Restaurant failure rates peak in year one, with approximately 60% of new restaurants closing
              before their first anniversary.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Year</TableHead>
                    <TableHead className="font-semibold">Cumulative Failure Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAILURE_BY_YEAR.map(row => (
                    <TableRow key={row.year}>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Cornell University School of Hotel Administration / NRA composite data
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The steepest drop happens in year one, which is why the decisions made before opening
              (location, lease terms, concept fit) matter more than anything that happens after. By the
              time a location problem becomes obvious, the owner is already locked into a multi-year lease.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">How Location Affects Restaurant Survival</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Location is the single strongest predictor of restaurant survival, responsible for 60-70% of
              performance variance in Cornell University research.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The specific location factors that predict failure:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>Trade area population too small for the concept&apos;s required customer volume</li>
              <li>
                Daytime vs. nighttime population mismatch (a dinner concept in a business district that
                empties at 5pm)
              </li>
              <li>Competition density above the market absorption rate</li>
              <li>Rent-to-revenue ratio above 10% at realistic volume</li>
              <li>No anchor businesses driving foot traffic</li>
              <li>Declining neighborhood trajectory</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              All of these are measurable before signing a lease. Most restaurant owners make location
              decisions based on gut feel, broker recommendations, or proximity to where they live.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">The Data Most Restaurant Owners Never See</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Enterprise chains spend $50,000-$200,000 per location on site selection research. Independent
              restaurant owners typically spend $0.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Tools like SiteZeus and Placer.ai provide this data, but at $500–$2,000 per month,
              they&apos;re designed for chains running 20+ location evaluations per year, not an owner
              opening their first restaurant.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Restaurant Site Finder was built to close that gap. The same location analysis that enterprise
              chains run (competitor density, market demand, concept fit, opportunity scoring) available
              free for any restaurant owner, for any address in the US.
            </p>

            <Card className="border-primary/30 bg-primary/5 mt-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Check your location before you sign
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Free analysis. No credit card. Takes 3 minutes.
                </p>
                <a href="/#restaurant-location-analysis" onClick={handleCtaClick}>
                  <Button size="lg" className="rounded-xl font-semibold">
                    Run Free Location Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Internal links */}
          <section className="border-t border-border/50 pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              More Guides for Restaurant Owners
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="/"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Location Analysis</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Check opportunity score, competitor density, and market demand for any US address. Free.
                </p>
              </a>
              <a
                href="/restaurant-name-generator"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Name Generator</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find an available name, check the .com domain, and lock in your brand before you open.
                </p>
              </a>
              <a
                href="/#rent-calculator"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Rent Calculator</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find out if you can afford a location before you talk to a broker.
                </p>
              </a>
            </div>
          </section>
        </article>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Restaurant Site Finder</span>
          </div>
          <a href="/" className="hover:text-primary transition-colors">
            Back to location analysis
          </a>
        </div>
      </footer>
    </div>
  );
}
