import type { ReactNode } from "react";
import type { InitialScan } from "../../../../shared/analysis-types";
import type { ConceptInput } from "../../../../shared/concept-options";
import { formatConceptLabel } from "../../../../shared/concept-options";
import { buildScanMomentCopy } from "@/lib/scan-moment-copy";
import { LeadCaptureGate } from "./LeadCaptureGate";
import { ConfettiOverlay } from "./ConfettiOverlay";

interface ScanMomentCardProps {
  scanData: InitialScan;
  concept: ConceptInput;
  address: string;
  lat: number;
  lng: number;
  onCaptured: (leadId: number, email: string) => void;
}

function BlurredValue({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block blur-md opacity-55 select-none bg-white/20 rounded px-2">{children}</span>
  );
}

export function ScanMomentCard({
  scanData,
  concept,
  address,
  lat,
  lng,
  onCaptured,
}: ScanMomentCardProps) {
  const copy = buildScanMomentCopy(scanData, concept);

  return (
    <>
      <ConfettiOverlay active />
      <div className="rounded-2xl bg-gradient-to-br from-[#145c39] via-[#1a7a4c] to-[#0f172a] text-white p-7 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />

        <div className="relative text-center">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.14em] uppercase bg-white/15 border border-white/25 px-3 py-1 rounded-full mb-3">
            {copy.badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{copy.headline}</h2>
          <p className="text-sm text-white/90 max-w-md mx-auto mb-1">{copy.subtext}</p>
          <p className="text-xs text-white/65 max-w-sm mx-auto mb-5">{copy.detail}</p>

          <div className="flex flex-wrap justify-center gap-5 mb-5">
            <div>
              <div className="text-2xl font-bold">{scanData.competitorCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Mapped</div>
            </div>
            <div>
              <div className="text-2xl font-bold"><BlurredValue>██</BlurredValue></div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Direct rivals</div>
            </div>
            <div>
              <div className="text-2xl font-bold"><BlurredValue>█.█</BlurredValue></div>
              <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Avg rating</div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-xl px-4 text-left mb-5">
            {[
              "Your GO / NO-GO recommendation",
              "Top weakness in competitor reviews",
              "#1 cuisine gap in the trade area",
            ].map((label) => (
              <div
                key={label}
                className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0 text-sm"
              >
                <span className="text-white/70">{label}</span>
                <span className="blur-sm opacity-50 bg-white/25 rounded px-3 py-0.5 text-xs font-bold">
                  Locked
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white text-foreground rounded-xl p-5 text-left">
          <p className="text-sm font-semibold text-center mb-4">
            Enter your details to see your full report
          </p>
          <LeadCaptureGate
            embedded
            address={address}
            lat={lat}
            lng={lng}
            concept={concept}
            conceptLabel={formatConceptLabel(concept)}
            onCaptured={onCaptured}
          />
        </div>
      </div>
    </>
  );
}
