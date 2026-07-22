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
  variant?: "default" | "sidebar";
  buttonLabel?: string;
}

export function AnalysisHeroCard({
  concept,
  onConceptChange,
  onAnalyze,
  isLoading,
  canAnalyze = true,
  prefillAddress,
  prefillRevision,
  variant = "default",
  buttonLabel,
}: AnalysisHeroCardProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "relative w-full text-left",
        isSidebar ? "mx-0 max-w-none" : "mx-auto max-w-3xl"
      )}
    >
      <div
        className={cn(
          "absolute -inset-px bg-gradient-to-br from-primary/30 via-primary/10 to-transparent opacity-80",
          isSidebar ? "rounded-[1.1rem]" : "rounded-[1.35rem]"
        )}
      />
      <div
        className={cn(
          "relative border border-border/60 bg-white shadow-xl shadow-primary/5",
          isSidebar ? "rounded-[1rem]" : "rounded-[1.25rem]"
        )}
      >
        <div
          className={cn(
            "border-b border-border/50 bg-gradient-to-r from-primary/[0.07] to-transparent",
            isSidebar ? "px-4 py-3.5" : "px-5 py-4 sm:px-7 sm:py-5"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25",
                isSidebar ? "h-9 w-9" : "h-10 w-10"
              )}
            >
              <Sparkles className={isSidebar ? "h-4 w-4" : "h-5 w-5"} />
            </div>
            <div>
              <p
                className={cn(
                  "font-semibold text-foreground",
                  isSidebar ? "text-base leading-snug" : "text-lg sm:text-xl"
                )}
              >
                Is This Location Right for Your Restaurant?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSidebar
                  ? "Select your concept, enter an address, and get data-backed location intelligence for that exact spot."
                  : "Select your concept, enter an address, and get a data-backed verdict for that exact location."}
              </p>
            </div>
          </div>
        </div>

        <div className={cn("space-y-5", isSidebar ? "px-4 py-5" : "space-y-6 px-5 py-6 sm:px-7 sm:py-7")}>
          <ConceptSelector value={concept} onChange={onConceptChange} />

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className={cn("space-y-3 overflow-visible", isSidebar ? "pt-5" : "pt-6")}>
              <p className="text-sm font-semibold text-foreground">Location</p>
              <AddressSearch
                onAnalyze={onAnalyze}
                isLoading={isLoading}
                canAnalyze={canAnalyze}
                prefillAddress={prefillAddress}
                prefillRevision={prefillRevision}
                buttonLabel={buttonLabel}
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
