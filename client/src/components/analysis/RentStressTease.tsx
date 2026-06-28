import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { FullReport } from "../../../../shared/analysis-types";

interface RentStressTeaseProps {
  report: FullReport;
}

export function RentStressTease({ report }: RentStressTeaseProps) {
  const score = report.opportunityScore;
  const estRentPct = score >= 7 ? 7.2 : score >= 5 ? 8.2 : 10.5;
  const maxRent = score >= 7 ? 5200 : score >= 5 ? 4200 : 3100;
  const verdict = estRentPct > 8 ? "CAUTION" : "OK";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.04_260)] to-[oklch(0.30_0.04_260)] text-white p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <h3 className="text-xl font-bold mb-2">Can you afford the rent here?</h3>
        <p className="text-sm text-white/75 mb-5 max-w-lg">
          Based on this location&apos;s trade area, here is a quick stress test. Fine-tune with your own numbers on the rent calculator.
        </p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-2xl font-bold">{estRentPct.toFixed(1)}%</p>
            <p className="text-[11px] text-white/60 uppercase tracking-wide">Est. rent-to-revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold">${maxRent.toLocaleString()}</p>
            <p className="text-[11px] text-white/60 uppercase tracking-wide">Max sustainable rent/mo</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${verdict === "CAUTION" ? "text-amber-300" : "text-green-300"}`}>{verdict}</p>
            <p className="text-[11px] text-white/60 uppercase tracking-wide">At typical asking rent</p>
          </div>
        </div>
      </div>
      <Link href="/restaurant-rent-calculator">
        <Button className="bg-white text-[oklch(0.22_0.04_260)] hover:bg-white/90 h-12 px-6 rounded-xl font-semibold whitespace-nowrap">
          Open Rent Calculator →
        </Button>
      </Link>
    </div>
  );
}
