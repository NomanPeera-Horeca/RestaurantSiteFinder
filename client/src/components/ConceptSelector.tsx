import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const showCustomInput = !value.cuisineConcept || !isPresetCuisine(value.cuisineConcept);
  const presetCuisines = CUISINE_PRESETS.filter(c => c !== "Other");
  const serviceModels = SERVICE_MODELS.filter(m => m.value !== "explore");
  const showSummary = !compact && value.cuisineConcept.trim();

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
      </div>

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
            placeholder="e.g. Smash burgers, Korean BBQ, wine bar"
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
    </div>
  );
}
