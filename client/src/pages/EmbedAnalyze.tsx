import { useEffect, useRef, useState } from "react";
import { AnalysisHeroCard } from "@/components/AnalysisHeroCard";
import { InitialScanPreview } from "@/components/InitialScanPreview";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { appendConceptToSearchParams, defaultConceptInput, isConceptReady } from "@/lib/concept";
import { trpc } from "@/lib/trpc";
import type { ConceptInput } from "../../../shared/concept-options";
import type { InitialScan } from "../../../shared/analysis-types";
import { toast } from "sonner";

export const EMBED_HEIGHT_MESSAGE = "rsf-embed-height";

function navigateTop(path: string) {
  const url = path.startsWith("http") ? path : `${window.location.origin}${path}`;
  if (window.top && window.top !== window) {
    window.top.location.href = url;
    return;
  }
  window.location.href = url;
}

function postEmbedHeight() {
  if (window.parent === window) return;
  const height = Math.ceil(document.documentElement.scrollHeight);
  window.parent.postMessage({ type: EMBED_HEIGHT_MESSAGE, height }, window.location.origin);
}

export default function EmbedAnalyze() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scanData, setScanData] = useState<InitialScan | null>(null);
  const [concept, setConcept] = useState<ConceptInput>(defaultConceptInput);
  const [locationData, setLocationData] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");

    const prevHtmlBg = document.documentElement.style.background;
    const prevBodyBg = document.body.style.background;
    const prevBodyMargin = document.body.style.margin;
    const prevOverflow = document.documentElement.style.overflowX;
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.documentElement.style.overflowX = "hidden";
    document.body.classList.add("embed-analyze");

    return () => {
      document.documentElement.style.background = prevHtmlBg;
      document.body.style.background = prevBodyBg;
      document.body.style.margin = prevBodyMargin;
      document.documentElement.style.overflowX = prevOverflow;
      document.body.classList.remove("embed-analyze");
    };
  }, []);

  useEffect(() => {
    postEmbedHeight();
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => postEmbedHeight());
    observer.observe(el);
    window.addEventListener("load", postEmbedHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", postEmbedHeight);
    };
  }, [scanData, showLeadModal]);

  const initialScan = trpc.analysis.initialScan.useMutation({
    onSuccess: data => {
      setScanData(data);
      requestAnimationFrame(postEmbedHeight);
    },
    onError: err => {
      toast.error("Failed to scan location. Please try again.");
      console.error(err);
    },
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
    if (!locationData) return;
    const params = new URLSearchParams({
      address: locationData.address,
      lat: String(locationData.lat),
      lng: String(locationData.lng),
      leadId: String(leadId),
    });
    appendConceptToSearchParams(params, concept);
    navigateTop(`/report?${params.toString()}`);
  };

  return (
    <div ref={rootRef} className="min-h-0 bg-transparent p-1 sm:p-2">
      <AnalysisHeroCard
        concept={concept}
        onConceptChange={setConcept}
        onAnalyze={handleAnalyze}
        isLoading={initialScan.isPending}
        canAnalyze={isConceptReady(concept)}
        variant="sidebar"
        buttonLabel="Analyze My Location Now"
      />

      {scanData && (
        <div className="mt-4">
          <InitialScanPreview data={scanData} onUnlock={() => setShowLeadModal(true)} />
        </div>
      )}

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
