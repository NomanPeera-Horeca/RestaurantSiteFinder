import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const scrollToAnalyze = () => {
    document.getElementById("location-analysis")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-secondary/20 border-y border-border/50">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need deeper analysis.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardContent className="p-8">
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
                Always Free
              </span>
              <p className="text-4xl font-bold text-foreground mb-6">$0</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                {[
                  "Location opportunity score",
                  "Competitor density map",
                  "Market analysis",
                  "Concept fit score",
                  "Rent stress-test calculator",
                  "Restaurant name generator",
                  "Equipment checklist",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-xl" onClick={scrollToAnalyze}>
                Start Free Analysis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className={cn("border-primary/40 shadow-lg shadow-primary/10 relative")}>
            <CardContent className="p-8">
              <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white mb-4">
                Most Popular
              </span>
              <p className="text-4xl font-bold text-foreground">$29<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground mb-6">or $99 one-time, cancel anytime</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                {[
                  "Everything in Free, plus:",
                  "Unlimited analyses",
                  "Save & compare locations",
                  "Full PDF report",
                  "Foot traffic by hour",
                  "Lease risk checklist",
                  "Competitor deep-dive",
                  "Priority support",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-xl" variant="default" onClick={scrollToAnalyze}>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Premium
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Used by 1,200+ restaurant owners
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
