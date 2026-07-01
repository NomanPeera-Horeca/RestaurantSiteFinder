import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnalysisHeroCard } from "@/components/AnalysisHeroCard";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { appendConceptToSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import { trpc } from "@/lib/trpc";
import type { ConceptInput } from "../../../../shared/concept-options";
import type { InitialScan } from "../../../../shared/analysis-types";
import { toast } from "sonner";
import { neighborhoodAnalysisHref, SHARED_CITY_FAQ, type CityLocationPageConfig } from "./city-configs";

function buildFaqItems(config: CityLocationPageConfig) {
  return [
    config.faqMarket,
    config.faqNeighborhoods,
    {
      q: SHARED_CITY_FAQ.freeQuestion,
      a: SHARED_CITY_FAQ.freeAnswer(config.posthogCity),
    },
    {
      q: SHARED_CITY_FAQ.durationQuestion,
      a: SHARED_CITY_FAQ.durationAnswer,
    },
  ];
}

function buildDirectAnswers(config: CityLocationPageConfig) {
  return {
    dataShows: `${config.cityName} has ${config.restaurantCount} restaurants across the metro area, making it one of the ${config.marketDescriptor} restaurant markets in the United States.`,
    whyLocation: `Location determines 60 to 70% of a restaurant's success in ${config.cityName} according to Cornell University research, more than the concept, the chef, or the marketing.`,
    topNeighborhoods: `The strongest neighborhoods for independent restaurants in ${config.cityName} are ${config.topTwoNeighborhoods} based on foot traffic, rent-to-revenue ratio, and demographic match.`,
    howToUse: `Enter any ${config.cityName} address into the tool below to get a free opportunity score, competitor density count, market demand analysis, and concept fit score in under 3 minutes.`,
  };
}

function usePageSeo(config: CityLocationPageConfig, faqItems: ReturnType<typeof buildFaqItems>) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = config.title;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", config.metaDescription);

    let canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href") ?? "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", config.canonical);

    const appScript = document.createElement("script");
    appScript.type = "application/ld+json";
    appScript.setAttribute("data-seo", `city-app-${config.slug}`);
    appScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `Restaurant Location Analysis Tool: ${config.posthogCity}`,
      description: `Free restaurant location analysis for ${config.posthogCity}. Opportunity score, competitor density, market demand, and concept fit for any address.`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: config.canonical,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      areaServed: {
        "@type": "City",
        name: config.posthogCity,
        containedInPlace: {
          "@type": "State",
          name: config.stateName,
        },
      },
    });

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-seo", `city-faq-${config.slug}`);
    faqScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    const speakableScript = document.createElement("script");
    speakableScript.type = "application/ld+json";
    speakableScript.setAttribute("data-seo", `city-speakable-${config.slug}`);
    speakableScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".key-stat", ".direct-answer", ".quick-facts"],
      },
      url: config.canonical,
    });

    document.head.appendChild(appScript);
    document.head.appendChild(faqScript);
    document.head.appendChild(speakableScript);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
      if (canonical) {
        if (previousCanonical) canonical.setAttribute("href", previousCanonical);
        else canonical.remove();
      }
      appScript.remove();
      faqScript.remove();
      speakableScript.remove();
    };
  }, [config, faqItems]);
}

function InternalLinksSection() {
  return (
    <section className="py-16 border-t border-border/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
        More Free Tools for Restaurant Owners
      </h2>
      <ul className="space-y-4 max-w-3xl mx-auto px-4">
        <li>
          <a href="/restaurant-rent-calculator" className="text-primary font-medium hover:underline">
            Restaurant Rent Calculator
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
        <li>
          <a href="/restaurant-location-analysis" className="text-primary font-medium hover:underline">
            All Location Analysis
          </a>
        </li>
      </ul>
    </section>
  );
}

function FaqSection({ config, items }: { config: CityLocationPageConfig; items: ReturnType<typeof buildFaqItems> }) {
  return (
    <section className="py-12 border-t border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        Free {config.cityName} Restaurant Location Analysis FAQ
      </h2>
      <Accordion type="single" collapsible className="max-w-3xl">
        {items.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-semibold text-foreground">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function QuickFactsBox({ config }: { config: CityLocationPageConfig }) {
  return (
    <div className="quick-facts border rounded-lg p-6 bg-muted/30 my-8">
      <h2 className="text-lg font-semibold mb-4">{config.cityName} Restaurant Market: Quick Facts</h2>
      <ul className="space-y-2 text-sm">
        {config.quickFacts.map(fact => (
          <li key={fact.label}>
            <strong>{fact.label}:</strong> {fact.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CityRestaurantLocationPage({ config }: { config: CityLocationPageConfig }) {
  const [, navigate] = useLocation();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const [concept, setConcept] = useState<ConceptInput>(defaultConceptInput);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [prefillAddress, setPrefillAddress] = useState(config.defaultAddress);
  const [prefillRevision, setPrefillRevision] = useState(0);
  const conceptTrackedRef = useRef<string>("");
  const faqItems = useMemo(() => buildFaqItems(config), [config]);
  const directAnswers = useMemo(() => buildDirectAnswers(config), [config]);

  usePageSeo(config, faqItems);

  useEffect(() => {
    captureEvent("city_page_viewed", { city: config.posthogCity });
  }, [config.posthogCity]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get("address");
    if (address) {
      setPrefillAddress(address);
      setPrefillRevision(revision => revision + 1);
    }
  }, []);

  useEffect(() => {
    if (!isConceptReady(concept)) return;
    const key = `${concept.serviceModel}:${concept.cuisineConcept}:${concept.priceTier ?? ""}`;
    if (conceptTrackedRef.current === key) return;
    conceptTrackedRef.current = key;
    captureEvent("concept_selected", {
      service_model: concept.serviceModel,
      cuisine: concept.cuisineConcept ?? "",
      price_tier: concept.priceTier ?? "",
    });
  }, [concept]);

  const initialScan = trpc.analysis.initialScan.useMutation({
    onSuccess: data => {
      setScanData(data);
      captureEvent("initial_scan_completed", {
        competitor_count: data.competitorCount,
        direct_competitor_count: data.directCompetitorCount ?? 0,
        service_model: concept.serviceModel,
        cuisine: concept.cuisineConcept ?? "",
      });
    },
    onError: err => {
      captureEvent("initial_scan_failed", { error: err.message.slice(0, 120) });
      toast.error("Failed to scan location. Please try again.");
      console.error(err);
    },
  });

  const handleAnalyze = (address: string, lat: number, lng: number) => {
    if (!isConceptReady(concept)) {
      toast.error("Please select your restaurant concept before analyzing.");
      return;
    }
    captureEvent("analyze_clicked", {
      service_model: concept.serviceModel,
      cuisine: concept.cuisineConcept ?? "",
    });
    setLocationData({ address, lat, lng });
    initialScan.mutate({ address, lat, lng, concept });
  };

  const handleUnlockReport = () => {
    captureEvent("unlock_report_clicked", {
      competitor_count: scanData?.competitorCount ?? 0,
      direct_competitor_count: scanData?.directCompetitorCount ?? 0,
    });
    setShowLeadModal(true);
  };

  const handleLeadCaptured = (leadId: number) => {
    setShowLeadModal(false);
    if (locationData) {
      const params = new URLSearchParams({
        address: locationData.address,
        lat: String(locationData.lat),
        lng: String(locationData.lng),
        leadId: String(leadId),
      });
      appendConceptToSearchParams(params, concept);
      navigate(`/report?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="location-analysis" />

      <main className="pt-28 pb-20">
        <article className="container max-w-4xl px-4">
          <header className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{config.h1}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">{config.intro}</p>
          </header>

          <AnalysisHeroCard
            concept={concept}
            onConceptChange={setConcept}
            onAnalyze={handleAnalyze}
            isLoading={initialScan.isPending}
            canAnalyze={isConceptReady(concept)}
            prefillAddress={prefillAddress}
            prefillRevision={prefillRevision}
          />

          {scanData && <InitialScanPreview data={scanData} onUnlock={handleUnlockReport} />}

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Restaurant Location Analysis in {config.cityName}: What the Data Shows
            </h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">{directAnswers.dataShows}</p>
            {config.dataShowsBody.map(paragraph => (
              <p key={paragraph.slice(0, 40)} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Why Restaurant Location Matters in {config.cityName}
            </h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">{directAnswers.whyLocation}</p>
            <p className="text-muted-foreground leading-relaxed">{config.marketContent}</p>
            {config.whyLocationBody.map(paragraph => (
              <p key={paragraph.slice(0, 40)} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Top {config.cityName} Neighborhoods for Restaurants
            </h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">{directAnswers.topNeighborhoods}</p>
            <p className="text-sm text-muted-foreground">
              Click a neighborhood to open the analysis tool with that area pre-filled.
            </p>
            <div className="flex flex-wrap gap-2">
              {config.neighborhoods.map(neighborhood => (
                <a
                  key={neighborhood}
                  href={neighborhoodAnalysisHref(neighborhood, config.cityState)}
                  className="inline-flex items-center px-3 py-1 rounded-full border text-sm hover:bg-muted transition-colors"
                >
                  {neighborhood}
                </a>
              ))}
            </div>
            {config.topNeighborhoodsBody.map(paragraph => (
              <p key={paragraph.slice(0, 40)} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>

          <QuickFactsBox config={config} />

          <section className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              How to Use This Tool for {config.cityName} Locations
            </h2>
            <p className="direct-answer text-muted-foreground leading-relaxed">{directAnswers.howToUse}</p>
            {config.howToUseBody.map(paragraph => (
              <p key={paragraph.slice(0, 40)} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>

          <FaqSection config={config} items={faqItems} />
          <InternalLinksSection />
        </article>
      </main>

      {showLeadModal && locationData && (
        <LeadCaptureModal
          address={locationData.address}
          lat={locationData.lat}
          lng={locationData.lng}
          concept={concept}
          onClose={() => setShowLeadModal(false)}
          onCaptured={handleLeadCaptured}
        />
      )}
    </div>
  );
}
