import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { formatTrpcErrorMessage, trpcFieldErrors } from "@/lib/trpc-errors";
import { captureEvent, identifyLead } from "@/lib/posthog";
import { LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import { PHONE_COUNTRIES, formatPhoneWithDial } from "@/lib/phone-countries";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import type { ConceptInput } from "../../../../shared/concept-options";

interface LeadCaptureGateProps {
  address: string;
  lat: number;
  lng: number;
  concept?: ConceptInput;
  conceptLabel?: string;
  embedded?: boolean;
  onCaptured: (leadId: number, email: string) => void;
}

export function LeadCaptureGate({
  address,
  lat,
  lng,
  concept,
  embedded = false,
  onCaptured,
}: LeadCaptureGateProps) {
  const [email, setEmail] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const captureLead = trpc.lead.capture.useMutation({
    onSuccess: (data) => {
      const normalizedEmail = email.trim().toLowerCase();
      const fullPhone = formatPhoneWithDial(dialCode, phoneLocal);
      localStorage.setItem(LEAD_EMAIL_KEY, normalizedEmail);
      identifyLead(normalizedEmail, { phone: fullPhone, leadId: data.leadId });
      captureEvent("lead_form_submitted", {
        email: normalizedEmail,
        phone: fullPhone,
        lead_id: data.leadId,
      });
      if (!embedded) {
        toast.success("Generating your full location analysis...");
      }
      onCaptured(data.leadId, normalizedEmail);
    },
    onError: (err) => {
      captureEvent("lead_capture_failed", { error: formatTrpcErrorMessage(err).slice(0, 120) });
      const fieldErrors = trpcFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      toast.error(formatTrpcErrorMessage(err));
    },
  });

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phoneLocal || phoneLocal.replace(/\D/g, "").length < 7) {
      newErrors.phone = "Please enter a valid mobile number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    captureLead.mutate({
      email: email.trim(),
      phone: formatPhoneWithDial(dialCode, phoneLocal),
      address,
      lat,
      lng,
      serviceModel: concept?.serviceModel,
      cuisineConcept: concept?.cuisineConcept,
      priceTier: concept?.priceTier,
    });
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="gate-email">Email</Label>
        <div className="relative">
          {!embedded && <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
          <Input
            id="gate-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="you@restaurant.com"
            className={embedded ? "h-11" : "pl-10 h-11"}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="gate-phone">Mobile number</Label>
        <div className="flex gap-2">
          <select
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
            className="h-11 w-[120px] shrink-0 rounded-md border border-input bg-background px-2 text-sm"
            aria-label="Country code"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={`${c.code}-${c.dial}`} value={c.dial}>
                {c.dial} {c.code}
              </option>
            ))}
          </select>
          <Input
            id="gate-phone"
            type="tel"
            value={phoneLocal}
            onChange={(e) => {
              setPhoneLocal(e.target.value);
              setErrors((p) => ({ ...p, phone: undefined }));
            }}
            placeholder="(555) 123-4567"
            className="h-11 flex-1"
          />
        </div>
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <Button type="submit" disabled={captureLead.isPending} className="w-full h-12 rounded-xl font-semibold">
        {captureLead.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Unlocking...
          </>
        ) : (
          "See My Full Report"
        )}
      </Button>
    </form>
  );

  if (embedded) return form;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 sm:p-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Your report is ready</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Full on-screen analysis is free. Enter your details and we will show the complete report on this page.
      </p>
      {form}
      <p className="text-xs text-center text-muted-foreground mt-4">No spam. Your report stays in your account.</p>
    </div>
  );
}
