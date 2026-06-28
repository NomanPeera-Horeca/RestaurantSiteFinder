import { useEffect, useMemo, useRef, useState } from "react";
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
  Users, TrendingDown, Search, ShieldCheck, RefreshCw, Lock
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import type { FullReport, Competitor, WinningConcept, EquipmentBundle, MenuMarketFit, ConceptFit } from "../../../shared/analysis-types";
import { conceptFromSearchParams } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import { serviceModelLabel } from "../../../shared/concept-options";
import { formatCompetitorAreaSubtitle, formatDirectCompetitorAreaSubtitle } from "../../../shared/search-config";
import { distanceMilesBetween, roundDistanceMiles } from "../../../shared/geo";
import { getCompetitorConceptLabel, proximityLabel } from "../../../shared/competitor-classifier";
import { MMF_TOOLTIP, verdictScoreClass } from "@/lib/verdict-styles";
import {
  CONCEPT_FIT_TOOLTIP,
  MMF_SECTION_TOOLTIP,
  countCuisines,
  formatCuisineBreakdown,
  formatReviewVolume,
  totalReviewCount,
  patternsToDifferentiationActions,
  pickMenuMarketFitConcept,
  recommendationHeadline,
  recommendationSummary,
} from "@/lib/report-helpers";
import { RecommendationProgress } from "@/components/analysis/RecommendationProgress";
import { PremiumReportActions } from "@/components/PremiumReportSections";
import { PremiumPdfDownloadButton } from "@/components/PremiumPdfReport";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

function priceLevelLabel(level: number | null): string {
  if (level === null || level === undefined) return "N/A";
  return ["Free", "$", "$$", "$$$", "$$$$"][level] ?? "N/A";
}

function scoreColor(score: number, recommendation?: string): string {
  if (recommendation === "GO") return "text-green-700";
  if (recommendation === "NO-GO") return "text-red-700";
  if (recommendation === "CAUTION") return "text-amber-700";
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

function competitorDistanceMiles(
  c: Competitor,
  originLat?: number,
  originLng?: number
): number | null {
  if (c.distanceMiles != null) return c.distanceMiles;
  if (originLat == null || originLng == null || !c.lat || !c.lng) return null;
  return roundDistanceMiles(distanceMilesBetween(originLat, originLng, c.lat, c.lng));
}

const COMPETITOR_TABLE_INITIAL = 25;

function CompetitorTable({
  competitors,
  title,
  subtitle,
  originLat,
  originLng,
  markDirectRivals = false,
}: {
  competitors: Competitor[];
  title?: string;
  subtitle?: string;
  originLat?: number;
  originLng?: number;
  markDirectRivals?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const withDistance = competitors.map((c) => ({
      ...c,
      distanceMiles: competitorDistanceMiles(c, originLat, originLng) ?? c.distanceMiles,
    }));
    return [...withDistance].sort((a, b) => (a.distanceMiles ?? 99) - (b.distanceMiles ?? 99));
  }, [competitors, originLat, originLng]);

  const visible = showAll ? sorted : sorted.slice(0, COMPETITOR_TABLE_INITIAL);
  const hasMore = sorted.length > COMPETITOR_TABLE_INITIAL;
  const ratedCompetitors = competitors.filter(c => c.rating > 0);
  const avgRating = ratedCompetitors.length > 0
    ? ratedCompetitors.reduce((sum, c) => sum + c.rating, 0) / ratedCompetitors.length
    : 0;
  const showRatingCallout = competitors.length > 0 && ratedCompetitors.length > 0;
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
              {sorted.length > 0 && (
                <span className="block text-xs mt-0.5">Sorted nearest first. Closest rivals matter most.</span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showRatingCallout && (
          <div
            className={`rounded-lg p-3 mb-4 flex items-center gap-3 text-sm font-medium ${
              avgRating < 4.0
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-muted/50 border border-border text-muted-foreground"
            }`}
          >
            <Star className={`h-4 w-4 shrink-0 ${avgRating < 4.0 ? "text-green-600" : "text-muted-foreground"}`} />
            {avgRating < 4.0 ? (
              <span>
                Average competitor rating is {avgRating.toFixed(1)}: below the 4.0 quality threshold. Low-quality competition means room for you to stand out.
              </span>
            ) : (
              <span>
                Average competitor rating is {avgRating.toFixed(1)}: this market has strong existing players. Quality will matter.
              </span>
            )}
          </div>
        )}
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold text-center">Distance</TableHead>
                <TableHead className="font-semibold">Service · Concept</TableHead>
                <TableHead className="font-semibold text-center">Rating</TableHead>
                <TableHead className="font-semibold text-center">Reviews</TableHead>
                <TableHead className="font-semibold text-center">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c, index) => {
                const proximity = proximityLabel(index, c.distanceMiles);
                const conceptLabel = getCompetitorConceptLabel(c);
                return (
                <TableRow key={c.placeId} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{c.name}</span>
                      {proximity && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/25 hover:bg-primary/10">
                          {proximity}
                        </Badge>
                      )}
                      {markDirectRivals && (
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                          Direct rival
                        </Badge>
                      )}
                      {c.userRatingsTotal >= 1000 && (
                        <Badge className="text-xs bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                          Dominant
                        </Badge>
                      )}
                      {c.userRatingsTotal > 0 && c.userRatingsTotal < 20 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                          New
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-xs font-medium whitespace-nowrap">
                    {c.distanceMiles != null ? `${c.distanceMiles.toFixed(1)} mi` : "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <p className="text-xs font-medium text-foreground leading-snug">{conceptLabel}</p>
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
              );})}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing {visible.length} of {sorted.length} restaurants · nearest listed first
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show fewer" : `Show all ${sorted.length} restaurants`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PremiumInsightsSection() {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Premium Insights</CardTitle>
            <p className="text-sm text-muted-foreground">Unlock deeper data to make a confident decision before signing</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground text-sm">Foot Traffic Estimate</p>
              <Badge variant="secondary" className="text-xs ml-auto">Premium</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Peak hours, daily volume estimate, and seasonal patterns for this address based on competitor activity and area type.</p>
            <div className="h-16 rounded-lg bg-muted/40 flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground text-sm">Lease Risk Assessment</p>
              <Badge variant="secondary" className="text-xs ml-auto">Premium</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Rent-to-revenue stress test, break-even timeline, and red flags to negotiate before you sign the lease.</p>
            <div className="h-16 rounded-lg bg-muted/40 flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">Available with RSF Premium</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConceptFitSection({ conceptFit }: { conceptFit: ConceptFit }) {
  const rec = conceptFit.recommendation;
  const recBg =
    rec === "GO"
      ? "bg-green-50 border-green-200 text-green-900"
      : rec === "NO-GO"
        ? "bg-red-50 border-red-200 text-red-900"
        : "bg-amber-50 border-amber-200 text-amber-900";

  return (
    <Card
      className={`border-2 bg-card ${
        rec === "GO" ? "border-green-400" : rec === "NO-GO" ? "border-red-400" : "border-amber-400"
      }`}
    >
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  Your Concept Fit Analysis
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm text-left">
                      {CONCEPT_FIT_TOOLTIP}
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <p className="text-sm font-medium text-foreground mt-1">{conceptFit.userConceptSummary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 sm:text-right">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 sm:justify-end">
                  Concept fit score
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="What is concept fit?">
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-left">
                      {CONCEPT_FIT_TOOLTIP}
                    </TooltipContent>
                  </Tooltip>
                </p>
                <p className={`text-3xl font-bold ${verdictScoreClass(rec)}`}>{conceptFit.fitScore}/10</p>
              </div>
              {recommendationBadge(rec)}
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${recBg}`}>
            <p className="font-semibold text-sm">{recommendationHeadline(rec)}</p>
            <p className="text-sm mt-1 opacity-90">{recommendationSummary(rec)}</p>
            <p className="text-sm mt-2 opacity-80">{conceptFit.summary}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50 shadow-none">
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-foreground mb-2">Competitive landscape</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{conceptFit.competitiveVerdict}</p>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                {conceptFit.directCompetitorCount} direct competitor(s) identified nearby.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-foreground mb-2">Why it works or fails here</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{conceptFit.whyItWorksOrFails}</p>
            </CardContent>
          </Card>
        </div>

        {(rec === "NO-GO" || rec === "CAUTION") && conceptFit.alternativeConcepts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Better concepts for this location
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {conceptFit.alternativeConcepts.map((alt, i) => (
                <Card key={i} className="border-border/50 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-semibold text-foreground">{alt.name}</p>
                      <Badge variant="outline">{alt.fitScore}/10</Badge>
                    </div>
                    <p className="text-xs text-primary mb-2">
                      {serviceModelLabel(alt.serviceModel)} · {alt.cuisineType}
                    </p>
                    <p className="text-sm text-muted-foreground">{alt.whyBetter}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(rec === "NO-GO" || rec === "CAUTION") && conceptFit.alternativeLocationGuidance && (
          <Card className="border-amber-200 bg-amber-50/50 shadow-none">
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-700" />
                Where your original concept might work better
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{conceptFit.alternativeLocationGuidance}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function MenuMarketFitBlock({ concept }: { concept: WinningConcept }) {
  const mmf = concept.menuMarketFit;
  if (!mmf) return null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" />
          Menu-Market Fit · {concept.name}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-left">
              {MMF_SECTION_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Demand score</span>
          <span className={`font-bold text-sm ${scoreColor(mmf.demandScore)}`}>{mmf.demandScore}/10</span>
        </div>
      </div>
      <RecommendationProgress value={mmf.demandScore * 10} recommendation={mmf.demandScore >= 7 ? "GO" : mmf.demandScore >= 4 ? "CAUTION" : "NO-GO"} className="h-2" />
      <p className="text-sm text-muted-foreground leading-relaxed">{mmf.demandExplanation}</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/50 bg-background p-3">
          <p className="text-xs font-semibold text-foreground mb-1">Population match</p>
          <p className="text-sm text-muted-foreground leading-snug">{mmf.populationMatch}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background p-3">
          <p className="text-xs font-semibold text-foreground mb-1">Demand signals</p>
          <p className="text-sm text-muted-foreground leading-snug">{mmf.searchDemandSignals}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background p-3">
          <p className="text-xs font-semibold text-foreground mb-1">Competitive edge</p>
          <p className="text-sm text-muted-foreground leading-snug">{mmf.competitiveAdvantage}</p>
        </div>
      </div>
    </div>
  );
}

function MarketLogicSection({ report }: { report: FullReport }) {
  const { marketAnalysis } = report;
  const cuisineCounts = countCuisines(report.competitors);
  const breakdown = formatCuisineBreakdown(cuisineCounts);
  const reviewTotal = totalReviewCount(report.competitors);
  const reviewVolume = formatReviewVolume(reviewTotal);
  const differentiation = patternsToDifferentiationActions(marketAnalysis.reviewSentiment.patterns);
  const mmfConcept = pickMenuMarketFitConcept(report);

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
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Saturated Cuisines
            </h4>
            {marketAnalysis.saturatedCuisines.length > 0 ? (
              <div className="space-y-2">
                {marketAnalysis.saturatedCuisines.map((c) => {
                  const count = cuisineCounts.find((x) => x.cuisine === c)?.count;
                  return (
                    <div key={c} className="flex items-center gap-2 text-sm">
                      <span className="text-red-500">✖</span>
                      <span className="text-foreground">{c}{count ? ` (${count} nearby)` : ""}</span>
                      <Badge variant="outline" className="text-xs text-red-600 border-red-200 ml-auto">Saturated</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No heavily saturated cuisines detected in mapped competitors.</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Cuisine Coverage in Trade Area
            </h4>
            <p className="text-sm text-foreground font-medium">{breakdown}</p>
            {marketAnalysis.underservedCuisines.length > 0 ? (
              <div className="space-y-2">
                {marketAnalysis.underservedCuisines.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✔</span>
                    <span className="text-foreground">{c}</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 ml-auto">Opportunity</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                With {breakdown}, this trade area appears well covered. Few clear cuisine gaps remain for a new entrant without strong differentiation.
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Review Sentiment Analysis
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {reviewVolume} customer reviews from Google Places across {report.competitors.length} mapped restaurants in your trade area.
              We sample the highest-signal review text from direct rivals and nearby leaders.
            </p>
          </div>

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
        </div>

        {differentiation.length > 0 && (
          <>
            <Separator />
            <Card className="border-amber-200 bg-amber-50/40 shadow-none">
              <CardContent className="p-5">
                <p className="font-semibold text-amber-900 text-sm mb-1 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  How You Can Differentiate If You Proceed
                </p>
                <p className="text-xs text-amber-800 mb-4">
                  Review patterns from {reviewVolume} nearby customer reviews. These are concrete plays to stand out.
                </p>
                <ol className="space-y-3 list-none">
                  {differentiation.map((action, i) => (
                    <li key={i} className="flex gap-3 text-sm text-amber-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{action}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        )}

        <Separator />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Area Demographics
              </p>
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">AI Estimate</Badge>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Income & lifestyle (estimated)</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">{marketAnalysis.demographics}</p>
            </div>
            <p className="text-xs text-muted-foreground/70 italic">
              Inferred from competitor price tiers, service models, and review language. Not census data. Look for income band, office vs family mix, dine-in vs delivery strength.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 space-y-3">
            <p className="font-medium text-foreground text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Foot Traffic Signal
            </p>
            {(() => {
              const ft = marketAnalysis.footTraffic.toLowerCase();
              const isHigh = ft.includes("high") || ft.includes("busy") || ft.includes("heavy");
              const isLow = ft.includes("low") || ft.includes("quiet") || ft.includes("light");
              const level = isHigh ? "HIGH" : isLow ? "LOW" : "MEDIUM";
              const color = isHigh ? "text-green-600 bg-green-50 border-green-200" : isLow ? "text-red-600 bg-red-50 border-red-200" : "text-yellow-600 bg-yellow-50 border-yellow-200";
              return (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${color}`}>
                  <Gauge className="h-3.5 w-3.5" />
                  {level}
                </div>
              );
            })()}
            <p className="text-sm text-muted-foreground leading-relaxed">{marketAnalysis.footTraffic}</p>
          </div>
        </div>

        {mmfConcept?.menuMarketFit && (
          <>
            <Separator />
            <MenuMarketFitBlock concept={mmfConcept} />
          </>
        )}
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
              <CardTitle className="text-lg">{title ?? "Winning Concepts"}</CardTitle>
              <p className="text-sm text-muted-foreground">Ranked by fit for this trade area. #1 is our top pick.</p>
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
              <span className={`text-4xl font-bold ${scoreColor(score, recommendation)}`}>{score}/10</span>
              {recommendationBadge(recommendation)}
            </div>
          </div>
          <RecommendationProgress value={score * 10} recommendation={recommendation} className="h-3" />
        </div>

        {/* Concepts */}
        <div className="space-y-4">
          {concepts.map((concept, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden ${i === 0 ? "border-primary border-2 shadow-md" : "border-border/50"}`}
            >
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 sm:p-5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                        {concept.name}
                        {i === 0 && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wide">
                            Top pick
                          </Badge>
                        )}
                      </h4>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                              <HelpCircle className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-left">
                            {MMF_TOOLTIP}
                          </TooltipContent>
                        </Tooltip>
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
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      <div className="rounded-lg border border-border/50 bg-background p-3 flex gap-3">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-0.5">Population Match</p>
                          <p className="text-sm text-muted-foreground leading-snug">{concept.menuMarketFit.populationMatch}</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background p-3 flex gap-3">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Search className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-0.5">Demand Signals</p>
                          <p className="text-sm text-muted-foreground leading-snug">{concept.menuMarketFit.searchDemandSignals}</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background p-3 flex gap-3">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-0.5">Competitive Advantage</p>
                          <p className="text-sm text-muted-foreground leading-snug">{concept.menuMarketFit.competitiveAdvantage}</p>
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

function EquipmentSection({ bundles, recommendation }: { bundles: EquipmentBundle[]; recommendation?: string }) {
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
                Your Equipment Checklist: Powered by Horeca Store
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

        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Horeca Store supplies hood systems, fryers, refrigeration, and full kitchen packages. Financing from $99/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`mailto:${HORECA.email}`} className="flex-1">
              <Button className="w-full rounded-lg font-semibold">
                Talk to an Equipment Specialist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={HORECA.website} target="_blank" rel="noopener" className="flex-1">
              <Button variant="outline" className="w-full rounded-lg font-semibold">
                Browse Equipment
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

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
            {recommendation === "NO-GO" || recommendation === "CAUTION"
              ? "Talk to a Specialist Before You Commit"
              : "Ready to Set Up Your Kitchen?"}
          </h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            {recommendation === "NO-GO" || recommendation === "CAUTION"
              ? "This location has risks worth understanding before signing. Horeca Store's team works with new restaurant owners on concept fit, equipment planning, and lease strategy."
              : "Get professional kitchen equipment matched to your concept. Horeca Store is your partner from site selection to grand opening."}
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

export function ReportScoreHeader({
  report,
  showActions = true,
  onRunAnother,
}: {
  report: FullReport;
  showActions?: boolean;
  onRunAnother?: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-background py-8 rounded-2xl border border-border/50">
      <div className="px-6">
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 text-xs">
              <Target className="h-3 w-3 mr-1" />
              {report.conceptFit ? "Concept Fit Report" : "Full Opportunity Report"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {report.conceptFit
                ? `${report.conceptFit.recommendation === "GO" ? "This Location Works for Your Concept" : report.conceptFit.recommendation === "NO-GO" ? "This Location Does Not Fit Your Concept" : "Proceed With Caution at This Location"}`
                : "Location Opportunity Report"}
            </h2>
            <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="break-words">{report.address}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {report.conceptFit ? (
              <>
                <div className="text-left" title="How well your specific concept fits this location based on direct competition, service model, and market demand">
                  <p className="text-xs text-muted-foreground">Your concept score</p>
                  <p className={`text-3xl font-bold ${verdictScoreClass(report.conceptFit.recommendation)}`}>
                    {report.conceptFit.fitScore}/10
                  </p>
                  <p className="text-xs text-muted-foreground italic">concept fit</p>
                </div>
                {recommendationBadge(report.conceptFit.recommendation)}
                <div className="hidden sm:block h-10 w-px bg-border" />
                <div className="text-left" title="Overall opportunity score for this location regardless of concept, based on competition density, market gaps, and review signals">
                  <p className="text-xs text-muted-foreground">Location overall</p>
                  <p className={`text-xl font-bold ${scoreColor(report.opportunityScore, report.recommendation)}`}>
                    {report.opportunityScore}/10
                  </p>
                  <p className="text-xs text-muted-foreground italic">location score</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className={`text-3xl font-bold ${scoreColor(report.opportunityScore, report.recommendation)}`}>
                    {report.opportunityScore}/10
                  </p>
                </div>
                {recommendationBadge(report.recommendation)}
              </>
            )}
            {showActions && onRunAnother && (
              <button
                onClick={onRunAnother}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 border border-border/50 rounded-lg px-3 py-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Run Another Analysis
              </button>
            )}
            {showActions && (
              <>
                <PremiumPdfDownloadButton report={report} />
                <PremiumReportActions />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportBody({ report }: { report: FullReport }) {
  return (
    <div className="space-y-8">
      {report.conceptFit && <ConceptFitSection conceptFit={report.conceptFit} />}

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Location Opportunity Score</p>
                <p className="text-xs text-muted-foreground">Based on competition density, market gaps, and demand signals from {report.competitors.length} nearby restaurants</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto shrink-0">
              <span className={`text-4xl font-bold ${scoreColor(report.opportunityScore, report.recommendation)}`}>{report.opportunityScore}/10</span>
              {recommendationBadge(report.recommendation)}
            </div>
          </div>
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              report.recommendation === "GO"
                ? "bg-green-50 border-green-200 text-green-900"
                : report.recommendation === "NO-GO"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <p className="font-semibold">{recommendationHeadline(report.recommendation)}</p>
            <p className="mt-1 opacity-90">{recommendationSummary(report.recommendation)}</p>
          </div>
          <RecommendationProgress value={report.opportunityScore * 10} recommendation={report.recommendation} className="h-3" />
        </CardContent>
      </Card>

      {report.directCompetitors && report.directCompetitors.length > 0 ? (
        <>
          <CompetitorTable
            competitors={report.directCompetitors}
            title="Direct Competitors for Your Concept"
            subtitle={formatDirectCompetitorAreaSubtitle(
              report.directCompetitors.length,
              report.conceptInput?.serviceModel
            )}
            originLat={report.lat}
            originLng={report.lng}
            markDirectRivals
          />
          <CompetitorTable
            competitors={report.competitors}
            title="All Nearby Restaurants"
            subtitle={formatCompetitorAreaSubtitle(
              report.competitors.length,
              report.conceptInput?.serviceModel
            )}
            originLat={report.lat}
            originLng={report.lng}
          />
        </>
      ) : (
        <CompetitorTable
          competitors={report.competitors}
          originLat={report.lat}
          originLng={report.lng}
        />
      )}
      <MarketLogicSection report={report} />
      <ConceptsSection
        concepts={report.concepts}
        score={report.opportunityScore}
        recommendation={report.recommendation}
        title={report.conceptFit ? "Additional Winning Concepts for This Market" : undefined}
      />
      <EquipmentSection bundles={report.equipmentBundles} recommendation={report.conceptFit?.recommendation ?? report.recommendation} />
    </div>
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
              <>
                {", "}
                <span className="font-medium text-foreground">{concept.cuisineConcept}</span>
              </>
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
      <div className="container max-w-5xl py-10">
        <ReportScoreHeader report={report} showActions onRunAnother={() => navigate("/")} />
      </div>

      {/* Report Sections */}
      <div className="container max-w-5xl py-8">
        <ReportBody report={report} />
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
                Restaurant Site Finder is provided by{" "}
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
