import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { AnalysisHeroCard } from "@/components/AnalysisHeroCard";
import { RentCalculator } from "@/components/RentCalculator";
import { PricingSection } from "@/components/PricingSection";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { trpc } from "@/lib/trpc";
import { appendConceptToSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import type { ConceptInput } from "../../../shared/concept-options";
import type { InitialScan } from "../../../shared/analysis-types";
import { HORECA } from "@/lib/horeca-brand";
import { toast } from "sonner";
import { PromoBannerStrip } from "@/components/PromoBanners";
import { SocialShare } from "@/components/SocialShare";
import { blogArticles } from "@/lib/blog-data";
import {
  MapPin, BarChart3, Lightbulb, ShoppingCart,
  ChevronRight, Star, TrendingUp, Shield,
  CheckCircle2, Building2, Phone, Mail,
  Package, Truck, HeadphonesIcon, Award,
  ArrowRight, ExternalLink, HelpCircle, BookOpen, Clock, Tag,
  Paintbrush, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [, navigate] = useLocation();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const [concept, setConcept] = useState<ConceptInput>(defaultConceptInput);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const conceptTrackedRef = React.useRef<string>("");

  React.useEffect(() => {
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

  // Track page view (fire once on mount)
  const trackEvent = trpc.lead.trackEvent.useMutation();
  const trackedRef = React.useRef(false);
  React.useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent.mutate({ type: "page_view", page: "/", details: document.referrer || "direct" });
    }
  });

  const initialScan = trpc.analysis.initialScan.useMutation({
    onSuccess: (data) => {
      setScanData(data);
      captureEvent("initial_scan_completed", {
        competitor_count: data.competitorCount,
        direct_competitor_count: data.directCompetitorCount ?? 0,
        service_model: concept.serviceModel,
        cuisine: concept.cuisineConcept ?? "",
      });
    },
    onError: (err) => {
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
      <SiteHeader active="home" />

      {/* Horeca Store Top Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[oklch(0.35_0.15_145)] to-[oklch(0.40_0.12_155)] text-white text-center py-1.5 text-xs sm:text-sm">
        <a
          href={HORECA.website}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 hover:underline px-4"
        >
          <Package className="h-3.5 w-3.5 shrink-0 hidden sm:block" />
          <span>A free tool by <strong>Horeca Store</strong>. Browse 100,000+ restaurant equipment products</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 hidden sm:block" />
        </a>
      </div>

      {/* Hero Section */}
      <section id="restaurant-location-analysis" className="relative pt-44 sm:pt-40 pb-20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-chart-3/5 rounded-full blur-3xl" />

        <div className="relative container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              Used by 1,200+ restaurant owners · 100% free · No credit card
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
              Don't sign that lease until you run the numbers.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The average failed restaurant loses <strong className="text-foreground">$275,000</strong>. Most owners pick a location on gut feel and pay for it. In 3 minutes, this tool tells you exactly whether your concept will win or lose at a specific address. Free. No broker needed.
            </p>

            <AnalysisHeroCard
              concept={concept}
              onConceptChange={setConcept}
              onAnalyze={handleAnalyze}
              isLoading={initialScan.isPending}
              canAnalyze={isConceptReady(concept)}
            />
            <p className="text-sm text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
              Built by the team at{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                Horeca Store
              </a>{" "}
              , restaurant equipment specialists
            </p>
          </div>
        </div>
      </section>

      {/* Initial Scan Preview */}
      {scanData && (
        <InitialScanPreview
          data={scanData}
          onUnlock={handleUnlockReport}
        />
      )}

      {/* Horeca Store Trust Badges */}
      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { icon: Package, text: "100,000+ Products" },
              { icon: Truck, text: "Fast Nationwide Shipping" },
              { icon: Award, text: "Trusted Brands" },
              { icon: HeadphonesIcon, text: "Expert Support" },
            ].map((badge) => (
              <a
                key={badge.text}
                href={HORECA.website}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.text}</span>
              </a>
            ))}
            <a
              href={HORECA.website}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2"
            >
              <img src={HORECA.logo} alt="Horeca Store" className="h-5 opacity-60 hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              The data most restaurant owners never see
            </h2>
            <p className="text-muted-foreground">Until it&apos;s too late.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                stat: "60–70%",
                label: "of restaurant success is determined by location alone",
                source: "Cornell University",
              },
              {
                stat: "80%",
                label: "of restaurants in mismatched locations fail within 3 years",
                source: "Cornell Hospitality Quarterly",
              },
              {
                stat: "91,500",
                label: "restaurants closed in the US last year (location cited in most)",
                source: "Kalibrate / NRA 2024",
              },
            ].map((item) => (
              <Card key={item.stat} className="border-border/50 bg-card">
                <CardContent className="p-6 flex flex-col h-full">
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-3">{item.stat}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border/50">
                    Source: {item.source}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <RentCalculator />

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How 1,200+ owners avoided the #1 restaurant mistake
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Location kills more restaurants than bad food does. Here&apos;s how to know before you sign, then get your equipment from{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: MapPin,
                step: "01",
                title: "Tell us what you're opening",
                desc: "Fast casual burger spot? Sushi bar? Ghost kitchen? Pick your concept so the analysis is calibrated to your actual competition, not every restaurant within a mile.",
              },
              {
                icon: BarChart3,
                step: "02",
                title: "Enter the address you're considering",
                desc: "We scan every competitor nearby, pull their ratings and reviews, and detect which cuisines are oversaturated vs. wide open. Takes 60 seconds.",
              },
              {
                icon: ShoppingCart,
                step: "03",
                title: "Get a verdict you can act on",
                desc: "GO or NO-GO. Three winning concept recommendations. A custom equipment list from Horeca Store. Everything you need to decide, or walk away.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl font-bold text-primary/10 absolute top-4 right-6">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What you get that no broker will ever tell you
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Site selection consultants charge $5,000+ for this. SiteZeus costs $500/month. You get it free because{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>{" "}
              built it for the restaurant community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Building2, title: "Competitor Snapshot", desc: "Every restaurant within your trade area: names, ratings, price tier, and distance. See exactly who you're fighting for the same customers." },
              { icon: TrendingUp, title: "Market Gap Detection", desc: "AI scans thousands of reviews to find what customers are desperately searching for and not finding near your address." },
              { icon: Star, title: "3 Winning Concepts", desc: "Specific restaurant concepts that have a real chance in that market, complete with menu direction, risk score, and GO/NO-GO for each." },
              { icon: ShoppingCart, title: "Equipment Checklist", desc: "A custom list of every piece of commercial kitchen equipment you'll need, with direct links to buy from Horeca Store." },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Horeca Store Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <a href={HORECA.website} target="_blank" rel="noopener">
                  <img
                    src={HORECA.logo}
                    alt="Horeca Store - Restaurant Supply Store & Commercial Equipment"
                    className="h-12 mb-6 hover:opacity-80 transition-opacity"
                  />
                </a>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Horeca Store?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-semibold">Horeca Store</a> is
                  the fastest-growing online restaurant-supply company in the United States. Whether you're opening your first restaurant or expanding an
                  existing chain, Horeca Store stocks over 100,000 products from trusted brands like True, Vulcan, Hoshizaki, Rational, Atosa, Cambro, and more.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  From <a href={HORECA.links.cooking} target="_blank" rel="noopener" className="text-primary hover:underline">commercial cooking equipment</a> and
                  refrigeration to food prep tables, shelving, and smallwares. <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a> is
                  your one-stop destination for everything you need to open and run a successful restaurant.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={HORECA.website} target="_blank" rel="noopener">
                    <Button className="h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Shop Horeca Store
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <a href={HORECA.links.categories} target="_blank" rel="noopener">
                    <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold">
                      Browse All Categories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Package, title: "100,000+ Products In Stock", desc: "Commercial ovens, refrigerators, fryers, grills, prep tables, shelving, and more" },
                  { icon: Award, title: "Trusted Industry Brands", desc: "True, Vulcan, Hoshizaki, Rational, Atosa, Cambro, Empero, Chef Master" },
                  { icon: Truck, title: "Fast Nationwide Delivery", desc: "Shipping across all 50 states with warehouse locations for quick fulfillment" },
                  { icon: HeadphonesIcon, title: "Expert Restaurant Support", desc: "Dedicated team to help new restaurant owners choose the right equipment" },
                ].map((item) => (
                  <Card key={item.title} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section - Rich text for Google */}
      <section className="py-16 bg-muted/20">
        <div className="container max-w-4xl">
          <article className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Why we built this and made it free
            </h2>
            <p className="leading-relaxed mb-4">
              At <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-semibold">Horeca Store</a>,
              we sell equipment to restaurant owners every day. We&apos;ve watched people pour their life savings into a location and close 8 months later
              because five identical concepts were already fighting for the same lunch crowd three blocks away.
              The data that could have saved them existed. It was just locked behind $5,000 consulting fees and enterprise SaaS tools that small operators can&apos;t afford.
            </p>
            <p className="leading-relaxed mb-4">
              That didn't sit right with us. So our team built Restaurant Site Finder. It uses AI to scan nearby competitors using
              Google Places data, extract review sentiment to identify what customers love and hate, detect saturated and underserved
              cuisine types, and generate three winning restaurant concepts tailored to the specific market gaps in your chosen area.
              Each concept comes with specific menu ideas, a risk score, and a personalized equipment checklist. See our{" "}
              <a href="/blog/how-to-choose-restaurant-location" className="text-primary hover:underline">site selection guide</a> and{" "}
              <a href="/glossary/trade-area" className="text-primary hover:underline">trade area</a> glossary for the methodology behind the scores.
            </p>
            <p className="leading-relaxed mb-4">
              Whether you're a first-time restaurateur or an experienced operator scouting new locations,
              you deserve the same quality analysis that big restaurant groups get. When you're ready to move forward,{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a> has the
              commercial kitchen equipment to match your winning concept, from opening guides in our{" "}
              <a href="/blog/restaurant-equipment-checklist-new-owners" className="text-primary hover:underline">equipment checklist</a> to{" "}
              <a href="/glossary/ghost-kitchen" className="text-primary hover:underline">ghost kitchen</a> and traditional formats.
            </p>
          </article>
        </div>
      </section>

      {/* GEO Section: city targeting for LLM and local SEO */}
      <section className="py-12 bg-muted/10 border-y border-border/50">
        <div className="container max-w-4xl">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest text-center mb-4">
            Available in every U.S. city
          </p>
          <h2 className="text-xl font-bold text-foreground text-center mb-3">
            Analyze any restaurant location in the United States
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-6">
            Whether you&apos;re opening in Houston, Dallas, New York, Chicago, Los Angeles, Miami, Phoenix, Austin,
            Atlanta, or any city in between. Enter any U.S. address and get your GO / NO-GO in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Houston", "Dallas", "New York", "Chicago", "Los Angeles",
              "Miami", "Phoenix", "Austin", "Atlanta", "Seattle",
              "Denver", "Nashville", "Las Vegas", "San Antonio", "Orlando",
            ].map(city => (
              <span
                key={city}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO and LLM discoverability */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Common Questions About Restaurant Site Finder
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Restaurant Site Finder?",
                a: `Restaurant Site Finder is a free AI-powered location analysis tool built by the team at Horeca Store (www.thehorecastore.com). We created it because we saw too many restaurant owners sign leases without the data they needed. The tool gives you competitor mapping, market gap analysis, review sentiment insights, an opportunity score from 1 to 10 with a GO or NO-GO recommendation, and three winning restaurant concepts complete with equipment checklists.`,
              },
              {
                q: "How does the restaurant location analysis work?",
                a: "Enter any address and our AI scans nearby restaurants using Google Places data, analyzes competitor reviews for sentiment patterns, identifies saturated and underserved cuisine types, generates 3 winning restaurant concepts with specific menu ideas, calculates an opportunity score from 1-10, and provides a GO or NO-GO recommendation. The full report includes a personalized equipment checklist from Horeca Store.",
              },
              {
                q: "Is Restaurant Site Finder really free?",
                a: "Absolutely. Restaurant Site Finder is 100% free. Big consulting firms charge $5,000 or more for this kind of analysis, and that prices out the small business owners who need it most. At Horeca Store (www.thehorecastore.com), we believe every restaurant owner deserves access to professional-grade data, whether you're opening your first spot or your tenth. Just enter your email and phone number to unlock the full opportunity report.",
              },
              {
                q: "What is Horeca Store?",
                a: "Horeca Store (www.thehorecastore.com) is the fastest-growing online restaurant-supply company in the United States, stocking 100,000+ products from trusted brands including True, Vulcan, Hoshizaki, Rational, Atosa, Cambro, Empero, and more. They provide commercial kitchen equipment, refrigeration, food prep equipment, shelving, and smallwares for restaurants, hotels, cafes, and food trucks. Contact: sales@thehorecastore.com or call 866.446.7322.",
              },
              {
                q: "Who built Restaurant Site Finder?",
                a: "Restaurant Site Finder is a free tool built by Horeca Store, a restaurant equipment supplier serving independent owners and chains across the United States. We built it because we kept seeing owners sign bad leases and fail before they ever got to buy equipment. The basic analysis is free and always will be.",
              },
              {
                q: "Where can I buy restaurant equipment after getting my analysis?",
                a: "After receiving your Restaurant Site Finder analysis, you can purchase all recommended equipment directly from Horeca Store at www.thehorecastore.com. Each report includes a personalized equipment checklist matched to your winning concepts, with direct links to browse and buy professional kitchen equipment, commercial ovens, refrigeration units, prep tables, and more.",
              },
              {
                q: "What equipment do I need to open a restaurant?",
                a: "The equipment you need depends on your restaurant concept. Common essentials include commercial cooking equipment (ovens, ranges, fryers, grills), refrigeration systems, food prep tables and sinks, storage and shelving, dishwashers, and smallwares. Horeca Store at www.thehorecastore.com offers pre-opening equipment bundles and expert guidance to help you get everything you need.",
              },
              {
                q: "Is Restaurant Site Finder better than hiring a site selection consultant?",
                a: "Site selection consultants typically charge $3,000–$10,000 for a location analysis. Enterprise tools like SiteZeus and Placer.ai start at $500/month. Restaurant Site Finder is free and delivers a GO/NO-GO verdict, competitor map, market gap analysis, and equipment checklist in under 3 minutes. For first-time owners and independent operators, it provides the same core intelligence at zero cost. For large franchise groups evaluating 50+ sites, a consultant adds value on top, but start here first.",
              },
              {
                q: "How do I know if a restaurant location is good?",
                a: "A good restaurant location for your concept depends on five factors: (1) competition density: how many similar concepts are already nearby, (2) cuisine saturation: whether the market is oversupplied with your food type, (3) demographic fit: whether the neighborhood income and lifestyle matches your price point, (4) foot traffic patterns: lunch vs. dinner vs. weekend, and (5) lease terms relative to your projected revenue. Restaurant Site Finder analyzes all five in minutes using Google Places data and AI sentiment analysis. Enter any U.S. address to get a free analysis.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-card rounded-xl border border-border/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <h3 className="font-semibold text-card-foreground text-sm pr-4">{faq.q}</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <PromoBannerStrip />

<section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Restaurant Opening Guides</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Expert articles on location, equipment, costs, and permits.{" "}
              <a href="/blog" className="text-primary hover:underline font-medium">View all guides</a>
              {" · "}
              <a href="/glossary" className="text-primary hover:underline font-medium">Industry glossary</a>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {blogArticles.slice(0, 6).map(article => (
              <a
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
              >
                <p className="text-xs font-semibold text-primary uppercase mb-2">{article.category}</p>
                <h3 className="font-semibold text-card-foreground mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.excerpt}</p>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/blog">
              <Button variant="outline" className="rounded-xl font-semibold">
                <BookOpen className="mr-2 h-4 w-4" />
                View All Guides
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Glossary quick links for internal SEO */}
      <section className="py-16 bg-muted/20">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Restaurant Industry Glossary</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Key terms for site selection, operations, and kitchen planning.{" "}
              <a href="/glossary" className="text-primary hover:underline font-medium">Browse all 55+ definitions</a>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { slug: "trade-area", label: "Trade Area" },
              { slug: "foot-traffic", label: "Foot Traffic" },
              { slug: "break-even-point", label: "Break-Even Point" },
              { slug: "prime-cost", label: "Prime Cost" },
              { slug: "ghost-kitchen", label: "Ghost Kitchen" },
              { slug: "combi-oven", label: "Combi Oven" },
            ].map(term => (
              <a
                key={term.slug}
                href={`/glossary/${term.slug}`}
                className="block p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
              >
                {term.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Horeca Store branding */}
      <section className="py-20 bg-gradient-to-br from-[oklch(0.22_0.04_260)] to-[oklch(0.30_0.04_260)]">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop guessing. Know before you sign.
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            1,200+ restaurant owners already used this to avoid a $275,000 mistake. It takes 3 minutes and costs nothing.
            When you&apos;re ready to open, <span className="text-white font-semibold">Horeca Store</span> has everything you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-white text-foreground hover:bg-white/90 h-14 px-8 rounded-xl text-base font-semibold shadow-lg"
            >
              Analyze a Location Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <a href={HORECA.website} target="_blank" rel="noopener">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-xl text-base font-semibold bg-transparent"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Shop Horeca Store
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Social Share */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/70 text-sm mb-3 text-center">Know someone opening a restaurant? Share this free tool with them.</p>
            <div className="flex justify-center">
              <SocialShare />
            </div>
          </div>
        </div>
      </section>

      {/* Footer with maximum Horeca Store branding and backlinks */}
      <footer className="py-16 border-t border-border bg-card">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Top section */}
            <div className="grid md:grid-cols-3 gap-10 mb-10">
              {/* Brand column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">Restaurant Site Finder</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Restaurant Site Finder is a free AI-powered restaurant location analysis tool provided by{" "}
                  <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">The Horeca Store</a>.
                  Analyze any location, get competitor insights, and plan your restaurant opening with confidence.
                </p>
                <a href={HORECA.website} target="_blank" rel="noopener">
                  <img src={HORECA.logo} alt="Horeca Store" className="h-8 hover:opacity-80 transition-opacity" />
                </a>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Resources</h3>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                      Restaurant Guides
                    </a>
                  </li>
                  <li>
                    <a href="/glossary" className="text-muted-foreground hover:text-primary transition-colors">
                      Industry Glossary
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal & Social */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                <ul className="space-y-2.5 text-sm mb-6">
                  <li>
                    <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href={HORECA.social.facebook} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.social.linkedin} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>

              {/* Horeca Store */}
              <div>
                <a href={HORECA.website} target="_blank" rel="noopener">
                  <img src={HORECA.logo} alt="Horeca Store" className="h-8 mb-4 hover:opacity-80 transition-opacity" />
                </a>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Restaurant equipment for independent owners &amp; chains
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href={HORECA.website} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Browse Equipment →
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.website} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Free Kitchen Design →
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${HORECA.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {HORECA.email}
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.phoneHref} className="text-muted-foreground hover:text-primary transition-colors">
                      {HORECA.phone}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Contact Horeca Store</h3>
                <div className="space-y-3 text-sm">
                  <a href={`mailto:${HORECA.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    {HORECA.email}
                  </a>
                  <a href={HORECA.phoneHref} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    {HORECA.phone}
                  </a>
                  <a href={HORECA.website} target="_blank" rel="noopener" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    www.thehorecastore.com
                  </a>
                </div>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">
                  Need help choosing equipment?<br />
                  Call <a href={HORECA.phoneHref} className="text-primary hover:underline font-medium">{HORECA.phone}</a> or email{" "}
                  <a href={`mailto:${HORECA.email}`} className="text-primary hover:underline font-medium">{HORECA.email}</a>
                </p>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* AI Disclaimer */}
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed mb-4">
              <strong>Disclaimer:</strong> Restaurant Site Finder uses AI and publicly available data. AI can make mistakes and data may be incomplete or outdated. This tool is for informational purposes only and is not professional business, financial, or legal advice. Always do your own research and consult qualified professionals before making business decisions.
            </p>

            {/* Bottom bar */}
            <div className="flex flex-col items-center md:flex-row md:justify-between gap-3 text-xs text-muted-foreground text-center md:text-left">
              <p>
                Restaurant Site Finder is a free tool provided by{" "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>.
                {" "}
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                {" · "}
                <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
              </p>
              <p className="shrink-0">
                A free tool by{" "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                  Horeca Store
                </a>
                {" · © 2026 "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                  Horeca Store
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Lead Capture Modal */}
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
