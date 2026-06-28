import { cn } from "@/lib/utils";

export interface AgentStep {
  id: string;
  label: string;
  sublabel?: string;
  status: "pending" | "active" | "done";
}

interface AnalysisAgentProgressProps {
  title: string;
  steps: AgentStep[];
  isActive?: boolean;
  dimmed?: boolean;
}

export function AnalysisAgentProgress({ title, steps, isActive = true, dimmed = false }: AnalysisAgentProgressProps) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-opacity", dimmed && "opacity-50")}>
      <div className="flex items-center gap-3 mb-5">
        {isActive && <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />}
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative flex gap-4 pb-4 pl-5 border-l-2 ml-1.5 last:pb-0",
              step.status === "done" && "border-l-primary",
              step.status === "active" && "border-l-primary",
              step.status === "pending" && "border-l-border last:border-l-transparent"
            )}
          >
            <span
              className={cn(
                "absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-background",
                step.status === "done" && "bg-primary",
                step.status === "active" && "bg-primary ring-4 ring-primary/20",
                step.status === "pending" && "bg-border"
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm",
                  step.status === "active" && "font-semibold text-foreground",
                  step.status === "done" && "text-muted-foreground",
                  step.status === "pending" && "text-muted-foreground/70"
                )}
              >
                {step.label}
              </p>
              {step.sublabel && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.sublabel}</p>
              )}
            </div>
            {index === steps.length - 1 ? null : null}
          </div>
        ))}
      </div>
    </div>
  );
}
