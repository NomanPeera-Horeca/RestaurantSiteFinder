import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function ReportBriefLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 8));
    }, 60);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <h2 className="text-xl font-bold text-foreground mb-2">Unlocking your full report</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
        Running AI on competitor reviews and building your GO / NO-GO verdict. This usually takes 30 to 60 seconds.
      </p>
      <div className="w-full max-w-xs">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
