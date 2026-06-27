import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RENT_STRESS_STORAGE_KEY } from "@/lib/rent-stress-storage";
import { ArrowRight } from "lucide-react";

const RENT_RATIO = 0.08;
const DAYS_PER_MONTH = 52 / 12;
const BASELINE_TURNS = 2.0;

const PRICE_POINTS = {
  budget: { label: "Budget / Fast Casual (avg check $12)", avgCheck: 12 },
  casual: { label: "Casual Dining (avg check $22)", avgCheck: 22 },
  full: { label: "Full Service / Fine Dining (avg check $45)", avgCheck: 45 },
} as const;

type PricePointKey = keyof typeof PRICE_POINTS;
type RiskLevel = "safe" | "tight" | "high";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTurnoverColor(turns: number): string {
  if (turns < 2.5) return "text-green-600";
  if (turns <= 4) return "text-amber-600";
  return "text-red-600";
}

function getRiskLevel(ratio: number): RiskLevel {
  if (ratio < 0.08) return "safe";
  if (ratio <= 0.12) return "tight";
  return "high";
}

const RISK_STYLES: Record<
  RiskLevel,
  { badge: string; verdict: string; summary: string }
> = {
  safe: {
    badge: "bg-green-100 text-green-800 border-green-200",
    verdict: "Rent fits comfortably at typical turnover for your concept.",
    summary:
      "This location looks financially viable at your concept's price point. Run the full location analysis to confirm foot traffic and competition before signing.",
  },
  tight: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    verdict: "Rent is workable but leaves little cushion for slow weeks.",
    summary:
      "This location is workable but leaves little room for slow weeks. You'll need consistent foot traffic from day one.",
  },
  high: {
    badge: "bg-red-100 text-red-800 border-red-200",
    verdict: "Rent likely outpaces realistic revenue at this price point.",
    summary:
      "At this rent, you need near-perfect occupancy to survive. Most restaurants at this rent-to-revenue ratio close within 2 years. Consider negotiating rent down or finding a different location.",
  },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "Safe Zone",
  tight: "Tight",
  high: "High Risk",
};

export function RentCalculator() {
  const [monthlyRent, setMonthlyRent] = useState("");
  const [pricePoint, setPricePoint] = useState<PricePointKey>("budget");
  const [seatingCapacity, setSeatingCapacity] = useState("40");
  const [daysOpen, setDaysOpen] = useState("6");

  const results = useMemo(() => {
    const rent = parseFloat(monthlyRent.replace(/,/g, ""));
    const seats = parseInt(seatingCapacity, 10);
    const days = parseInt(daysOpen, 10);
    const avgCheck = PRICE_POINTS[pricePoint].avgCheck;

    if (!rent || rent <= 0 || !seats || seats <= 0 || !days || days <= 0) {
      return null;
    }

    const daysPerMonth = days * DAYS_PER_MONTH;
    const monthlyRevenueNeeded = rent / RENT_RATIO;
    const dailyCovers = monthlyRevenueNeeded / avgCheck / daysPerMonth;
    const seatTurnover = dailyCovers / seats;
    const estimatedMonthlyRevenue = seats * avgCheck * daysPerMonth * BASELINE_TURNS;
    const rentRatio = rent / estimatedMonthlyRevenue;
    const risk = getRiskLevel(rentRatio);

    return {
      monthlyRevenueNeeded,
      dailyCovers,
      seatTurnover,
      risk,
      rentRatio,
    };
  }, [monthlyRent, pricePoint, seatingCapacity, daysOpen]);

  useEffect(() => {
    const rent = parseFloat(monthlyRent.replace(/,/g, ""));
    if (!results || !rent || rent <= 0) return;
    localStorage.setItem(
      RENT_STRESS_STORAGE_KEY,
      JSON.stringify({
        monthlyRent: rent,
        monthlyRevenueNeeded: results.monthlyRevenueNeeded,
        dailyCovers: results.dailyCovers,
        seatTurnover: results.seatTurnover,
        risk: results.risk,
        pricePointLabel: PRICE_POINTS[pricePoint].label,
      })
    );
  }, [monthlyRent, pricePoint, results]);

  const scrollToAnalysis = () => {
    document.getElementById("restaurant-location-analysis")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="rent-calculator" className="py-16 bg-muted/20 border-y border-border/50">
      <div className="container max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Will You Actually Be Able to Afford This Location?
          </h2>
          <p className="text-muted-foreground">Run the numbers before you talk to a broker.</p>
        </div>

        <Card className="border-border/60 bg-card shadow-sm mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthly-rent">Monthly Rent ($)</Label>
                <Input
                  id="monthly-rent"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="e.g. 8500"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price-point">Your Price Point</Label>
                <Select
                  value={pricePoint}
                  onValueChange={(v) => setPricePoint(v as PricePointKey)}
                >
                  <SelectTrigger id="price-point" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRICE_POINTS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seating-capacity">Seating Capacity</Label>
                <Input
                  id="seating-capacity"
                  type="number"
                  min={1}
                  step={1}
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days-open">Days Open Per Week</Label>
                <Select value={daysOpen} onValueChange={setDaysOpen}>
                  <SelectTrigger id="days-open" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Revenue You Need
              </p>
              <p className="text-2xl font-bold text-primary mb-2">
                {results ? `${formatCurrency(results.monthlyRevenueNeeded)}/month minimum` : "—"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To keep rent under 8% of revenue (industry benchmark)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Covers Per Day Required
              </p>
              <p className="text-2xl font-bold text-primary mb-2">
                {results ? `${Math.ceil(results.dailyCovers)} covers/day` : "—"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                At your price point to break even on rent alone
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your Seat Turnover Needed
              </p>
              <p
                className={cn(
                  "text-2xl font-bold mb-2",
                  results ? getTurnoverColor(results.seatTurnover) : "text-primary"
                )}
              >
                {results ? `${results.seatTurnover.toFixed(1)} turns/day` : "—"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Table turns needed per day
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Rent Risk Rating
              </p>
              {results ? (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-2",
                      RISK_STYLES[results.risk].badge
                    )}
                  >
                    {RISK_LABELS[results.risk]}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {RISK_STYLES[results.risk].verdict}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-primary mb-2">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        {results && (
          <div className="rounded-xl border border-border/50 bg-card p-6 mb-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {RISK_STYLES[results.risk].summary}
            </p>
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            onClick={scrollToAnalysis}
            className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20"
          >
            Run Full Location Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto mt-4 leading-relaxed">
            Rent math is just one factor. See competitor density, demographics, and opportunity score
            for this exact address — free.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-6">
            Benchmark: rent should be 5–8% of revenue. Source: National Restaurant Association / Paytronix
          </p>
        </div>
      </div>
    </section>
  );
}
