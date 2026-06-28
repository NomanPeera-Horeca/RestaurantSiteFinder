import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { captureEvent } from "@/lib/posthog";
import { LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UpgradeLifetimeButtonProps {
  feature: string;
  email?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}

export function UpgradeLifetimeButton({
  feature,
  email,
  className,
  size = "default",
  label = "Upgrade for $49 — unlock PDFs and more reports",
}: UpgradeLifetimeButtonProps) {
  const checkout = trpc.subscription.createCheckout.useMutation();

  const startCheckout = async () => {
    const checkoutEmail = email || localStorage.getItem(LEAD_EMAIL_KEY) || "";
    if (!checkoutEmail) {
      toast.error("Enter your email at the report gate to continue to checkout.");
      return;
    }
    captureEvent("upgrade_cta_clicked", { plan: "lifetime", feature });
    try {
      const result = await checkout.mutateAsync({ email: checkoutEmail, plan: "lifetime" });
      captureEvent("checkout_session_created", { plan: "lifetime" });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    }
  };

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={checkout.isPending}
      onClick={startCheckout}
    >
      {checkout.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Opening checkout...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
