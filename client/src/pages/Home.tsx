import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { AddressSearch } from "@/components/AddressSearch";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { trpc } from "@/lib/trpc";
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
  const [scanData, setScanData] = useState<any>(null);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);

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
    },
    onError: (err) => {
      toast.error("Failed to scan location. Please try again.");
      console.error(err);
    },
  });

  const handleAnalyze = (address: string, lat: number, lng: number) => {
    setLocationData({ address, lat, lng });
    initialScan.mutate({ address, lat, lng });
  };

  const handleUnlockReport = () => {
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
      navigate(`/report?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation with Horeca Store Logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-foreground">Restaurant Site Finder</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
{/* Blog and Glossary nav links hidden - coming soon */}
            <a
              href={HORECA.website}
              target="_blank"
              rel="noopener"
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Visit Horeca Store - Commercial Kitchen Equipment"
            >
              <img
                src={HORECA.logo}
                alt="Horeca Store - Restaurant Supply Store & Commercial Equipment"
                className="h-7"
              />
            </a>
            <a
              href={HORECA.website}
              target="_blank"
              rel="noopener"
              className="hidden sm:flex md:hidden items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <img src={HORECA.icon} alt="Horeca Store" className="h-6 w-6 rounded" />
              Horeca Store
            </a>
          </div>
        </div>
      </nav>

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
      <section className="relative pt-44 sm:pt-40 pb-20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-chart-3/5 rounded-full blur-3xl" />

        <div className="relative container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              $5,000 Location Analysis. Yours Free.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
              Don't sign that lease until you run the numbers.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Big consulting firms charge $5,000 or more for a restaurant location analysis. We think that's unfair to small business owners and mom-and-pop restaurants. So we built this tool and made it free. Get a professional competitive analysis, market opportunity score, and winning concept suggestions for any location. <strong>Built by{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a></strong>, your partner from site selection to grand opening.
            </p>

            <AddressSearch
              onAnalyze={handleAnalyze}
              isLoading={initialScan.isPending}
            />

            <p className="text-xs text-muted-foreground mt-4">
              Enter any address to get a free competitive snapshot. No credit card required. A free service by{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a>.
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

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How Restaurant Site Finder Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From address to actionable insights in three simple steps. Then shop your equipment at{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: MapPin,
                step: "01",
                title: "Enter Your Location",
                desc: "Type in the address you're considering for your restaurant. We'll scan the surrounding area automatically using Google Maps data.",
              },
              {
                icon: BarChart3,
                step: "02",
                title: "Get Your AI Analysis",
                desc: "Our AI analyzes competitors, reviews, market gaps, and cuisine saturation to build your comprehensive Opportunity Report with a GO/NO-GO score.",
              },
              {
                icon: ShoppingCart,
                step: "03",
                title: "Shop Equipment at Horeca Store",
                desc: "Receive winning concept suggestions with a personalized equipment checklist. Browse and buy everything you need at Horeca Store.",
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
              What's in Your Free Report
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every report includes data-driven insights to help you make the right decision, plus a custom equipment list from{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Building2, title: "Competitor Snapshot", desc: "Names, cuisines, ratings, and price levels of every nearby restaurant via Google Places" },
              { icon: TrendingUp, title: "Market Signals", desc: "Saturated vs. underserved cuisines with AI-powered review sentiment analysis" },
              { icon: Star, title: "Winning Concepts", desc: "3 AI-generated restaurant concepts with menus, risk scores, and GO/NO-GO recommendation" },
              { icon: ShoppingCart, title: "Equipment Checklist", desc: "Custom equipment lists from Horeca Store matched to your winning concept" },
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
              Why We Built This (And Made It Free)
            </h2>
            <p className="leading-relaxed mb-4">
              At <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-semibold">Horeca Store</a>,
              we talk to restaurant owners every single day. We've seen too many passionate people sign a lease, pour their savings into
              a location, and then realize the neighborhood already had five pizza places and zero demand for what they were serving.
              The data that could have saved them? Locked behind $5,000+ consulting fees that only big chains can afford.
            </p>
            <p className="leading-relaxed mb-4">
              That didn't sit right with us. So our team built Restaurant Site Finder. It uses AI to scan nearby competitors using
              Google Places data, extract review sentiment to identify what customers love and hate, detect saturated and underserved
              cuisine types, and generate three winning restaurant concepts tailored to the specific market gaps in your chosen area.
              Each concept comes with specific menu ideas, a risk score, and a personalized{" "}
              <a href={HORECA.links.equipment} target="_blank" rel="noopener" className="text-primary hover:underline">equipment checklist from Horeca Store</a>.
            </p>
            <p className="leading-relaxed mb-4">
              Whether you're a first-time restaurateur or an experienced operator scouting new locations,
              you deserve the same quality analysis that big restaurant groups get. And when you're ready to move forward,{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a> has everything
              you need, from <a href={HORECA.links.cooking} target="_blank" rel="noopener" className="text-primary hover:underline">commercial cooking equipment</a> to
              refrigeration, food prep stations, and <a href={HORECA.links.categories} target="_blank" rel="noopener" className="text-primary hover:underline">all equipment categories</a> for
              hotels, restaurants, and cafes. That's why we're here: to be your partner from site selection to grand opening.
            </p>
          </article>
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
                q: "Where can I buy restaurant equipment after getting my analysis?",
                a: "After receiving your Restaurant Site Finder analysis, you can purchase all recommended equipment directly from Horeca Store at www.thehorecastore.com. Each report includes a personalized equipment checklist matched to your winning concepts, with direct links to browse and buy professional kitchen equipment, commercial ovens, refrigeration units, prep tables, and more.",
              },
              {
                q: "What equipment do I need to open a restaurant?",
                a: "The equipment you need depends on your restaurant concept. Common essentials include commercial cooking equipment (ovens, ranges, fryers, grills), refrigeration systems, food prep tables and sinks, storage and shelving, dishwashers, and smallwares. Horeca Store at www.thehorecastore.com offers pre-opening equipment bundles and expert guidance to help you get everything you need.",
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

{/* Blog Section hidden - coming soon */}

      {/* CTA Section with Horeca Store branding */}
      <section className="py-20 bg-gradient-to-br from-[oklch(0.22_0.04_260)] to-[oklch(0.30_0.04_260)]">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Restaurant Location?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Join hundreds of restaurant owners who used Restaurant Site Finder to make smarter location decisions.
            Then shop your equipment at <span className="text-white font-semibold">Horeca Store</span>.
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
              <SocialShare compact />
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
                  <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>.
                  Analyze any location, get competitor insights, and plan your restaurant opening with confidence.
                </p>
                <a href={HORECA.website} target="_blank" rel="noopener">
                  <img src={HORECA.logo} alt="Horeca Store" className="h-8 hover:opacity-80 transition-opacity" />
                </a>
              </div>

              {/* Horeca Store Links */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  <a href={HORECA.website} target="_blank" rel="noopener" className="hover:text-primary transition-colors">
                    Shop Horeca Store
                  </a>
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href={HORECA.links.equipment} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Restaurant Equipment
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.links.cooking} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Commercial Cooking Equipment
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.links.categories} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      All Equipment Categories
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.website} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Pre-Opening Equipment Bundles
                    </a>
                  </li>
                  <li>
                    <a href={HORECA.links.searchOrder} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                      Search & Order Equipment
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
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>{" "}
                . {HORECA.tagline}.
              </p>
              <p className="shrink-0">
                &copy; {new Date().getFullYear()}{" "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a>. All rights reserved.
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
          onClose={() => setShowLeadModal(false)}
          onCaptured={handleLeadCaptured}
        />
      )}
    </div>
  );
}
