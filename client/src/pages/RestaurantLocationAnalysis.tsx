import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnalysisHeroCard } from "@/components/AnalysisHeroCard";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { SiteHeader } from "@/components/SiteHeader";
import { appendConceptToSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import { trpc } from "@/lib/trpc";
import type { ConceptInput } from "../../../shared/concept-options";
import type { InitialScan } from "../../../shared/analysis-types";
import { toast } from "sonner";

const PAGE_TITLE = "Free Restaurant Location Analysis Tool";
const PAGE_DESCRIPTION =
  "Get a free restaurant location analysis for any US address. Opportunity score, competitor density, market demand, concept fit, the data chains use, free for independent owners.";
const CANONICAL_URL = "https://restaurantsitefinder.com/restaurant-location-analysis";

const FAQ_ITEMS = [
  {
    q: "How do I analyze a restaurant location?",
    a: "Enter the address into Restaurant Site Finder's free location analysis tool. It returns an opportunity score from 1 to 10, competitor density within your trade area, market demand data, and a concept fit score based on neighborhood demographics and income levels. The analysis takes under 3 minutes and requires no account or credit card.",
  },
  {
    q: "What data does a restaurant location analysis include?",
    a: "A restaurant location analysis should include: opportunity score for the address, number and type of competitors within the trade area, market demand indicators, demographic data including income and daytime population, concept fit score based on your restaurant type, and a rent stress test showing whether the location is financially viable at your price point.",
  },
  {
    q: "Is restaurant location analysis free?",
    a: "Restaurant Site Finder provides free location analysis for any US address with no subscription required. The basic analysis includes opportunity score, competitor mapping, market demand, and concept fit. Premium features including foot traffic by hour, lease risk checklist, and PDF report download are available for $29 per month.",
  },
  {
    q: "How accurate is restaurant location analysis?",
    a: "Restaurant Site Finder's analysis is based on publicly available market data, demographic data, and business density information for US addresses. It is designed as a research and screening tool to identify high-risk and high-opportunity locations before committing to a lease. It should be used alongside a physical site visit and professional lease review.",
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
    appScript.setAttribute("data-seo", "location-analysis-app");
    appScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Restaurant Location Analysis Tool",
      description:
        "Free AI-powered restaurant location analysis. Provides opportunity score, competitor density, market demand analysis, and concept fit score for any US address.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: CANONICAL_URL,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-seo", "location-analysis-faq");
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
      </ul>
    </section>
  );
}

export default function RestaurantLocationAnalysis() {
  const [, navigate] = useLocation();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const [concept, setConcept] = useState<ConceptInput>(defaultConceptInput);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [prefillAddress, setPrefillAddress] = useState<string | undefined>(undefined);
  const [prefillRevision, setPrefillRevision] = useState(0);
  const conceptTrackedRef = useRef<string>("");

  usePageSeo();

  useEffect(() => {
    captureEvent("location_analysis_page_viewed");
  }, []);

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
        <div className="container max-w-4xl px-4">
          <header className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              Restaurant Location Analysis
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Enter any US address to get an instant opportunity score, competitor density map, market
              demand analysis, and concept fit score. The same location data that national chains pay
              $500 per month for, free for independent restaurant owners.
            </p>
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

          <InternalLinksSection />
        </div>
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
