import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { captureEvent } from "@/lib/posthog";
import { toast } from "sonner";
import { loadRentStressData, type RentStressData } from "@/lib/rent-stress-storage";
import { serviceModelLabel } from "../../../shared/concept-options";
import type { FullReport, Competitor, EquipmentItem } from "../../../shared/analysis-types";

const MARGIN = 20;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SECTION_GAP = 12;
const LINE_H = 1.6;

const C = {
  heading: [17, 24, 39] as [number, number, number],
  body: [55, 65, 81] as [number, number, number],
  muted: [156, 163, 175] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  yellow: [217, 119, 6] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  rule: [229, 231, 235] as [number, number, number],
};

function lineStep(fontSize: number): number {
  return fontSize * 0.3528 * LINE_H;
}

function formatReportDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addressSlug(address: string): string {
  return address
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function parseAddressParts(address: string): { city: string; state: string; zip: string } {
  const match = address.match(/,\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/i);
  if (match) {
    return { city: match[1].trim(), state: match[2].toUpperCase(), zip: match[3] ?? "" };
  }
  const parts = address.split(",").map(p => p.trim());
  return {
    city: parts.length >= 2 ? parts[parts.length - 2] : "",
    state: parts.length >= 1 ? parts[parts.length - 1].replace(/\d.*/, "").trim() : "",
    zip: (address.match(/\d{5}(?:-\d{4})?/) ?? [""])[0],
  };
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function recommendationLabel(rec: string, score: number): string {
  if (rec === "NO-GO") return "AVOID";
  if (rec === "CAUTION") return "CAUTION";
  if (score >= 8) return "STRONG";
  return "PROCEED";
}

function scoreColor(score: number, rec: string): [number, number, number] {
  if (rec === "NO-GO" || score < 4) return C.red;
  if (rec === "CAUTION" || score < 7) return C.yellow;
  return C.green;
}

function riskLabel(risk: RentStressData["risk"]): string {
  if (risk === "safe") return "Safe";
  if (risk === "tight") return "Tight";
  return "High Risk";
}

function riskVerdict(risk: RentStressData["risk"]): string {
  if (risk === "safe") {
    return "At the rent figure you entered, the location appears financially viable for your concept's average check. Confirm foot traffic and competition on-site before committing to a lease.";
  }
  if (risk === "tight") {
    return "The rent is workable but leaves limited margin for slow periods. You will need consistent covers from opening week and should negotiate tenant improvements or a rent abatement period.";
  }
  return "At this rent level, required daily covers likely exceed realistic turnover for your seating capacity and price point. Negotiate rent downward or reconsider this location before signing.";
}

function deriveFactorScores(report: FullReport) {
  const count = report.competitors.length;
  const competitionScore = Math.max(1, Math.min(10, Math.round(10 - count / 4)));
  const demandScore =
    report.concepts[0]?.menuMarketFit?.demandScore ??
    (report.marketAnalysis.underservedCuisines.length > 2 ? 8 : report.marketAnalysis.underservedCuisines.length > 0 ? 6 : 5);
  const conceptFitScore = report.conceptFit?.fitScore ?? Math.round(report.opportunityScore * 0.95);

  const underserved = report.marketAnalysis.underservedCuisines.slice(0, 2).join(", ");

  return {
    marketDemand: {
      score: demandScore,
      note: underserved ? `Gap in ${underserved}` : "Market appears balanced",
    },
    competition: {
      score: competitionScore,
      note: `${count} restaurants in trade area`,
    },
    conceptFit: {
      score: conceptFitScore,
      note: report.conceptFit?.recommendation ?? report.recommendation,
    },
    overall: {
      score: report.opportunityScore,
      note: recommendationLabel(report.recommendation, report.opportunityScore),
    },
  };
}

function executiveSummary(report: FullReport): string {
  const score = report.opportunityScore;
  const rec = recommendationLabel(report.recommendation, score);
  const count = report.competitors.length;
  if (rec === "AVOID") {
    return `This location scores ${score}/10 with an AVOID recommendation. With ${count} nearby restaurants and notable cuisine saturation, the trade area presents significant headwinds for a new entrant at this address. Proceed only with a differentiated concept and favorable lease terms.`;
  }
  if (rec === "CAUTION") {
    return `This location scores ${score}/10 with a CAUTION recommendation. The market shows mixed signals: some opportunity exists, but competition and saturation factors require careful validation before signing a lease.`;
  }
  if (rec === "STRONG") {
    return `This location scores ${score}/10 with a STRONG recommendation. Market gaps, demand signals, and competitive positioning align well for a new restaurant concept at this address.`;
  }
  return `This location scores ${score}/10 with a PROCEED recommendation. Analysis indicates reasonable market opportunity, though on-site verification of foot traffic and lease economics remains essential before committing.`;
}

function marketSummary(report: FullReport): string {
  const m = report.marketAnalysis;
  const parts: string[] = [];
  if (m.underservedCuisines.length) {
    parts.push(`Underserved cuisines include ${m.underservedCuisines.slice(0, 3).join(", ")}`);
  }
  if (m.saturatedCuisines.length) {
    parts.push(`saturated categories include ${m.saturatedCuisines.slice(0, 3).join(", ")}`);
  }
  parts.push(m.demographics);
  return parts.join(". ") + ".";
}

function competitionFinding(report: FullReport): string {
  const count = report.competitors.length;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount;
  if (direct !== undefined && direct > 0) {
    return `${direct} direct competitor(s) and ${count} total restaurants nearby. Review concept differentiation carefully.`;
  }
  if (count >= 20) return `${count} restaurants in the trade area. High density; differentiation is critical.`;
  if (count >= 10) return `${count} restaurants nearby. Moderate competition with room for a distinct concept.`;
  return `Only ${count} restaurants in the immediate area. Lower competition density.`;
}

function conceptFitFinding(report: FullReport): string {
  if (report.conceptFit) {
    return `Concept fit ${report.conceptFit.fitScore}/10: ${report.conceptFit.recommendation}. ${report.conceptFit.summary}`;
  }
  return `Location opportunity ${report.opportunityScore}/10: ${report.recommendation}. See winning concept suggestions in this report.`;
}

function marketGapParagraph(report: FullReport): string {
  const count = report.competitors.length;
  const underserved = report.marketAnalysis.underservedCuisines;
  const saturated = report.marketAnalysis.saturatedCuisines;
  let text = `This trade area contains ${count} restaurants within the analysis radius. `;
  if (underserved.length) {
    text += `Market gaps exist in ${underserved.join(", ")}, suggesting room for concepts that fill those niches. `;
  } else {
    text += `Few clear cuisine gaps were detected, meaning a new entrant must win on execution, pricing, or experience rather than category alone. `;
  }
  if (saturated.length) {
    text += `Avoid direct competition in already-saturated categories: ${saturated.join(", ")}. `;
  }
  if (report.conceptInput?.cuisineConcept) {
    text += `For a ${report.conceptInput.cuisineConcept} concept, ${report.conceptFit?.competitiveVerdict ?? "validate direct competitor overlap before signing."}`;
  }
  return text.trim();
}

function buildMarketAnalysisText(report: FullReport): string[] {
  const m = report.marketAnalysis;
  const paragraphs: string[] = [];

  paragraphs.push(m.demographics);
  paragraphs.push(m.footTraffic);

  if (m.underservedCuisines.length) {
    paragraphs.push(
      `Underserved cuisine opportunities: ${m.underservedCuisines.join(", ")}. These categories show lower representation relative to demand signals in the area.`
    );
  }
  if (m.saturatedCuisines.length) {
    paragraphs.push(
      `Saturated cuisine categories: ${m.saturatedCuisines.join(", ")}. Entering these segments requires clear differentiation.`
    );
  }

  if (m.reviewSentiment.patterns.length) {
    paragraphs.push(`Key market patterns: ${m.reviewSentiment.patterns.join(" ")}`);
  }
  if (m.reviewSentiment.topComplaints.length) {
    paragraphs.push(
      `Common customer complaints in this market: ${m.reviewSentiment.topComplaints.slice(0, 4).join("; ")}.`
    );
  }
  if (m.reviewSentiment.topPraises.length) {
    paragraphs.push(
      `What customers value here: ${m.reviewSentiment.topPraises.slice(0, 4).join("; ")}.`
    );
  }

  return paragraphs.filter(Boolean);
}

function equipmentPriority(item: EquipmentItem): "Essential" | "Recommended" {
  const essential = ["cooking", "refrigeration", "ventilation", "hood", "safety", "prep"];
  const haystack = `${item.category} ${item.name}`.toLowerCase();
  return essential.some(k => haystack.includes(k)) ? "Essential" : "Recommended";
}

function collectEquipmentItems(report: FullReport): { name: string; priority: "Essential" | "Recommended" }[] {
  const seen = new Set<string>();
  const items: { name: string; priority: "Essential" | "Recommended" }[] = [];
  for (const bundle of report.equipmentBundles) {
    for (const item of bundle.items) {
      if (seen.has(item.name)) continue;
      seen.add(item.name);
      items.push({ name: item.name, priority: equipmentPriority(item) });
    }
  }
  return items;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

class PdfWriter {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN;
  }

  ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - MARGIN) {
      this.newPage();
    }
  }

  drawRule() {
    this.doc.setDrawColor(...C.rule);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 4;
  }

  heading(text: string, size = 14) {
    this.ensureSpace(size * 0.5 + SECTION_GAP);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.heading);
    this.doc.text(text, MARGIN, this.y);
    this.y += lineStep(size) + 2;
  }

  subheading(text: string, size = 11) {
    this.ensureSpace(lineStep(size) + 4);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.heading);
    this.doc.text(text, MARGIN, this.y);
    this.y += lineStep(size) + 1;
  }

  body(text: string, size = 10) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.body);
    const lines = this.doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      this.ensureSpace(lineStep(size));
      this.doc.text(line, MARGIN, this.y);
      this.y += lineStep(size);
    }
  }

  muted(text: string, size = 8) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.muted);
    const lines = this.doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      this.ensureSpace(lineStep(size));
      this.doc.text(line, MARGIN, this.y);
      this.y += lineStep(size);
    }
  }

  bullet(text: string) {
    this.body(`• ${text}`);
  }

  sectionGap() {
    this.y += SECTION_GAP;
  }

  drawTable(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 7;
    const startX = MARGIN;
    this.ensureSpace(rowH * (rows.length + 2));

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...C.heading);
    let x = startX;
    headers.forEach((h, i) => {
      this.doc.text(h, x + 1, this.y);
      x += colWidths[i];
    });
    this.y += rowH;
    this.drawRule();

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...C.body);
    for (const row of rows) {
      this.ensureSpace(rowH);
      x = startX;
      row.forEach((cell, i) => {
        const clipped = this.doc.splitTextToSize(cell, colWidths[i] - 2);
        this.doc.text(clipped[0] ?? "", x + 1, this.y);
        x += colWidths[i];
      });
      this.y += rowH;
    }
    this.y += 4;
  }
}

async function renderScoreBadgeImage(score: number, rec: string, rgb: [number, number, number]): Promise<string> {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;left:-9999px;top:0;width:320px;padding:24px;background:#fff;font-family:Helvetica,Arial,sans-serif;";
  const color = `rgb(${rgb.join(",")})`;
  el.innerHTML = `<div style="font-size:48px;font-weight:700;color:${color};line-height:1">${score}/10</div><div style="font-size:18px;font-weight:700;color:${color};margin-top:8px">${rec}</div>`;
  document.body.appendChild(el);
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", logging: false });
    return canvas.toDataURL("image/png");
  } finally {
    document.body.removeChild(el);
  }
}

function pageCover(w: PdfWriter, report: FullReport) {
  const { doc } = w;
  doc.setFillColor(...C.heading);
  doc.rect(0, 0, PAGE_W, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.heading);
  doc.text("RestaurantSiteFinder", MARGIN, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(formatReportDate(), PAGE_W - MARGIN, 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...C.heading);
  doc.text("Location Analysis Report", PAGE_W / 2, 90, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...C.body);
  const addrLines = doc.splitTextToSize(report.address, CONTENT_W - 20);
  doc.text(addrLines, PAGE_W / 2, 105, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...C.muted);
  doc.text("Prepared for the owner of this report", PAGE_W / 2, 120, { align: "center" });

  w.y = PAGE_H - 30;
  w.drawRule();
  w.muted("Generated by RestaurantSiteFinder.com · A free tool by Horeca Store", 8);
}

async function pageExecutiveSummary(w: PdfWriter, report: FullReport) {
  w.newPage();
  const score = report.opportunityScore;
  const rec = recommendationLabel(report.recommendation, score);
  const color = scoreColor(score, report.recommendation);

  w.heading("Executive Summary");
  w.subheading("Your Opportunity Score");

  const badgeImg = await renderScoreBadgeImage(score, rec, color);
  w.doc.addImage(badgeImg, "PNG", MARGIN, w.y - 2, 50, 22);
  w.y += 26;

  w.body(executiveSummary(report));
  w.sectionGap();

  w.subheading("Key Findings");
  w.bullet(`Market: ${marketSummary(report)}`);
  w.bullet(`Competition: ${competitionFinding(report)}`);
  w.bullet(`Concept Fit: ${conceptFitFinding(report)}`);
}

function pageLocationDetails(w: PdfWriter, report: FullReport) {
  w.newPage();
  const parts = parseAddressParts(report.address);
  const factors = deriveFactorScores(report);

  w.heading("Location Details");
  w.subheading("Address & Trade Area");
  w.body(`Address: ${report.address}`);
  w.body(`Coordinates: ${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`);
  w.body(`City: ${parts.city} · State: ${parts.state} · ZIP: ${parts.zip || "N/A"}`);
  w.sectionGap();

  w.subheading("Opportunity Breakdown");
  w.drawTable(
    ["Factor", "Score", "Notes"],
    [
      ["Market Demand", `${factors.marketDemand.score}/10`, factors.marketDemand.note],
      ["Competition Density", `${factors.competition.score}/10`, factors.competition.note],
      ["Concept Fit", `${factors.conceptFit.score}/10`, String(factors.conceptFit.note)],
      ["Overall", `${factors.overall.score}/10`, factors.overall.note],
    ],
    [55, 25, CONTENT_W - 80]
  );
}

function pageMarketAnalysis(w: PdfWriter, report: FullReport) {
  w.newPage();
  w.heading("Market Analysis");
  for (const para of buildMarketAnalysisText(report)) {
    w.body(para);
    w.y += 3;
  }
}

function competitorNote(c: Competitor, report: FullReport): string {
  const dist = distanceMiles(report.lat, report.lng, c.lat, c.lng);
  return `${dist.toFixed(1)} mi · ${c.rating.toFixed(1)}★`;
}

function pageCompetition(w: PdfWriter, report: FullReport) {
  w.newPage();
  w.heading("Competition Analysis");
  w.subheading("Nearby Competitors");

  const rows = report.competitors.slice(0, 20).map(c => [
    c.name.slice(0, 28),
    c.cuisine.slice(0, 16),
    `${distanceMiles(report.lat, report.lng, c.lat, c.lng).toFixed(1)} mi`,
    competitorNote(c, report).slice(0, 24),
  ]);

  if (rows.length) {
    w.drawTable(["Name", "Type", "Distance", "Notes"], rows, [45, 35, 25, CONTENT_W - 105]);
  } else {
    w.body("No competitor data available for this location.");
  }

  w.sectionGap();
  w.subheading("Market Gap Assessment");
  w.body(marketGapParagraph(report));
}

function pageConceptFit(w: PdfWriter, report: FullReport) {
  w.newPage();
  w.heading("Concept Fit");
  w.subheading("Concept Recommendation");

  if (report.conceptInput) {
    w.body(`Service model: ${serviceModelLabel(report.conceptInput.serviceModel)}`);
    if (report.conceptInput.cuisineConcept) {
      w.body(`Cuisine concept: ${report.conceptInput.cuisineConcept}`);
    }
    if (report.conceptInput.priceTier) {
      w.body(`Price tier: ${report.conceptInput.priceTier}`);
    }
  } else {
    w.body("Service model: Open concept exploration");
  }

  if (report.conceptFit) {
    w.sectionGap();
    w.body(`Concept fit score: ${report.conceptFit.fitScore}/10`);
    w.body(`Recommendation: ${report.conceptFit.recommendation}`);
    w.sectionGap();
    w.body(report.conceptFit.summary);
    w.y += 3;
    w.body(report.conceptFit.whyItWorksOrFails);
  } else if (report.concepts[0]) {
    const c = report.concepts[0];
    w.sectionGap();
    w.body(`Suggested concept: ${c.name} (${c.cuisineType})`);
    w.body(`Risk score: ${c.riskScore}/10`);
    w.sectionGap();
    w.body(c.reasoning);
  }
}

function pageRentStress(w: PdfWriter, rent: RentStressData) {
  w.newPage();
  w.heading("Financial Viability Check");
  w.subheading("Rent Stress Test");

  w.body(`Monthly rent entered: ${formatCurrency(rent.monthlyRent)}`);
  w.body(`Revenue required (at 8%): ${formatCurrency(rent.monthlyRevenueNeeded)}/month`);
  w.body(`Covers required per day: ${Math.ceil(rent.dailyCovers)}`);
  w.body(`Table turns needed: ${rent.seatTurnover.toFixed(1)}/day`);
  w.body(`Risk rating: ${riskLabel(rent.risk)}`);
  w.sectionGap();
  w.body(riskVerdict(rent.risk));
  w.sectionGap();
  w.muted("Benchmark: rent should be 5–8% of revenue. National Restaurant Association / Paytronix");
}

function pageEquipment(w: PdfWriter, report: FullReport) {
  w.newPage();
  w.heading("Recommended Equipment for Your Concept");

  const items = collectEquipmentItems(report);
  if (items.length) {
    w.drawTable(
      ["Equipment Item", "Priority"],
      items.map(i => [i.name.slice(0, 60), i.priority]),
      [CONTENT_W - 40, 40]
    );
  } else {
    w.body("Equipment checklist will populate once concept analysis completes.");
  }

  w.sectionGap();
  w.body(
    "This checklist is based on your concept type and service model. Equipment requirements vary by local health code and kitchen layout. Consult with a kitchen equipment specialist before finalizing your purchase list."
  );
}

function pageNextSteps(w: PdfWriter) {
  w.newPage();
  w.heading("Recommended Next Steps");

  const steps = [
    {
      title: "Verify foot traffic in person",
      detail:
        "Visit the location on your busiest projected daypart (lunch, dinner, or weekend) and count actual pedestrian and vehicle traffic for one hour.",
    },
    {
      title: "Get a lease review",
      detail:
        "Before signing, have a restaurant-experienced commercial leasing attorney review the lease. Pay specific attention to: lock-in period, demolition clause, CAM charges cap, and personal guarantee terms.",
    },
    {
      title: "Run your unit economics",
      detail:
        "Model your P&L before signing. Your rent should be 5–8% of projected revenue. If you cannot reach break-even at 70% capacity, the location is too expensive for your concept.",
    },
    {
      title: "Talk to neighbors",
      detail:
        "Speak with adjacent business owners about foot traffic patterns, landlord responsiveness, and any planned development in the area.",
    },
    {
      title: "Check permits and zoning",
      detail:
        "Confirm the space is zoned for food service, has an existing grease trap, and that a Certificate of Occupancy can be obtained for your concept type.",
    },
  ];

  steps.forEach((step, i) => {
    w.subheading(`${i + 1}. ${step.title}`, 10);
    w.body(step.detail);
    w.y += 2;
  });
}

function pageBackCover(w: PdfWriter) {
  w.newPage();
  const centerY = PAGE_H / 2 - 20;

  w.doc.setFont("helvetica", "bold");
  w.doc.setFontSize(14);
  w.doc.setTextColor(...C.heading);
  w.doc.text("RestaurantSiteFinder.com", PAGE_W / 2, centerY, { align: "center" });

  w.doc.setFont("helvetica", "normal");
  w.doc.setFontSize(10);
  w.doc.setTextColor(...C.body);
  w.doc.text("Free location analysis for every restaurant owner", PAGE_W / 2, centerY + 8, {
    align: "center",
  });

  w.y = centerY + 20;
  w.drawRule();

  w.y = centerY + 28;
  const disclaimer =
    "This report was generated using publicly available market data and AI analysis. It is intended as a research aid and does not constitute professional real estate, legal, or financial advice. Always consult licensed professionals before signing a commercial lease.";
  w.doc.setFontSize(8);
  w.doc.setTextColor(...C.body);
  const lines = w.doc.splitTextToSize(disclaimer, CONTENT_W - 10);
  lines.forEach((line: string) => {
    w.doc.text(line, PAGE_W / 2, w.y, { align: "center" });
    w.y += lineStep(8);
  });

  w.doc.setFontSize(7);
  w.doc.setTextColor(...C.muted);
  w.doc.text(
    "A Horeca Store company · thehorecastore.com · © 2026 All rights reserved",
    PAGE_W / 2,
    PAGE_H - 15,
    { align: "center" }
  );
}

export async function generatePdfReport(report: FullReport): Promise<jsPDF> {
  const w = new PdfWriter();
  pageCover(w, report);
  await pageExecutiveSummary(w, report);
  pageLocationDetails(w, report);
  pageMarketAnalysis(w, report);
  pageCompetition(w, report);
  pageConceptFit(w, report);

  const rentData = loadRentStressData();
  if (rentData?.monthlyRent) {
    pageRentStress(w, rentData);
  }

  pageEquipment(w, report);
  pageNextSteps(w);
  pageBackCover(w);

  return w.doc;
}

interface PremiumPdfDownloadButtonProps {
  report: FullReport;
}

export function PremiumPdfDownloadButton({ report }: PremiumPdfDownloadButtonProps) {
  const { isPremium, isLoading, plan } = usePremium();
  const [generating, setGenerating] = useState(false);

  if (isLoading || !isPremium) return null;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const pdf = await generatePdfReport(report);
      const filename = `RSF-Report-${addressSlug(report.address)}-${formatFileDate()}.pdf`;
      pdf.save(filename);
      captureEvent("pdf_report_downloaded", {
        address: report.address,
        score: report.opportunityScore,
        plan: plan ?? "premium",
      });
    } catch (err) {
      console.error("[PDF] Generation failed:", err);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-lg"
      disabled={generating}
      onClick={handleDownload}
    >
      {generating ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Generating your report...
        </>
      ) : (
        <>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download PDF Report
        </>
      )}
    </Button>
  );
}
