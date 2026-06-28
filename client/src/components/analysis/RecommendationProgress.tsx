import * as ProgressPrimitive from "@radix-ui/react-progress";
import { recommendationProgressClasses } from "@/lib/report-helpers";
import { cn } from "@/lib/utils";

interface RecommendationProgressProps {
  value: number;
  recommendation: string;
  className?: string;
}

export function RecommendationProgress({
  value,
  recommendation,
  className,
}: RecommendationProgressProps) {
  const colors = recommendationProgressClasses(recommendation);
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-3 w-full overflow-hidden rounded-full", colors.track, className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", colors.indicator)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
