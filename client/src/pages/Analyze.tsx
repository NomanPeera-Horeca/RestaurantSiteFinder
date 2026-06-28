import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalysisFlow } from "@/components/analysis/AnalysisFlow";
import { trpc } from "@/lib/trpc";
import { appendConceptToSearchParams, conceptFromSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { captureEvent } from "@/lib/posthog";
import type { InitialScan } from "../../../shared/analysis-types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Analyze() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const address = params.get("address") ?? "";
  const lat = parseFloat(params.get("lat") ?? "0");
  const lng = parseFloat(params.get("lng") ?? "0");
  const concept = useMemo(() => conceptFromSearchParams(params) ?? defaultConceptInput, [params]);

  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const scanTriggered = useRef(false);

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
      scanTriggered.current = false;
      navigate("/");
    },
  });

  useEffect(() => {
    if (!address || !lat || !lng || !isConceptReady(concept)) {
      navigate("/");
      return;
    }
    if (scanTriggered.current) return;
    scanTriggered.current = true;
    initialScan.mutate({ address, lat, lng, concept });
  }, [address, lat, lng, concept, navigate]);

  const handleScanComplete = (data: InitialScan) => {
    const conceptLabel = concept.cuisineConcept?.toLowerCase() ?? "restaurant";
    toast.success("Heavy lifting done", {
      description: `We mapped ${data.competitorCount} restaurants in your trade area, matched ${data.directCompetitorCount ?? 0} direct ${conceptLabel} rivals, and flagged the review patterns brokers never share. Scroll down to see what we found.`,
      duration: 6000,
    });
  };

  const handleAnalyzeAnother = () => {
    navigate("/");
  };

  if (!address || !lat || !lng) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader active="home" />
      {initialScan.isPending && !scanData ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Analyzing your trade area</h1>
          <p className="text-sm text-muted-foreground max-w-md">{address}</p>
        </div>
      ) : (
        <AnalysisFlow
          scanData={scanData}
          concept={concept}
          address={address}
          lat={lat}
          lng={lng}
          isInitialScanPending={initialScan.isPending}
          onAnalyzeAnother={handleAnalyzeAnother}
          onScanComplete={handleScanComplete}
          fullPage
        />
      )}
    </div>
  );
}

export function buildAnalyzeUrl(
  address: string,
  lat: number,
  lng: number,
  concept: Parameters<typeof appendConceptToSearchParams>[1]
): string {
  const params = new URLSearchParams({
    address,
    lat: String(lat),
    lng: String(lng),
  });
  appendConceptToSearchParams(params, concept);
  return `/analyze?${params.toString()}`;
}
