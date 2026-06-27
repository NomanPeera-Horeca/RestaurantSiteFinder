import { useState } from "react";
import { MessageSquarePlus, X, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

const CATEGORIES = [
  { value: "bug_report", label: "Bug Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "report_is_wrong", label: "Report Is Wrong" },
  { value: "missing_my_city", label: "Missing My City" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

function getStoredEmail(): string {
  try {
    return localStorage.getItem("rsf_lead_email") ?? "";
  } catch {
    return "";
  }
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(getStoredEmail);
  const [submitted, setSubmitted] = useState(false);
  const [location] = useLocation();

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setCategory(null);
        setMessage("");
      }, 2500);
    },
    onError: () => {
      toast.error("Could not send feedback. Please try again.");
    },
  });

  function handleSubmit() {
    if (!category || !message.trim()) return;
    submit.mutate({
      category,
      message: message.trim(),
      email: email.trim() || undefined,
      page: location,
    });
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2.5 shadow-lg hover:bg-primary/90 transition-all text-sm font-medium"
        aria-label="Share feedback"
      >
        <MessageSquarePlus className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Share Feedback</span>
      </button>

      {/* Widget panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[340px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <p className="font-semibold text-foreground text-sm">Share your feedback</p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close feedback"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {submitted ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <p className="font-semibold text-foreground mb-1">Thank you</p>
              <p className="text-sm text-muted-foreground">Your feedback has been received.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Category chips */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">What is this about?</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        category === c.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <Textarea
                placeholder="Tell us what happened or what you need..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[90px] text-sm resize-none"
              />

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {email && (
                  <p className="text-xs text-muted-foreground mt-1">Pre-filled from your earlier session.</p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!category || !message.trim() || submit.isPending}
                className="w-full h-9 text-sm font-semibold"
              >
                {submit.isPending ? "Sending..." : "Submit"}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
