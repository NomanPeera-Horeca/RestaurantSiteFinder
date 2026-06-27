import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { captureEvent } from "@/lib/posthog";
import { usePremium } from "@/hooks/usePremium";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PremiumGateProps {
  feature: string;
  children: ReactNode;
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const { isPremium, isLoading, email } = usePremium();
  const checkout = trpc.subscription.createCheckout.useMutation();

  useEffect(() => {
    if (!isPremium && !isLoading) {
      captureEvent("upgrade_modal_viewed", { feature });
    }
  }, [feature, isPremium, isLoading]);

  const startCheckout = async (plan: "monthly" | "lifetime") => {
    if (!email) {
      document.getElementById("location-analysis")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    captureEvent("upgrade_cta_clicked", { plan, feature });
    try {
      const result = await checkout.mutateAsync({ email, plan });
      captureEvent("checkout_session_created", { plan });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Checking subscription…
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-xl border border-border/50 overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[2px] p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Premium Feature</h3>
            <p className="text-sm text-muted-foreground mt-1">{feature}</p>
          </div>

          {!email ? (
            <>
              <p className="text-sm text-muted-foreground">
                Run a free analysis first to unlock premium features
              </p>
              <Button
                className="rounded-xl"
                onClick={() =>
                  document.getElementById("location-analysis")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Start Free Analysis →
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="rounded-xl"
                  disabled={checkout.isPending}
                  onClick={() => startCheckout("monthly")}
                >
                  {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock Monthly — $29/mo"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={checkout.isPending}
                  onClick={() => startCheckout("lifetime")}
                >
                  One-Time Access — $99
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cancel anytime. Your analyses are saved for life.
              </p>
              <p className="text-xs text-muted-foreground">
                Already paid?{" "}
                <button
                  type="button"
                  className="text-primary underline hover:no-underline"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
