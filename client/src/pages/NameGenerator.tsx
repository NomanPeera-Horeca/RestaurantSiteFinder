import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { captureEvent } from "@/lib/posthog";
import { HORECA } from "@/lib/horeca-brand";
import { cn } from "@/lib/utils";
import {
  checkDomainAvailability,
  CUISINE_OPTIONS,
  generateRestaurantNames,
  namecheapSearchUrl,
  SAVED_NAME_STORAGE_KEY,
  type CuisineKey,
  type DomainStatus,
  type GeneratedName,
  type VibeKey,
  VIBE_OPTIONS,
} from "@/lib/name-generator";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_TITLE =
  "Restaurant Name Generator — Free + Domain Check | Restaurant Site Finder";
const DEFAULT_DESCRIPTION =
  "Generate unique restaurant name ideas instantly. Check .com domain availability, get tagline suggestions, and lock in your brand before someone else does. Free tool by Restaurant Site Finder.";

const NAME_GENERATOR_FAQ = [
  {
    q: "How do I come up with a good restaurant name?",
    a: "A good restaurant name does four things: it's easy to say out loud, easy to spell, available as a .com domain, and gives customers a sense of your food or vibe before they walk in. Avoid names that are too generic (The Grill, The Kitchen) or too clever that people can't spell them when searching on Google. Test it by saying it on the phone — 'Hi, you've reached [name]' — and seeing if it sounds natural.",
  },
  {
    q: "Should my restaurant name include my city?",
    a: "Including your city or neighborhood (Heights Kitchen, Montrose Table, Austin Ember) has real advantages: it helps with local SEO so nearby customers find you on Google Maps, it signals authenticity to locals, and it differentiates you from chains. The tradeoff is that it limits you if you ever expand. If you plan to open multiple locations, choose a name that works without the city.",
  },
  {
    q: "How do I check if a restaurant name is taken?",
    a: "Check three things: (1) Google the name — see if another restaurant already uses it, (2) check the .com domain availability using a tool like this one or Namecheap, (3) search the USPTO trademark database (tmsearch.uspto.gov) for federally registered marks. A name can be available as a domain but still be trademarked, so check all three before printing menus or signing a lease.",
  },
  {
    q: "What makes a restaurant name SEO-friendly?",
    a: "An SEO-friendly restaurant name is one customers can find on Google without confusion. Short names (1–2 words), real words over invented spellings, and names that pair naturally with your city ('[Name] Houston' or '[Name] near me') perform best in local search. Avoid substituting letters with numbers or using punctuation in the name — both hurt searchability.",
  },
  {
    q: "Should I get a .com or is .restaurant okay?",
    a: "Get the .com if it's available — it's still what most people assume when they type a URL or search. If the .com is taken, .restaurant is the best alternative for food businesses, followed by .co. Avoid .net or .org for restaurants — they signal the wrong type of business to customers.",
  },
  {
    q: "What restaurant names are trending in 2025–2026?",
    a: "Current trends lean toward: single evocative words (Ember, Flora, Vale, Lore), place + craft pairings (Heights Smokehouse, Midtown Masa), and possessive styles (Rosa's, The Neighbor's Table). Fast casual concepts are moving toward clean, modern single-word names. Fine dining is gravitating toward understated single words or founder names. Over-designed names with ampersands and unnecessary punctuation are fading.",
  },
  {
    q: "Can I use a restaurant name generator for a real business?",
    a: "Yes — this generator is built specifically for restaurant owners planning to open, not for entertainment. Every name is checked against .com domain availability in real time. That said, always run a full trademark search and Google check before committing. The generator gives you a strong starting point and the domain check tells you what's actually available — the final decision is yours.",
  },
] as const;

function cityLabel(city: string): string {
  return city.split(",")[0]?.trim() || city.trim();
}

function usePageSeo(generatedCity: string, hasResults: boolean) {
  useEffect(() => {
    const previousTitle = document.title;
    const title =
      hasResults && generatedCity
        ? `Restaurant Names for ${cityLabel(generatedCity)} — Free Generator + Domain Check`
        : DEFAULT_TITLE;
    const description =
      hasResults && generatedCity
        ? `Find the perfect name for your ${cityLabel(generatedCity)} restaurant. Check .com availability instantly. Free tool by Restaurant Site Finder.`
        : DEFAULT_DESCRIPTION;

    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href") ?? "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://restaurantsitefinder.com/restaurant-name-generator");

    const appScript = document.createElement("script");
    appScript.type = "application/ld+json";
    appScript.setAttribute("data-seo", "name-generator-app");
    appScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Restaurant Name Generator",
      description:
        "Free restaurant name generator with domain availability check and tagline suggestions",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://restaurantsitefinder.com/restaurant-name-generator",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.setAttribute("data-seo", "name-generator-faq");
    faqScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: NAME_GENERATOR_FAQ.map(item => ({
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
  }, [generatedCity, hasResults]);
}

function DomainBadge({
  status,
  slug,
}: {
  status: DomainStatus | "loading";
  slug: string;
}) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking .com…
      </span>
    );
  }

  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
        <CheckCircle2 className="h-3.5 w-3.5" />
        ✓ .com available — $12/yr
      </span>
    );
  }

  if (status === "taken") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" />
        ✗ .com taken — try .co or .restaurant
      </span>
    );
  }

  return (
    <a
      href={namecheapSearchUrl(slug)}
      target="_blank"
      rel="noopener"
      className="text-xs font-medium text-primary hover:underline"
    >
      Check availability →
    </a>
  );
}

function NameCard({
  item,
  savedName,
  onSave,
}: {
  item: GeneratedName;
  savedName: string | null;
  onSave: (name: string) => void;
}) {
  const [domainStatus, setDomainStatus] = useState<DomainStatus | "loading">("loading");
  const isSaved = savedName === item.name;

  useEffect(() => {
    let cancelled = false;
    setDomainStatus("loading");
    checkDomainAvailability(item.slug).then(result => {
      if (!cancelled) setDomainStatus(result);
    });
    return () => {
      cancelled = true;
    };
  }, [item.slug]);

  return (
    <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col h-full gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{item.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.tagline}</p>
        </div>

        <DomainBadge status={domainStatus} slug={item.slug} />

        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <a
            href={namecheapSearchUrl(item.slug)}
            target="_blank"
            rel="noopener"
            className="flex-1"
            onClick={() =>
              captureEvent("domain_grabbed", {
                name: item.name,
                domain_available: domainStatus === "available",
              })
            }
          >
            <Button variant="outline" className="w-full rounded-xl">
              Grab Domain
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </a>
          <Button
            className="flex-1 rounded-xl"
            variant={isSaved ? "secondary" : "default"}
            onClick={() => onSave(item.name)}
          >
            {isSaved ? "Saved" : "Use This Name"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NameGeneratorFaq() {
  return (
    <section className="py-16 border-t border-border/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
        Common Questions About Naming Your Restaurant
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {NAME_GENERATOR_FAQ.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-semibold text-foreground">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
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
          <span className="text-muted-foreground">
            {" "}
            — Check if your city has demand for your concept before signing a lease
          </span>
        </li>
        <li>
          <a href="/#rent-calculator" className="text-primary font-medium hover:underline">
            Rent Stress-Test Calculator
          </a>
          <span className="text-muted-foreground">
            {" "}
            — Find out if you can actually afford a location
          </span>
        </li>
        <li>
          <a
            href={HORECA.website}
            className="text-primary font-medium hover:underline"
            target="_blank"
            rel="noopener"
          >
            Free Restaurant Equipment Checklist
          </a>
          <span className="text-muted-foreground"> — Know what you need before you open</span>
        </li>
      </ul>
    </section>
  );
}

export default function NameGenerator() {
  const [cuisine, setCuisine] = useState<CuisineKey>("burger");
  const [customCuisine, setCustomCuisine] = useState("");
  const [city, setCity] = useState("");
  const [vibes, setVibes] = useState<VibeKey[]>([]);
  const [wordPrefs, setWordPrefs] = useState("");
  const [results, setResults] = useState<GeneratedName[]>([]);
  const [generatedCity, setGeneratedCity] = useState("");
  const [savedName, setSavedName] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(SAVED_NAME_STORAGE_KEY) : null
  );
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  usePageSeo(generatedCity, results.length > 0);

  useEffect(() => {
    captureEvent("name_generator_viewed");
  }, []);

  const canGenerate = useMemo(() => {
    if (!city.trim()) return false;
    if (cuisine === "other" && !customCuisine.trim()) return false;
    return true;
  }, [city, cuisine, customCuisine]);

  const toggleVibe = (vibe: VibeKey) => {
    setVibes(prev => {
      if (prev.includes(vibe)) return prev.filter(v => v !== vibe);
      if (prev.length >= 3) return prev;
      return [...prev, vibe];
    });
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.error("Please enter your city and select a restaurant type.");
      return;
    }

    const names = generateRestaurantNames({
      cuisine,
      customCuisine,
      city,
      vibes,
      wordPrefs,
    });
    setResults(names);
    setGeneratedCity(city.trim());
    setShowSavedBanner(false);
    captureEvent("names_generated", {
      cuisine: cuisine === "other" ? customCuisine.trim() : cuisine,
      city: city.trim(),
      vibe_count: vibes.length,
    });
  };

  const handleSaveName = (name: string) => {
    localStorage.setItem(SAVED_NAME_STORAGE_KEY, name);
    setSavedName(name);
    setShowSavedBanner(true);
    captureEvent("name_saved_to_local", { name });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="name-generator" />

      <main className="pt-28 pb-20">
        <section className="container max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Free naming tool
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
              Find the Perfect Name for Your Restaurant
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Check availability, grab the domain, and lock in your brand — before someone else does.
            </p>
          </div>

          <article className="mb-10 max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Restaurant Name Generator — Free Tool with Domain Check
            </h1>
            <p>
              Finding the right restaurant name is the first decision you make — and one of the most
              permanent. A great name is memorable, available as a .com domain, works on signage, and
              tells customers exactly what to expect before they walk in the door.
            </p>
            <p>
              This free tool generates restaurant name ideas based on your cuisine, city, and brand
              personality — then instantly checks if the .com domain is available so you can lock it in
              before someone else does.
            </p>
          </article>

          <Card className="border-border/60 shadow-sm mb-10">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cuisine">What kind of restaurant?</Label>
                <Select value={cuisine} onValueChange={(v) => setCuisine(v as CuisineKey)}>
                  <SelectTrigger id="cuisine" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cuisine === "other" && (
                  <Input
                    placeholder="Describe your concept"
                    value={customCuisine}
                    onChange={(e) => setCustomCuisine(e.target.value)}
                    className="h-11 mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Your city or neighborhood</Label>
                <Input
                  id="city"
                  placeholder='e.g. "Houston Heights" or "Austin, TX"'
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label>Vibe / personality (pick up to 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map(vibe => {
                    const selected = vibes.includes(vibe);
                    const disabled = !selected && vibes.length >= 3;
                    return (
                      <button
                        key={vibe}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleVibe(vibe)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {vibe}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="word-prefs">Any words you love or want to avoid? (optional)</Label>
                <Input
                  id="word-prefs"
                  placeholder={`e.g. "love 'fire', hate 'grill'"`}
                  value={wordPrefs}
                  onChange={(e) => setWordPrefs(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button
                size="lg"
                className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                Generate Names
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {showSavedBanner && savedName && (
            <div className="mb-8 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-900">
              Name saved! Next:{" "}
              <Link href="/#restaurant-location-analysis" className="font-semibold underline hover:no-underline">
                find your location →
              </Link>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-6 mb-16">
              {results.map(item => (
                <NameCard
                  key={item.slug + item.name}
                  item={item}
                  savedName={savedName}
                  onSave={handleSaveName}
                />
              ))}
            </div>
          )}

          <NameGeneratorFaq />

          {results.length > 0 && (
            <section className="border-t border-border/50 pt-16">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  You have a name. Now find the right location.
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border/50">
                  <CardContent className="p-6 flex flex-col h-full">
                    <p className="text-sm font-semibold text-foreground mb-2">1. Validate demand</p>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">
                      Check if your city has demand for your concept — free
                    </p>
                    <Link href="/#restaurant-location-analysis">
                      <Button variant="outline" className="w-full rounded-xl">
                        Run Location Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-6 flex flex-col h-full">
                    <p className="text-sm font-semibold text-foreground mb-2">2. Lock in your brand</p>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">
                      Get your domain + business email
                    </p>
                    <a href="https://www.namecheap.com/domains/" target="_blank" rel="noopener">
                      <Button variant="outline" className="w-full rounded-xl">
                        Search domains
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5 relative overflow-hidden">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663403284701/HwLz9SBGbDEkubjg5ygWVH/favicon-192_49573d7a.png"
                        alt="Horeca Store"
                        className="h-5 w-5 rounded"
                      />
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        Horeca Store
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground mb-2">3. Design your kitchen</p>
                    <p className="text-sm text-muted-foreground mb-2 flex-1">
                      Free kitchen design service from the restaurant equipment specialists. Know your
                      layout before you sign the lease.
                    </p>
                    <p className="text-xs text-muted-foreground mb-6">
                      Hood systems, fryers, refrigeration — financing from $99/mo
                    </p>

                    <a href={HORECA.website} target="_blank" rel="noopener">
                      <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        Get Free Kitchen Design
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          <InternalLinksSection />
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Restaurant Site Finder by {HORECA.name}</span>
          </div>
          <Link href="/" className="hover:text-primary transition-colors">
            Back to location analysis
          </Link>
        </div>
      </footer>
    </div>
  );
}
