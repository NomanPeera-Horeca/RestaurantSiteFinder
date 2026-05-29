import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Star, TrendingUp, Lock, ChevronRight, Utensils
} from "lucide-react";
import type { InitialScan } from "../../../shared/analysis-types";
import { HORECA } from "@/lib/horeca-brand";
import { motion } from "framer-motion";

interface InitialScanPreviewProps {
  data: InitialScan;
  onUnlock: () => void;
}

export function InitialScanPreview({ data, onUnlock }: InitialScanPreviewProps) {
  return (
    <section className="py-16 bg-background" id="scan-results">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Initial Scan Complete
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Location Snapshot
            </h2>
            <p className="text-muted-foreground">{data.address}</p>
            {data.conceptLabel && (
              <p className="text-sm text-primary font-medium mt-1">{data.conceptLabel}</p>
            )}
            {data.searchRadiusMiles && (
              <p className="text-xs text-muted-foreground mt-1">
                Scanning a {data.searchRadiusMiles}-mile trade area
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{data.competitorCount}</p>
                    <p className="text-xs text-muted-foreground">Competitors Nearby</p>
                    {data.searchRadiusMiles && (
                      <p className="text-[10px] text-muted-foreground/80">within {data.searchRadiusMiles} mi</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-chart-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{data.averageRating}</p>
                    <p className="text-xs text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 col-span-2 md:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {data.directCompetitorCount ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Direct Competitors</p>
                    {data.searchRadiusMiles && (
                      <p className="text-[10px] text-muted-foreground/80">within {data.searchRadiusMiles} mi</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{data.topCuisines.length}</p>
                    <p className="text-xs text-muted-foreground">Cuisine Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Cuisines */}
          <Card className="mb-8 border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-card-foreground mb-3">Top Cuisines in Area</h3>
              <div className="flex flex-wrap gap-2">
                {data.topCuisines.map((cuisine) => (
                  <Badge key={cuisine} variant="outline" className="px-3 py-1 text-sm">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Insight */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary mb-1">Quick Insight</p>
              <p className="text-card-foreground leading-relaxed">{data.previewInsight}</p>
            </CardContent>
          </Card>

          {/* Blurred Preview / Lead Wall CTA */}
          <div className="relative rounded-2xl overflow-hidden border border-border/50">
            {/* Blurred fake content */}
            <div className="p-8 filter blur-sm opacity-50 pointer-events-none select-none">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-background/80">
              <div className="text-center px-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Unlock Your Full Opportunity Report
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  Get the complete competitor analysis, market signals, winning concepts, risk scores, and your personalized{" "}
                  <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>{" "}
                  equipment checklist.
                </p>
                <Button
                  size="lg"
                  onClick={onUnlock}
                  className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
                >
                  Get My Free Report
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Free forever. powered by{" "}
                  <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
