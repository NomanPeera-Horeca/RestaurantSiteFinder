import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumGate } from "@/components/PremiumGate";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { BarChart3, ClipboardList, GitCompare, Save } from "lucide-react";

function FootTrafficPreview() {
  const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
  const values = [18, 42, 88, 55, 92, 48];
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Foot Traffic by Hour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32 mb-2">
          {values.map((v, i) => (
            <div key={hours[i]} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary/20 rounded-t" style={{ height: `${v}%` }} />
              <span className="text-[10px] text-muted-foreground">{hours[i]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Peak lunch 12–1pm · Dinner surge 6–8pm</p>
      </CardContent>
    </Card>
  );
}

function LeaseRiskPreview() {
  const items = [
    { label: "Rent-to-revenue ratio", value: "11.2%", risk: "High" },
    { label: "Required daily covers", value: "84", risk: "Medium" },
    { label: "Lease escalation clause", value: "4%/yr", risk: "Review" },
    { label: "Co-tenancy protection", value: "Missing", risk: "High" },
  ];
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Lease Risk Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between text-sm border-b border-border/30 pb-2 last:border-0">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
            <span className="text-xs text-amber-600">{item.risk}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PremiumReportActions() {
  const { isPremium, isLoading } = usePremium();

  return (
    <div className="flex flex-wrap gap-2">
      <PremiumGate feature="Save & Revisit Analyses">
        <Button variant="outline" size="sm" className="rounded-lg">
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save Analysis
        </Button>
      </PremiumGate>
      {!isLoading && !isPremium && (
        <PremiumGate feature="Full PDF Report Download">
          <div className="rounded-lg border border-dashed border-border/60 px-4 py-2 text-sm text-muted-foreground">
            Full PDF Report Download
          </div>
        </PremiumGate>
      )}
      <PremiumGate feature="Compare 2 Locations Side by Side">
        <Button variant="outline" size="sm" className="rounded-lg">
          <GitCompare className="mr-1.5 h-3.5 w-3.5" />
          Compare Locations
        </Button>
      </PremiumGate>
    </div>
  );
}

export function PremiumFootTrafficSection() {
  return (
    <PremiumGate feature="Foot Traffic by Hour & Daypart">
      <FootTrafficPreview />
    </PremiumGate>
  );
}

export function PremiumLeaseRiskSection() {
  return (
    <PremiumGate feature="Lease Risk Checklist">
      <LeaseRiskPreview />
    </PremiumGate>
  );
}
