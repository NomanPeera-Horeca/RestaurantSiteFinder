import { ConceptSelector } from "@/components/ConceptSelector";
import { AddressSearch } from "@/components/AddressSearch";
import { cn } from "@/lib/utils";
import type { ConceptInput } from "../../../shared/concept-options";
import { Sparkles } from "lucide-react";

interface AnalysisHeroCardProps {
  concept: ConceptInput;
  onConceptChange: (concept: ConceptInput) => void;
  onAnalyze: (address: string, lat: number, lng: number) => void;
  isLoading?: boolean;
  canAnalyze?: boolean;
  prefillAddress?: string;
  prefillRevision?: number;
}

export function AnalysisHeroCard({
  concept,
  onConceptChange,
  onAnalyze,
  isLoading,
  canAnalyze = true,
  prefillAddress,
  prefillRevision,
}: AnalysisHeroCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-3xl text-left">
      <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent opacity-80" />
      <div className="relative rounded-[1.25rem] border border-border/60 bg-white shadow-xl shadow-primary/5">
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground sm:text-xl">
                Is This Location Right for Your Restaurant?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your concept, enter an address, and get data-backed location intelligence for that exact spot.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">
          <ConceptSelector value={concept} onChange={onConceptChange} />

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="space-y-3 pt-6 overflow-visible">
              <p className="text-sm font-semibold text-foreground">Location</p>
              <AddressSearch
                onAnalyze={onAnalyze}
                isLoading={isLoading}
                canAnalyze={canAnalyze}
                prefillAddress={prefillAddress}
                prefillRevision={prefillRevision}
              />
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  !canAnalyze && "text-amber-700/90"
                )}
              >
                {canAnalyze
                  ? "No credit card. Full report unlocks with email."
                  : "Select a service model and cuisine above to continue."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
