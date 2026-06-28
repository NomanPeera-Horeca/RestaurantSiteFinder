import { useEffect, useState } from "react";

/** Advances active step index on a timer while work is in progress (Perplexity-style). */
export function useLiveAgentSteps(running: boolean, stepCount: number, intervalMs = 1400): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!running) {
      setActiveIndex(stepCount - 1);
      return;
    }
    setActiveIndex(0);
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i >= stepCount - 1 ? i : i + 1));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [running, stepCount, intervalMs]);

  return activeIndex;
}

export function stepStatusForIndex(
  index: number,
  activeIndex: number,
  finished: boolean
): "pending" | "active" | "done" {
  if (finished) return "done";
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}
