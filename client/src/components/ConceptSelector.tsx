import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import {
  CUISINE_PRESETS,
  PRICE_TIERS,
  SERVICE_MODELS,
  formatConceptLabel,
  type ConceptInput,
} from "../../../shared/concept-options";

interface ConceptSelectorProps {
  value: ConceptInput;
  onChange: (value: ConceptInput) => void;
  compact?: boolean;
}

function isPresetCuisine(cuisine: string): boolean {
  return (CUISINE_PRESETS as readonly string[]).includes(cuisine) && cuisine !== "Other";
}

function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "border-border/80 bg-white text-foreground hover:border-primary/35 hover:bg-primary/5",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ConceptSelector({ value, onChange, compact }: ConceptSelectorProps) {
  const isExplore = value.serviceModel === "explore";
  const showCustomInput = !isExplore && (!value.cuisineConcept || !isPresetCuisine(value.cuisineConcept));
  const presetCuisines = CUISINE_PRESETS.filter(c => c !== "Other");
  const serviceModels = SERVICE_MODELS.filter(m => m.value !== "explore");
  const showSummary = !compact && !isExplore && value.cuisineConcept.trim();

  return (
    <div className="space-y-5">
      {showSummary && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="text-muted-foreground">Analyzing: </span>
          <span className="font-semibold">{formatConceptLabel(value)}</span>
        </div>
      )}

      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-foreground">Service model</p>
        <div className="flex flex-wrap gap-2">
          {serviceModels.map(m => (
            <Chip
              key={m.value}
              selected={value.serviceModel === m.value}
              onClick={() =>
                onChange({
                  ...value,
                  serviceModel: m.value,
                  mode: "specific",
                  cuisineConcept: value.cuisineConcept || "Burgers",
                })
              }
            >
              {m.label}
            </Chip>
          ))}
        </div>
        <Chip
          selected={isExplore}
          onClick={() =>
            onChange({
              ...value,
              serviceModel: "explore",
              mode: "explore",
              cuisineConcept: "",
            })
          }
          className={cn(
            "w-full sm:w-auto",
            isExplore
              ? "border-dashed"
              : "border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
          )}
        >
          Not sure yet: suggest conceptssuggest concepts for me
        </Chip>
      </div>

      {isExplore ? (
        <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ll scan the trade area and suggest three winning concepts tailored to local gaps: no concept required.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Cuisine / concept</p>
            <div className="flex flex-wrap gap-2">
              {presetCuisines.map(c => (
                <Chip
                  key={c}
                  selected={value.cuisineConcept === c}
                  onClick={() => onChange({ ...value, mode: "specific", cuisineConcept: c })}
                >
                  {c}
                </Chip>
              ))}
              <Chip
                selected={showCustomInput}
                onClick={() => onChange({ ...value, mode: "specific", cuisineConcept: "" })}
              >
                Other
              </Chip>
            </div>
            {showCustomInput && (
              <Input
                id="custom-concept"
                placeholder="Describe your concept, e.g.e.g. Smash burgers & shakes, $12–15 check"
                value={value.cuisineConcept}
                onChange={e => onChange({ ...value, mode: "specific", cuisineConcept: e.target.value })}
                className="h-11 rounded-xl border-border/80 bg-white"
              />
            )}
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">
              Price tier <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={!value.priceTier}
                onClick={() => onChange({ ...value, priceTier: undefined })}
              >
                Skip
              </Chip>
              {PRICE_TIERS.map(p => (
                <Chip
                  key={p.value}
                  selected={value.priceTier === p.value}
                  onClick={() => onChange({ ...value, priceTier: p.value })}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
