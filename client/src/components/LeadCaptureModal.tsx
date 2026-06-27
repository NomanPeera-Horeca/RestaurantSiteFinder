import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { captureEvent, identifyLead } from "@/lib/posthog";
import { LEAD_EMAIL_KEY } from "@/hooks/usePremium";
import { HORECA } from "@/lib/horeca-brand";
import { toast } from "sonner";
import { X, Mail, Phone, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConceptInput } from "../../../shared/concept-options";

interface LeadCaptureModalProps {
  address: string;
  lat: number;
  lng: number;
  concept?: ConceptInput;
  onClose: () => void;
  onCaptured: (leadId: number) => void;
}

export function LeadCaptureModal({ address, lat, lng, concept, onClose, onCaptured }: LeadCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const captureLead = trpc.lead.capture.useMutation({
    onSuccess: (data) => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = phone.trim();
      localStorage.setItem(LEAD_EMAIL_KEY, normalizedEmail);
      identifyLead(normalizedEmail, { phone: normalizedPhone, leadId: data.leadId });
      captureEvent("lead_form_submitted", {
        email: normalizedEmail,
        phone: normalizedPhone,
        lead_id: data.leadId,
      });
      toast.success("Report unlocked! Generating your full analysis...");
      onCaptured(data.leadId);
    },
    onError: (err) => {
      captureEvent("lead_capture_failed", { error: err.message.slice(0, 120) });
      const message = err.message.includes("Database")
        ? "We couldn't save your contact info, but you can still view your report. Please try again."
        : err.message || "Something went wrong. Please try again.";
      toast.error(message);
      console.error(err);
    },
  });

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    captureLead.mutate({
      email,
      phone,
      address,
      lat,
      lng,
      serviceModel: concept?.serviceModel,
      cuisineConcept: concept?.cuisineConcept,
      priceTier: concept?.priceTier,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border/50 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors z-10"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 pb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground mb-1">
              Unlock Your Full Report
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to access the complete Opportunity Report and personalized{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline font-medium">Horeca Store</a>{" "}
              Equipment Checklist.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                  placeholder="you@restaurant.com"
                  className="pl-10 h-11"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-card-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  placeholder="(555) 123-4567"
                  className="pl-10 h-11"
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <Button
              type="submit"
              disabled={captureLead.isPending}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
            >
              {captureLead.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Get My Free Report"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to receive communications from{" "}
              <a href={HORECA.website} target="_blank" rel="noopener" className="text-primary hover:underline">Horeca Store</a>. We respect your privacy.
            </p>
            <div className="flex items-center justify-center pt-1">
              <a href={HORECA.website} target="_blank" rel="noopener">
                <img src={HORECA.logo} alt="Horeca Store" className="h-4 opacity-40 hover:opacity-70 transition-opacity" />
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
