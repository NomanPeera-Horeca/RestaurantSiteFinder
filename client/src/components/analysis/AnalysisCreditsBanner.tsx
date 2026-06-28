import { getReportsRemaining, isReportAdmin } from "@/lib/report-credits";
import { Button } from "@/components/ui/button";

interface AnalysisCreditsBannerProps {
  onAnalyzeAnother: () => void;
}

export function AnalysisCreditsBanner({ onAnalyzeAnother }: AnalysisCreditsBannerProps) {
  const admin = isReportAdmin();
  const remaining = getReportsRemaining();
  if (!admin && remaining <= 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm font-medium text-amber-900">
        {admin ? (
          <>Admin testing mode: generate as many reports as you need.</>
        ) : (
          <>
            You have <strong>{remaining} report{remaining === 1 ? "" : "s"} remaining</strong>. Curious how a different address compares?
          </>
        )}
      </p>
      <Button
        type="button"
        variant="outline"
        className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0"
        onClick={onAnalyzeAnother}
      >
        Analyze another location
      </Button>
    </div>
  );
}
