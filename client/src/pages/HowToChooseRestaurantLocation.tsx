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
import { captureEvent } from "@/lib/posthog";
import { ArrowRight, MapPin } from "lucide-react";

const PAGE_TITLE = "How to Choose a Restaurant Location: The Complete Guide (2025)";
const PAGE_DESCRIPTION =
  "How to choose a restaurant location: the 7 data points to check before signing a lease, the rent formula every owner needs, and the free tool that runs the analysis in 3 minutes.";
const CANONICAL_URL = "https://restaurantsitefinder.com/how-to-choose-restaurant-location";

const FAQ_ITEMS = [
  {
    q: "What is the most important factor when choosing a restaurant location?",
    a: "Demographic match between your concept and the neighborhood is the most important factor when choosing a restaurant location. A fine dining concept needs a trade area with median household income above $80,000 and dinner-going habits. A fast casual lunch concept needs daytime population density from offices or schools. According to Cornell University research, location accounts for 60 to 70% of a restaurant's performance variance, more than the food, the chef, or the marketing.",
  },
  {
    q: "How do you calculate if you can afford a restaurant location?",
    a: "To calculate whether you can afford a restaurant location, divide your annual rent by your projected gross annual revenue. The result must be 8% or lower to be sustainable long-term. Industry benchmark: rent at 5 to 8% of gross revenue (National Restaurant Association). Example: if your space costs $5,000 per month ($60,000 per year) and you project $600,000 in annual revenue, rent is exactly 10%, which is too high for most independent operators. Use the free Restaurant Rent Calculator at restaurantsitefinder.com/restaurant-rent-calculator to run this math for any address.",
  },
  {
    q: "How many competitors is too many in a restaurant trade area?",
    a: "More than 20 direct competitors within your trade area increases failure risk by 25% for new entrants, based on market saturation research. The key word is direct: a pizza concept competing against 20 pizza restaurants faces a very different market than 20 restaurants of mixed cuisine types. Restaurant Site Finder maps your direct competitor count by cuisine type, not total restaurant count.",
  },
  {
    q: "What is a restaurant trade area?",
    a: "A restaurant trade area is the geographic zone from which a restaurant draws the majority of its customers. For quick service and fast casual restaurants, the trade area is typically a 1 to 3 minute drive time or a 0.5 mile radius. For casual dining, 5 to 10 minutes. For fine dining and destination concepts, 15 to 20 minutes. Trade area size depends on concept type, not city size. In dense urban markets, the effective trade area shrinks because alternatives are closer.",
  },
  {
    q: "Should I choose a restaurant location based on rent alone?",
    a: "No. Choosing a restaurant location based on rent alone is one of the most common mistakes independent operators make. A lower rent in a location with poor demographics, low foot traffic, or high direct competition produces worse financial results than a higher rent in a well-matched location. The correct variable to optimize is rent as a percentage of realistic revenue, not rent in absolute dollars.",
  },
  {
    q: "How long does restaurant location research take?",
    a: "Professional restaurant location research for enterprise chains takes 60 to 90 days and costs $50,000 to $200,000 per site. For independent owners using Restaurant Site Finder, the initial location screening takes under 3 minutes per address. Use the tool to eliminate bad locations quickly, then spend your time and money on the two or three addresses that pass the initial screen.",
  },
  {
    q: "What data should I gather before signing a restaurant lease?",
    a: "Before signing a restaurant lease, gather: (1) opportunity score from a location analysis tool, (2) direct competitor count by cuisine type within your trade area, (3) daytime and evening population density, (4) rent-to-revenue ratio at your realistic volume, (5) walk score or pedestrian count if you depend on foot traffic, (6) parking availability relative to your format, (7) neighborhood growth trajectory based on permit data and new development. Restaurant Site Finder provides items 1 through 4 for free for any US address.",
  },
] as const;

const LOCATION_FACTORS = [
  {
    step: "1",
    title: "Demographic Match",
    body: "The neighborhood's income level, age distribution, and dining habits must match your concept. A $90 tasting menu requires a trade area with household incomes above $100,000 and a culture of dining out for special occasions. A $12 lunch counter needs office density and workers who eat out daily. Check median household income, daytime population count, and the existing successful restaurants in the area: they already validated that the market buys what they sell.",
  },
  {
    step: "2",
    title: "Rent-to-Revenue Ratio",
    body: "The National Restaurant Association benchmark is rent at 5 to 8% of gross revenue. Above 10% creates chronic cash flow problems. Calculate this before you fall in love with a space. Take your annual rent (base rent plus NNN charges), divide by your realistic annual revenue projection, multiply by 100. If the result is above 8, renegotiate or walk away. Use the Restaurant Rent Calculator at restaurantsitefinder.com/restaurant-rent-calculator to run this math in under 60 seconds.",
  },
  {
    step: "3",
    title: "Direct Competitor Density",
    body: "Count the direct competitors within your trade area, not all restaurants. A sushi concept opening next to 8 other sushi restaurants faces a different market than a sushi concept with none nearby. Areas with more than 20 direct competitors per square mile have a 25% higher failure rate for new entrants. Restaurant Site Finder maps your direct competitor count by cuisine type and service model automatically.",
  },
  {
    step: "4",
    title: "Foot Traffic Pattern",
    body: "Match your concept to the neighborhood's traffic pattern. Lunch-focused concepts need daytime office or school population. Dinner concepts need residents with disposable income within a short drive. A brunch concept without weekend foot traffic is fighting the location instead of riding it. Visit your candidate location at 7am, 12pm, 6pm, and 10pm on both a weekday and a weekend before signing.",
  },
  {
    step: "5",
    title: "Visibility and Access",
    body: "38% of independent restaurant owners cite poor visibility and limited parking as primary factors in their financial struggles (NRA). In walkable urban markets, signage visibility from the sidewalk matters. In suburban markets, visibility from the arterial road and adequate parking both matter. Neither is fixable after you sign the lease. Assess both on your site visit.",
  },
  {
    step: "6",
    title: "Neighborhood Trajectory",
    body: "A neighborhood that is declining adds long-term risk to any lease. A neighborhood that is improving may offer below-market rent now with rising traffic ahead. Look for new construction permits, new retail tenants, and incoming residential development within a half mile. Conversely, look for vacant storefronts, declining anchor businesses, and population loss signals. Your lease outlasts a snapshot: the trajectory matters as much as today.",
  },
  {
    step: "7",
    title: "Lease Terms and Exit Risk",
    body: "Location analysis is incomplete without lease analysis. A 10-year personal guarantee on a weak location is a different risk than a 3-year lease with renewal options. Check: personal guarantee length, CAM charge caps, build-out allowance structure, permitted use clause (which cuisines and service models are allowed), and subletting rights. Many independent operators negotiate better lease terms after arriving with data: a market analysis showing competitor density and realistic revenue projections changes the conversation with landlords.",
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
    articleScript.setAttribute("data-seo", "how-to-choose-article");
    articleScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Choose a Restaurant Location: The Complete Guide (2025)",
      description:
        "The 7 data points every restaurant owner must check before signing a lease, including rent formula, competitor density, and demographic match.",
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
    faqScript.setAttribute("data-seo", "how-to-choose-faq");
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
    speakableScript.setAttribute("data-seo", "how-to-choose-speakable");
    speakableScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".key-stat", ".direct-answer", ".quick-facts"],
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

export default function HowToChooseRestaurantLocation() {
  usePageSeo();

  useEffect(() => {
    captureEvent("how_to_choose_location_page_viewed");
  }, []);

  const handleCtaClick = () => {
    captureEvent("how_to_choose_cta_clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="failure-rate" />

      <main className="pt-28 pb-20">
        <article className="container max-w-[800px] mx-auto px-4">
          <header className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              How to Choose a Restaurant Location
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The 7 data points every restaurant owner must check before signing a lease. Based on Cornell University and NRA research.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
            {[
              { value: "60 to 70%", label: "of restaurant success determined by location" },
              { value: "8%", label: "max rent-to-revenue ratio before signing" },
              { value: "3 min", label: "to run a free location analysis" },
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
            Sources: Cornell University School of Hotel Administration, National Restaurant Association
          </p>

          <div className="quick-facts border rounded-lg p-6 bg-muted/30 my-8">
            <h2 className="text-lg font-semibold mb-4">How to Choose a Restaurant Location: Quick Reference</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>Location impact on success:</strong> 60 to 70% of performance variance (Cornell)</li>
              <li><strong>Safe rent benchmark:</strong> 5 to 8% of gross revenue (NRA)</li>
              <li><strong>Direct competitor threshold:</strong> more than 20 in your trade area increases failure risk 25%</li>
              <li><strong>Trade area for fast casual:</strong> 1 to 3 minute drive time or 0.5 mile radius</li>
              <li><strong>Trade area for casual dining:</strong> 5 to 10 minute drive time</li>
              <li><strong>Site visits required:</strong> minimum 4 (7am, 12pm, 6pm, 10pm on weekday and weekend)</li>
              <li><strong>Enterprise site selection cost:</strong> $50,000 to $200,000 per location</li>
              <li><strong>Free alternative:</strong> Restaurant Site Finder (restaurantsitefinder.com)</li>
            </ul>
          </div>

          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Why Restaurant Location Is the Most Important Decision You Will Make</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Location accounts for 60 to 70% of a restaurant's success variance according to Cornell University's School of Hotel Administration, more than the food quality, the chef's credentials, or the marketing budget.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That number explains why restaurant chains spend $50,000 to $200,000 per location on site selection research before signing a lease. It also explains why independent owners who skip location analysis fail at twice the rate of those who do it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The lease locks in your location for 5 to 10 years. The food can change. The chef can change. The marketing can change. The location cannot. Getting it wrong on day one means fighting the location for the entire lease term instead of building a business.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This guide covers the 7 specific data points you need to check before signing. Each one is measurable. None of them require a $200,000 research budget.
            </p>
          </section>

          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">The 7 Factors That Determine Restaurant Location Success</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              The seven factors below cover everything a professional site selection analysis checks: demographics, rent economics, competition, traffic, access, trajectory, and lease terms.
            </p>
            <ol className="space-y-8">
              {LOCATION_FACTORS.map(item => (
                <li key={item.step} className="space-y-2">
                  <p className="font-semibold text-foreground text-lg">
                    {item.step}. {item.title}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">The Rent Formula Every Restaurant Owner Must Know</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Rent must be 8% or less of your gross annual revenue to be financially sustainable for most independent restaurants.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The formula:
            </p>
            <div className="bg-muted/40 border rounded-lg p-6 font-mono text-sm space-y-2">
              <p>Annual rent / projected annual revenue x 100 = rent percentage</p>
              <p className="text-muted-foreground">Example: $72,000 / $900,000 x 100 = 8%</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Most restaurant operators focus on the monthly rent figure. That is the wrong number. A $6,000 per month space for a restaurant projecting $50,000 per month in revenue has a rent ratio of 12%, which means the operator starts every month already behind. A $9,000 per month space for a restaurant projecting $150,000 per month has a rent ratio of 6%, which is manageable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Run this calculation for every location before you tour it. If the math does not work at realistic volume, no amount of enthusiasm for the space changes the outcome.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Use the free{" "}
              <a href="/restaurant-rent-calculator" className="text-primary font-medium hover:underline">
                Restaurant Rent Calculator
              </a>{" "}
              to run this calculation for any address in under 60 seconds.
            </p>
          </section>

          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">The 3 Most Common Restaurant Location Mistakes</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              The three mistakes below account for the majority of preventable location failures. All three are avoidable with data.
            </p>
            <ol className="space-y-6">
              <li className="space-y-2">
                <p className="font-semibold text-foreground">1. Choosing Based on Low Rent Instead of Low Rent-to-Revenue Ratio</p>
                <p className="text-muted-foreground leading-relaxed">
                  A cheap space in a low-traffic area produces worse financial results than an expensive space in a high-traffic, well-matched location. The only number that matters is rent as a percentage of realistic revenue. Calculate it before you tour.
                </p>
              </li>
              <li className="space-y-2">
                <p className="font-semibold text-foreground">2. Trusting a Broker's Foot Traffic Claims Without Verification</p>
                <p className="text-muted-foreground leading-relaxed">
                  Brokers represent landlords. Their traffic numbers come from the landlord's marketing materials. Visit the location yourself at four different times: morning, lunch, dinner, and late evening on both a weekday and a weekend. The difference between a Tuesday lunch count and a Saturday evening count can be the difference between survival and closure.
                </p>
              </li>
              <li className="space-y-2">
                <p className="font-semibold text-foreground">3. Skipping Concept-Market Fit Analysis</p>
                <p className="text-muted-foreground leading-relaxed">
                  The neighborhood already tells you what it buys. Look at the restaurants that are succeeding in your target area: their average check, cuisine type, and service model are data points, not coincidences. If no one in the neighborhood is running a concept like yours successfully, that is a signal worth investigating before you sign.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">How to Run a Free Restaurant Location Analysis in 3 Minutes</h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">
              Restaurant Site Finder provides free location analysis for any US address: opportunity score, competitor density, market demand, and concept fit in under 3 minutes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The same core data points that enterprise chains get from SiteZeus ($500 per month) and Placer.ai ($2,000 per month) are available free for independent owners. No credit card required. No account setup. Enter the address, select your concept type, and get a full analysis.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>Go to <a href="/restaurant-location-analysis" className="text-primary font-medium hover:underline">restaurantsitefinder.com/restaurant-location-analysis</a></li>
              <li>Enter the street address of the location you are evaluating</li>
              <li>Select your service model (fast casual, full service, bar) and cuisine type</li>
              <li>Submit your email to unlock the full report</li>
              <li>Review opportunity score, competitor count, and concept fit rating</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed">
              Use the tool to eliminate bad locations quickly. Run 5 to 10 addresses through the analysis in a single afternoon before scheduling any broker tours. The goal is to arrive at every tour with data, not just enthusiasm.
            </p>

            <Card className="border-primary/30 bg-primary/5 mt-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Check your location before you sign
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Free analysis. No credit card. Takes 3 minutes.
                </p>
                <a href="/restaurant-location-analysis" onClick={handleCtaClick}>
                  <Button size="lg" className="rounded-xl font-semibold">
                    Run Free Location Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

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

          <section className="border-t border-border/50 pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Free Tools for Restaurant Owners
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="/restaurant-location-analysis"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Location Analysis</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Opportunity score, competitor density, and market demand for any US address. Free.
                </p>
              </a>
              <a
                href="/restaurant-rent-calculator"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Rent Calculator</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Calculate rent-to-revenue ratio for any location before you talk to a broker.
                </p>
              </a>
              <a
                href="/restaurant-failure-rate"
                className="block rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <p className="font-semibold text-foreground mb-2">Restaurant Failure Rate Data</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The real statistics on why restaurants fail and what the data says about location.
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
