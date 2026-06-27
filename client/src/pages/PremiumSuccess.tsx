import { useEffect } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { captureEvent } from "@/lib/posthog";
import { CheckCircle2, ArrowRight } from "lucide-react";

const UNLOCKED_FEATURES = [
  "Unlimited location analyses",
  "Save & compare locations",
  "Full PDF report download",
  "Foot traffic by hour",
  "Lease risk checklist",
  "Competitor deep-dive",
];

export default function PremiumSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan") ?? "unknown";
    captureEvent("premium_upgrade_completed", { plan });
    document.title = "Premium Activated | Restaurant Site Finder";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-32 pb-20">
        <div className="container max-w-lg text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">You&apos;re now a Premium member</h1>
          <p className="text-muted-foreground mb-8">
            Your upgrade is active. Here&apos;s what you unlocked:
          </p>
          <ul className="text-left space-y-3 mb-10 max-w-sm mx-auto">
            {UNLOCKED_FEATURES.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/">
            <Button size="lg" className="rounded-xl font-semibold h-12 px-8">
              Run Your First Premium Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
