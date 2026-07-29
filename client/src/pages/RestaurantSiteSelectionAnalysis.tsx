import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AnalysisHeroCard } from "@/components/AnalysisHeroCard";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitMySaasFooter } from "@/components/SubmitMySaasFooter";
import { appendConceptToSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { trpc } from "@/lib/trpc";
import type { ConceptInput } from "../../../shared/concept-options";
import type { InitialScan } from "../../../shared/analysis-types";
import { toast } from "sonner";
import { CheckCircle2, MapPin, BarChart3, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const CANONICAL = "https://restaurantsitefinder.com/restaurant-site-selection-analysis";

const ANALYSIS_FACTORS = [
  {
    title: "Demographics & Psychographics",
    body: "Population density, median household income, age distribution, and lifestyle segments determine whether enough of your target diners live or work within your trade area.",
  },
  {
    title: "Foot Traffic & Visibility",
    body: "Raw pedestrian counts, drive-by visibility, parking access, and daypart patterns reveal when customers are actually near your front door, not just whether they exist nearby.",
  },
  {
    title: "Competitive Density",
    body: "Mapping direct and indirect competitors within a 1–3 mile radius shows whether the market is underserved, saturated, or dominated by a single concept type.",
  },
  {
    title: "Trade Area Modeling",
    body: "True catchment analysis goes beyond census rings to show where your customers actually come from based on mobility and spending data.",
  },
  {
    title: "Rent-to-Revenue Ratio",
    body: "A strong location with rent above 8–10% of projected revenue can still fail. Site analysis must stress-test your pro forma against local lease costs.",
  },
  {
    title: "Concept-Market Fit",
    body: "The same address can be perfect for fast-casual lunch traffic and wrong for fine dining. Scoring must match your specific restaurant concept to local demand.",
  },
];

export default function RestaurantSiteSelectionAnalysis() {
  const [, navigate] = useLocation();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const [concept, setConcept] = useState<ConceptInput>(defaultConceptInput);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);

  useEffect(() => {
    document.title = "Restaurant Site Selection Analysis: Free AI Location Scoring Tool";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Run a free restaurant site selection analysis on any US address. Get opportunity scores, competitor density, demographic match, and GO/NO-GO recommendations before you sign a lease."
      );
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", CANONICAL);
  }, []);

  const initialScan = trpc.analysis.initialScan.useMutation({
    onSuccess: data => setScanData(data),
    onError: () => toast.error("Failed to scan location. Please try again."),
  });

  const handleAnalyze = (address: string, lat: number, lng: number) => {
    if (!isConceptReady(concept)) {
      toast.error("Please select your restaurant concept before analyzing.");
      return;
    }
    setLocationData({ address, lat, lng });
    initialScan.mutate({ address, lat, lng, concept });
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
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader active="home" />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <header className="text-center mb-10 space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Site Selection</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Restaurant Site Selection Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Evaluate any restaurant location with AI-powered scoring, competitor mapping, and
              demographic analysis: the same data national chains pay thousands for, free for
              independent operators.
            </p>
          </header>

          <AnalysisHeroCard
            concept={concept}
            onConceptChange={setConcept}
            onAnalyze={handleAnalyze}
            isLoading={initialScan.isPending}
            canAnalyze={isConceptReady(concept)}
          />

          {scanData && (
            <InitialScanPreview data={scanData} onUnlock={() => setShowLeadModal(true)} />
          )}

          <section className="mt-14 space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              What Restaurant Site Selection Analysis Covers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Restaurant site selection analysis is the systematic evaluation of a potential location
              before you commit to a lease. Cornell University research shows location accounts for 60
              to 70 percent of a restaurant&apos;s success, more than menu, chef, or marketing
              combined. A thorough analysis replaces gut feel with data on who lives nearby, how they
              move, what they spend, and whether the market can support your concept.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ANALYSIS_FACTORS.map(factor => (
                <div key={factor.title} className="rounded-lg border border-border p-4 bg-card">
                  <h3 className="font-semibold text-foreground mb-2">{factor.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{factor.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              How the GO/NO-GO Score Works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our analysis engine combines Google Places data, demographic signals, and competitive
              density to produce an opportunity score from 0 to 100. Scores above 75 typically
              indicate strong market fit. Scores between 50 and 75 warrant deeper due diligence on
              rent, visibility, and parking. Below 50, the location likely needs a different concept
              or a different address entirely.
            </p>
            <ul className="space-y-2">
              {[
                "Competitor density within 1-mile and 3-mile radii",
                "Demographic match to your target customer profile",
                "Market gap detection for underserved cuisine types",
                "Concept fit scoring based on local dining patterns",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              When to Run Site Selection Analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Run analysis at three critical decision points: when your broker sends a shortlist of
              addresses, before signing a letter of intent, and when comparing two finalist locations
              side by side. Catching a weak trade area before lease signing saves six figures in
              build-out costs and years of underperformance.
            </p>
          </section>

          <section className="mt-14 rounded-xl border border-border bg-muted/30 p-8 text-center space-y-4">
            <BookOpen className="h-8 w-8 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Read the Full 2,000-Word Guide</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our comprehensive blog covers the complete restaurant site selection framework,
              including trade area modeling, competitive analysis, and a step-by-step checklist.
            </p>
            <Button asChild variant="outline">
              <a href="/blog/restaurant-site-selection-analysis">Read the Full Guide</a>
            </Button>
          </section>
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

      <SubmitMySaasFooter />
    </div>
  );
}
