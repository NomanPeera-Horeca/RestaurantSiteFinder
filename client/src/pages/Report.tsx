import { useEffect, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { HORECA } from "@/lib/horeca-brand";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Building2, Star, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Lightbulb, ShoppingCart,
  ChevronRight, ArrowLeft, Loader2, Phone, Mail,
  ExternalLink, Utensils, Target, BarChart3,
  ThumbsUp, ThumbsDown, MessageSquare, Gauge,
  Package, ArrowRight, Download, FileText,
  Users, TrendingDown, Search, ShieldCheck, RefreshCw
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import type { FullReport, Competitor, WinningConcept, EquipmentBundle, MenuMarketFit, ConceptFit } from "../../../shared/analysis-types";
import { conceptFromSearchParams } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import { serviceModelLabel } from "../../../shared/concept-options";
import { formatCompetitorAreaSubtitle, formatDirectCompetitorAreaSubtitle } from "../../../shared/search-config";
import { SocialShare } from "@/components/SocialShare";

function priceLevelLabel(level: number | null): string {
  if (level === null || level === undefined) return "N/A";
  return ["Free", "$", "$$", "$$$", "$$$$"][level] ?? "N/A";
}

function scoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 4) return "text-yellow-600";
  return "text-red-600";
}

function recommendationBadge(rec: string) {
  switch (rec) {
    case "GO":
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">GO</Badge>;
    case "NO-GO":
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-sm px-3 py-1">NO-GO</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-sm px-3 py-1">CAUTION</Badge>;
  }
}

// ---- Sub-components ----

function CompetitorTable({ competitors, title, subtitle }: { competitors: Competitor[]; title?: string; subtitle?: string }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title ?? "Competitor Snapshot"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {subtitle ?? formatCompetitorAreaSubtitle(competitors.length)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Cuisine</TableHead>
                <TableHead className="font-semibold text-center">Rating</TableHead>
                <TableHead className="font-semibold text-center">Reviews</TableHead>
                <TableHead className="font-semibold text-center">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.slice(0, 15).map((c) => (
                <TableRow key={c.placeId} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{c.cuisine}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      {c.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{c.userRatingsTotal}</TableCell>
                  <TableCell className="text-center">{priceLevelLabel(c.priceLevel)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ConceptFitSection({ conceptFit }: { conceptFit: ConceptFit }) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Concept Verdict</CardTitle>
              <p className="text-sm font-medium text-foreground mt-1">{conceptFit.userConceptSummary}</p>
              <p className="text-sm text-muted-foreground mt-2">{conceptFit.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Concept fit</p>
              <p className={`text-3xl font-bold ${scoreColor(conceptFit.fitScore)}`}>{conceptFit.fitScore}/10</p>
            </div>
            {recommendationBadge(conceptFit.recommendation)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border/50 bg-card">
            <p className="font-medium text-sm text-foreground mb-1">Competitive landscape</p>
            <p className="text-sm text-muted-foreground">{conceptFit.competitiveVerdict}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {conceptFit.directCompetitorCount} direct competitor(s) identified nearby.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 bg-card">
            <p className="font-medium text-sm text-foreground mb-1">Why it works or fails here</p>
            <p className="text-sm text-muted-foreground">{conceptFit.whyItWorksOrFails}</p>
          </div>
        </div>

        {(conceptFit.recommendation === "NO-GO" || conceptFit.recommendation === "CAUTION") && (
          <>
            {conceptFit.alternativeConcepts.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Better concepts for this location
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {conceptFit.alternativeConcepts.map((alt, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/50 bg-card">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-semibold text-foreground">{alt.name}</p>
                        <Badge variant="outline">{alt.fitScore}/10</Badge>
                      </div>
                      <p className="text-xs text-primary mb-1">
                        {serviceModelLabel(alt.serviceModel)} · {alt.cuisineType}
                      </p>
                      <p className="text-sm text-muted-foreground">{alt.whyBetter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conceptFit.alternativeLocationGuidance && (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/80">
                <p className="font-medium text-sm text-foreground mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-700" />
                  Where your original concept might work better
                </p>
                <p className="text-sm text-muted-foreground">{conceptFit.alternativeLocationGuidance}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MarketLogicSection({ report }: { report: FullReport }) {
  const { marketAnalysis } = report;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <CardTitle className="text-lg">Market Logic & Review Signals</CardTitle>
            <p className="text-sm text-muted-foreground">Cuisine saturation and customer sentiment analysis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cuisine Signals */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Saturated Cuisines
            </h4>
            <div className="space-y-2">
              {marketAnalysis.saturatedCuisines.length > 0 ? (
                marketAnalysis.saturatedCuisines.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <span className="text-red-500">✖</span>
                    <span className="text-foreground">{c}</span>
                    <Badge variant="outline" className="text-xs text-red-600 border-red-200 ml-auto">Saturated</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No heavily saturated cuisines detected</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Underserved Cuisines
            </h4>
            <div className="space-y-2">
              {marketAnalysis.underservedCuisines.length > 0 ? (
                marketAnalysis.underservedCuisines.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✔</span>
                    <span className="text-foreground">{c}</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 ml-auto">Opportunity</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Market appears well-covered</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Review Sentiment */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Review Sentiment Analysis
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-800 text-sm">Top Complaints</span>
              </div>
              <ul className="space-y-1.5">
                {marketAnalysis.reviewSentiment.topComplaints.map((complaint, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {complaint}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-800 text-sm">What Customers Love</span>
              </div>
              <ul className="space-y-1.5">
                {marketAnalysis.reviewSentiment.topPraises.map((praise, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {praise}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Patterns */}
          {marketAnalysis.reviewSentiment.patterns.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium text-foreground text-sm mb-2">Key Market Patterns</p>
              <ul className="space-y-1">
                {marketAnalysis.reviewSentiment.patterns.map((pattern, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Separator />

        {/* Demographics & Foot Traffic */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border/50">
            <p className="font-medium text-foreground text-sm mb-1">Demographics</p>
            <p className="text-sm text-muted-foreground">{marketAnalysis.demographics}</p>
          </div>
          <div className="p-4 rounded-lg border border-border/50">
            <p className="font-medium text-foreground text-sm mb-1">Foot Traffic</p>
            <p className="text-sm text-muted-foreground">{marketAnalysis.footTraffic}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConceptsSection({ concepts, score, recommendation, title }: { concepts: WinningConcept[]; score: number; recommendation: string; title?: string }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-lg">{title ?? "Opportunity & Winning Concepts"}</CardTitle>
              <p className="text-sm text-muted-foreground">AI-generated concepts tailored to this market</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Opportunity Score</p>
                <p className="text-xs text-muted-foreground">Based on competition, market gaps, and demand signals</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-4xl font-bold ${scoreColor(score)}`}>{score}/10</span>
              {recommendationBadge(recommendation)}
            </div>
          </div>
          <Progress value={score * 10} className="h-3" />
        </div>

        {/* Concepts */}
        <div className="space-y-4">
          {concepts.map((concept, i) => (
            <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 sm:p-5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{concept.name}</h4>
                      <p className="text-xs text-muted-foreground">{concept.cuisineType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11 sm:ml-0 shrink-0">
                    <span className="text-xs text-muted-foreground">Risk:</span>
                    <span className={`font-bold text-sm ${scoreColor(10 - concept.riskScore)}`}>
                      {concept.riskScore}/10
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>

                <div>
                  <p className="font-medium text-foreground text-sm mb-2 flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-primary" />
                    Suggested Menu Items
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {concept.menuIdeas.map((item, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium text-foreground text-sm mb-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Why This Works Here
                  </p>
                  <p className="text-sm text-muted-foreground">{concept.reasoning}</p>
                </div>

                {/* Menu-Market Fit Section */}
                {concept.menuMarketFit && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Menu-Market Fit
                      </p>
                      <div className="flex items-center gap-2 ml-5 sm:ml-0">
                        <span className="text-xs text-muted-foreground">Demand:</span>
                        <span className={`font-bold text-sm ${scoreColor(concept.menuMarketFit.demandScore)}`}>
                          {concept.menuMarketFit.demandScore}/10
                        </span>
                      </div>
                    </div>
                    <Progress value={concept.menuMarketFit.demandScore * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {concept.menuMarketFit.demandExplanation}
                    </p>
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div className="flex gap-2">
                        <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Population Match</p>
                          <p className="text-xs text-muted-foreground">{concept.menuMarketFit.populationMatch}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Demand Signals</p>
                          <p className="text-xs text-muted-foreground">{concept.menuMarketFit.searchDemandSignals}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Competitive Advantage</p>
                          <p className="text-xs text-muted-foreground">{concept.menuMarketFit.competitiveAdvantage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EquipmentSection({ bundles }: { bundles: EquipmentBundle[] }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <a href={HORECA.website} target="_blank" rel="noopener" className="hover:text-primary transition-colors">
                  Horeca Store
                </a>{" "}Equipment Checklist
              </CardTitle>
              <p className="text-sm text-muted-foreground">Equipment matched to your winning concepts. Shop at{" "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">www.thehorecastore.com</a>
              </p>
            </div>
          </div>
          <a href={HORECA.website} target="_blank" rel="noopener" className="hidden sm:block">
            <img src={HORECA.logo} alt="Horeca Store" className="h-6 hover:opacity-80 transition-opacity" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {bundles.map((bundle, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="bg-muted/30 p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">
                Equipment for: {bundle.conceptName}
              </h4>
              <a href={bundle.ctaUrl || HORECA.links.equipment} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
                Browse at Horeca Store <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {bundle.items.map((item, j) => (
                  <div key={j} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 py-3 border-b border-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 sm:text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">{item.estimatedPrice}</p>
                      <a
                        href={item.horecaStoreUrl}
                        target="_blank"
                        rel="noopener"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-0 sm:mt-1"
                      >
                        View at Horeca Store
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 p-4 border-t border-border/50">
              <a
                href={bundle.ctaUrl}
                target="_blank"
                rel="noopener"
              >
                <Button className="w-full h-11 rounded-lg font-semibold shadow-lg shadow-primary/20">
                  {bundle.ctaText}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ))}

        {/* Horeca Store Mid-Report CTA */}
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href={HORECA.website} target="_blank" rel="noopener">
              <img src={HORECA.icon} alt="Horeca Store" className="w-16 h-16 rounded-xl shadow-md" />
            </a>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-foreground mb-1">Need Help Choosing Equipment?</h4>
              <p className="text-sm text-muted-foreground">
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>'s
                expert team helps new restaurant owners select the right equipment for their concept and budget.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <a href={`mailto:${HORECA.email}`}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Mail className="mr-1.5 h-3 w-3" />
                  {HORECA.email}
                </Button>
              </a>
              <a href={HORECA.phoneHref}>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Phone className="mr-1.5 h-3 w-3" />
                  {HORECA.phone}
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="bg-gradient-to-br from-[oklch(0.22_0.04_260)] to-[oklch(0.30_0.04_260)] rounded-xl p-8 text-center">
          <a href={HORECA.website} target="_blank" rel="noopener">
            <img src={HORECA.logo} alt="Horeca Store" className="h-8 mx-auto mb-4 brightness-0 invert opacity-80" />
          </a>
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to Start Your Restaurant?
          </h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Get everything you need from professional kitchen equipment to expert guidance.{" "}
            <span className="text-white font-semibold">Horeca Store</span> is your partner from site selection to grand opening.
          </p>
          <a
            href={HORECA.links.equipment}
            target="_blank"
            rel="noopener"
          >
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 h-12 px-8 rounded-xl font-semibold shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Pre-Opening Equipment Bundles at Horeca Store
            </Button>
          </a>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 text-white/60 text-xs">
            <a href={`mailto:${HORECA.email}`} className="flex items-center gap-1 hover:text-white/80">
              <Mail className="h-3 w-3" />
              {HORECA.email}
            </a>
            <a href={HORECA.phoneHref} className="flex items-center gap-1 hover:text-white/80">
              <Phone className="h-3 w-3" />
              {HORECA.phone}
            </a>
            <a href={HORECA.website} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-white/80">
              <ExternalLink className="h-3 w-3" />
              www.thehorecastore.com
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Main Report Page ----

export default function Report() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const address = params.get("address") || "";
  const lat = parseFloat(params.get("lat") || "0");
  const lng = parseFloat(params.get("lng") || "0");
  const leadId = parseInt(params.get("leadId") || "0");
  const concept = useMemo(() => conceptFromSearchParams(params), [params]);
  const hasTriggered = useRef(false);

  const fullReport = trpc.analysis.fullReport.useMutation({
    onError: (err) => {
      captureEvent("full_report_error", { error: err.message.slice(0, 120) });
      toast.error("Failed to generate report. Please try again.");
      console.error(err);
    },
  });

  const updateScore = trpc.lead.updateScore.useMutation();

  // Trigger analysis on mount
  useEffect(() => {
    if (!address || !lat || !lng || !leadId) {
      navigate("/");
      return;
    }
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    fullReport.mutate({ address, lat, lng, leadId, concept });
  }, [address, lat, lng, leadId, concept, navigate]);

  // Update lead score when report is ready
  useEffect(() => {
    if (fullReport.data && leadId) {
      captureEvent("full_report_viewed", {
        recommendation: fullReport.data.recommendation,
        opportunity_score: fullReport.data.opportunityScore,
        concept_fit_score: fullReport.data.conceptFit?.fitScore ?? 0,
      });
      updateScore.mutate({
        leadId,
        opportunityScore: fullReport.data.opportunityScore,
        recommendation: fullReport.data.recommendation,
        conceptFitScore: fullReport.data.conceptFit?.fitScore,
        conceptRecommendation: fullReport.data.conceptFit?.recommendation,
      });
    }
  }, [fullReport.data, leadId]);

  // Loading state
  if (fullReport.isPending || !fullReport.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Generating Your Report
          </h2>
          <p className="text-muted-foreground mb-6">
            Our AI is analyzing competitors, reviews, and market fit for{" "}
            <span className="font-medium text-foreground">{address}</span>
            {concept && concept.serviceModel !== "explore" && (
              <> — <span className="font-medium text-foreground">{concept.cuisineConcept}</span></>
            )}
          </p>
          <div className="space-y-3">
            {[
              "Scanning nearby restaurants...",
              concept?.serviceModel !== "explore" ? "Finding direct competitors for your concept..." : "Mapping competitor landscape...",
              "Analyzing competitor reviews...",
              concept?.serviceModel !== "explore" ? "Scoring your concept fit for this location..." : "Identifying market gaps...",
              "Generating recommendations...",
              "Building Horeca Store equipment checklist...",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                {step}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href={HORECA.website} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <img src={HORECA.logo} alt="Horeca Store" className="h-4 opacity-50" />
              Powered by Horeca Store
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fullReport.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">We couldn't complete the analysis. Please try again.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const report = fullReport.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Horeca Store branding */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">Restaurant Site Finder</span>
          </div>
          <a
            href={HORECA.website}
            target="_blank"
            rel="noopener"
            className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Shop Restaurant Equipment at Horeca Store"
          >
            <img src={HORECA.logo} alt="Horeca Store - Restaurant Equipment" className="h-5" />
          </a>
        </div>
      </nav>

      {/* Horeca Store Banner */}
      <div className="bg-gradient-to-r from-[oklch(0.35_0.15_145)] to-[oklch(0.40_0.12_155)] text-white text-center py-1.5 text-xs">
        <a href={HORECA.website} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:underline">
          <Package className="h-3 w-3" />
          Report powered by <strong>Horeca Store</strong>. Shop 100,000+ restaurant equipment products
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      {/* Report Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-background py-10">
        <div className="container max-w-5xl">
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="mb-2 text-xs">
                <Target className="h-3 w-3 mr-1" />
                {report.conceptFit ? "Concept Fit Report" : "Full Opportunity Report"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {report.conceptFit ? "Concept Location Analysis" : "Location Analysis"}
              </h1>
              <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="break-words">{report.address}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {report.conceptFit ? (
                <>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Your concept</p>
                    <p className={`text-3xl font-bold ${scoreColor(report.conceptFit.fitScore)}`}>
                      {report.conceptFit.fitScore}/10
                    </p>
                  </div>
                  {recommendationBadge(report.conceptFit.recommendation)}
                  <div className="hidden sm:block h-10 w-px bg-border" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Location overall</p>
                    <p className={`text-xl font-bold ${scoreColor(report.opportunityScore)}`}>
                      {report.opportunityScore}/10
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className={`text-3xl font-bold ${scoreColor(report.opportunityScore)}`}>
                      {report.opportunityScore}/10
                    </p>
                  </div>
                  {recommendationBadge(report.recommendation)}
                </>
              )}
{/* PDF Download button hidden - feature coming soon */}
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="container max-w-5xl py-8 space-y-8">
        {report.conceptFit && <ConceptFitSection conceptFit={report.conceptFit} />}
        {report.directCompetitors && report.directCompetitors.length > 0 ? (
          <>
            <CompetitorTable
              competitors={report.directCompetitors}
              title="Direct Competitors for Your Concept"
              subtitle={formatDirectCompetitorAreaSubtitle(
                report.directCompetitors.length,
                report.conceptInput?.serviceModel
              )}
            />
            <CompetitorTable
              competitors={report.competitors}
              title="All Nearby Restaurants"
              subtitle={formatCompetitorAreaSubtitle(
                report.competitors.length,
                report.conceptInput?.serviceModel
              )}
            />
          </>
        ) : (
          <CompetitorTable competitors={report.competitors} />
        )}
        <MarketLogicSection report={report} />
        <ConceptsSection
          concepts={report.concepts}
          score={report.opportunityScore}
          recommendation={report.recommendation}
          title={report.conceptFit ? "Additional Winning Concepts for This Market" : undefined}
        />
        <EquipmentSection bundles={report.equipmentBundles} />

        {/* Social Sharing */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="p-6">
            <SocialShare
              url="https://restaurantsitefinder.com"
              title={`Restaurant Location Analysis for ${report.address}`}
              text={`I just analyzed a restaurant location and got a ${report.opportunityScore}/10 opportunity score. Check out this free tool by Horeca Store!`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer with Horeca Store branding */}
      <footer className="py-10 border-t border-border bg-card">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground text-sm">Restaurant Site Finder</span>
              </div>
              <a href={HORECA.website} target="_blank" rel="noopener">
                <img src={HORECA.logo} alt="Horeca Store" className="h-7 hover:opacity-80 transition-opacity" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 text-sm">
              <a href={HORECA.links.equipment} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                Restaurant Equipment
              </a>
              <a href={HORECA.links.cooking} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                Commercial Cooking Equipment
              </a>
              <a href={HORECA.links.categories} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                All Equipment Categories
              </a>
            </div>

            <Separator className="mb-4" />

            {/* AI Disclaimer */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-border/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Important Disclaimer:</strong> This report is generated using AI and publicly available data. While we strive for accuracy, AI can make mistakes and data may be incomplete or outdated. This analysis is provided for informational purposes only and should not be considered professional business, financial, or legal advice. Always conduct your own due diligence, consult with qualified professionals, and verify all data before making any business decisions, signing leases, or investing capital. Horeca Store and Restaurant Site Finder accept no liability for decisions made based on this report.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground text-center md:text-left">
                Restaurant Site Finder is a free tool provided by{" "}
                <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>{" "}
                . {HORECA.tagline}.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <a href={`mailto:${HORECA.email}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="h-3 w-3" />
                  {HORECA.email}
                </a>
                <a href={HORECA.phoneHref} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="h-3 w-3" />
                  {HORECA.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
