import { jsPDF } from "jspdf";
import { loadRentStressData, type RentStressData } from "./rent-stress-storage";
import { serviceModelLabel } from "../../../shared/concept-options";
import { formatCompetitorAreaSubtitle } from "../../../shared/search-config";
import type { FullReport, Competitor, EquipmentItem } from "../../../shared/analysis-types";

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_H = 12;
const FOOTER_H = 10;
const CONTENT_TOP = MARGIN + HEADER_H + 6;
const CONTENT_BOTTOM = PAGE_H - MARGIN - FOOTER_H - 2;
const SECTION_GAP = 8;
const LINE_H = 1.55;

/* ─── Brand palette (consulting-grade) ───────────────────────────────────── */
const C = {
  navy: [15, 23, 42] as [number, number, number],
  navyMid: [30, 41, 59] as [number, number, number],
  heading: [15, 23, 42] as [number, number, number],
  body: [51, 65, 85] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  rule: [226, 232, 240] as [number, number, number],
  tableHead: [30, 41, 59] as [number, number, number],
  tableStripe: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [5, 150, 105] as [number, number, number],
  greenBg: [236, 253, 245] as [number, number, number],
  yellow: [180, 83, 9] as [number, number, number],
  yellowBg: [255, 251, 235] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  redBg: [254, 242, 242] as [number, number, number],
  accent: [5, 150, 105] as [number, number, number],
};

function lineStep(fontSize: number): number {
  return fontSize * 0.3528 * LINE_H;
}

function clampScore(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}

function formatReportDate(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatFileDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function copyrightYear(): string {
  return String(new Date().getFullYear());
}

export function addressSlug(address: string): string {
  return address
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function reportRef(address: string): string {
  const parts = parseAddressParts(address);
  const city = parts.city.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "SITE";
  const state = parts.state.replace(/[^A-Z]/g, "").toUpperCase() || "US";
  const zip = parts.zip.replace(/\D/g, "").slice(0, 5);
  return zip
    ? `RSF-${formatFileDate()}-${city}-${state}-${zip}`
    : `RSF-${formatFileDate()}-${city}-${state}`;
}

function parseAddressParts(address: string): { city: string; state: string; zip: string; street: string } {
  const match = address.match(/^(.+?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/i);
  if (match) {
    return {
      street: match[1].trim(),
      city: match[2].trim(),
      state: match[3].toUpperCase(),
      zip: match[4] ?? "",
    };
  }
  const parts = address.split(",").map((p) => p.trim());
  return {
    street: parts[0] ?? address,
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

function displayRec(rec: string): string {
  if (rec === "NO-GO") return "NO-GO";
  if (rec === "CAUTION") return "CAUTION";
  return "GO";
}

function recColor(rec: string): [number, number, number] {
  if (rec === "NO-GO") return C.red;
  if (rec === "CAUTION") return C.yellow;
  return C.green;
}

function recBg(rec: string): [number, number, number] {
  if (rec === "NO-GO") return C.redBg;
  if (rec === "CAUTION") return C.yellowBg;
  return C.greenBg;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function pdfText(s: string): string {
  return s.replace(/★/g, "/5").replace(/[–—]/g, "-");
}

function avgRating(competitors: Competitor[]): string {
  if (!competitors.length) return "N/A";
  return (competitors.reduce((s, c) => s + c.rating, 0) / competitors.length).toFixed(1);
}

function deriveFactorScores(report: FullReport) {
  const count = report.competitors.length;
  const competitionScore = clampScore(10 - count / 8);
  const demandScore = clampScore(
    report.concepts[0]?.menuMarketFit?.demandScore ??
      (report.marketAnalysis.underservedCuisines.length > 2 ? 8 : report.marketAnalysis.underservedCuisines.length > 0 ? 6 : 5)
  );
  const conceptFitScore = clampScore(report.conceptFit?.fitScore ?? report.opportunityScore);
  const underserved = report.marketAnalysis.underservedCuisines.slice(0, 2).join(", ");

  return {
    marketDemand: { score: demandScore, note: underserved ? `Gap in ${underserved}` : "Balanced category mix" },
    competition: { score: competitionScore, note: `${count} restaurants mapped` },
    conceptFit: { score: conceptFitScore, note: displayRec(report.conceptFit?.recommendation ?? report.recommendation) },
    overall: { score: clampScore(report.opportunityScore), note: displayRec(report.recommendation) },
  };
}

function executiveNarrative(report: FullReport): string {
  const score = clampScore(report.opportunityScore);
  const rec = displayRec(report.recommendation);
  const count = report.competitors.length;
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;
  const cuisine = report.conceptInput?.cuisineConcept ?? "restaurant";

  if (rec === "NO-GO") {
    return `This site scores ${score}/10 with a NO-GO recommendation. ${count} restaurants were mapped in the trade area, including ${direct} direct rivals for a ${cuisine} concept. Cuisine saturation and review patterns indicate significant headwinds. Any proceed decision requires a differentiated concept, favorable lease economics, and on-site validation before capital commitment.`;
  }
  if (rec === "CAUTION") {
    return `This site scores ${score}/10 with a CAUTION recommendation. Mixed market signals: some demand exists, but ${direct} direct competitors and category saturation require careful lease negotiation and concept differentiation before signing. Document risk mitigations before committing capital.`;
  }
  return `This site scores ${score}/10 with a GO recommendation. Market gaps, demand signals, and competitive positioning support a ${cuisine} concept at this address. Confirm foot traffic, rent-to-revenue ratio, and permit feasibility before lease execution.`;
}

function marketGapParagraph(report: FullReport): string {
  const count = report.competitors.length;
  const underserved = report.marketAnalysis.underservedCuisines;
  const saturated = report.marketAnalysis.saturatedCuisines;
  let text = `${count} restaurants were identified within the analysis radius. `;
  if (underserved.length) {
    text += `Underserved categories include ${underserved.join(", ")} — potential white-space for differentiated entrants. `;
  } else {
    text += `No clear cuisine gaps were detected; success depends on execution, pricing, and experience differentiation. `;
  }
  if (saturated.length) {
    text += `Avoid head-to-head entry in saturated segments: ${saturated.join(", ")}. `;
  }
  if (report.conceptInput?.cuisineConcept) {
    text += report.conceptFit?.competitiveVerdict ?? "Validate direct competitor overlap before lease signing.";
  }
  return text.trim();
}

function buildMarketSections(report: FullReport): { title: string; body: string }[] {
  const m = report.marketAnalysis;
  const sections: { title: string; body: string }[] = [
    { title: "Demographics & Trade Area Profile", body: m.demographics },
    { title: "Foot Traffic & Daypart Signals", body: m.footTraffic },
  ];
  if (m.underservedCuisines.length) {
    sections.push({
      title: "Underserved Cuisine Opportunities",
      body: `${m.underservedCuisines.join(", ")} show lower representation relative to demand signals. These categories represent potential positioning opportunities for a new entrant.`,
    });
  }
  if (m.saturatedCuisines.length) {
    sections.push({
      title: "Saturated Categories — Avoid or Differentiate",
      body: `${m.saturatedCuisines.join(", ")} are over-represented in this trade area. Direct entry requires clear differentiation on menu, price, or service model.`,
    });
  }
  return sections.filter((s) => s.body?.trim());
}

function equipmentPriority(item: EquipmentItem): "Essential" | "Recommended" {
  const essential = ["cooking", "refrigeration", "ventilation", "hood", "safety", "prep"];
  const haystack = `${item.category} ${item.name}`.toLowerCase();
  return essential.some((k) => haystack.includes(k)) ? "Essential" : "Recommended";
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

function riskLabel(risk: RentStressData["risk"]): string {
  if (risk === "safe") return "Low Risk";
  if (risk === "tight") return "Moderate Risk";
  return "High Risk";
}

function riskVerdict(risk: RentStressData["risk"]): string {
  if (risk === "safe") {
    return "At the stated rent, projected revenue requirements appear achievable for this concept's average check. Confirm foot traffic and competition on-site before committing.";
  }
  if (risk === "tight") {
    return "Rent is workable but leaves limited margin for slow periods. Consistent covers from opening week and tenant improvement concessions are recommended.";
  }
  return "Required daily covers likely exceed realistic turnover at this rent level. Negotiate rent downward or reconsider the site before capital deployment.";
}

interface TocEntry {
  title: string;
  page: number;
}

class PdfWriter {
  doc: jsPDF;
  y = CONTENT_TOP;
  contentPage = 0;
  currentSection = "";
  toc: TocEntry[] = [];
  tocPageIndex = 0;
  tocFillMode = false;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
  }

  beginSection(title: string) {
    if (this.contentPage > 0) {
      this.doc.addPage();
    } else if (this.tocPageIndex > 0) {
      this.doc.addPage();
    }
    this.contentPage++;
    this.currentSection = title;
    this.toc.push({ title, page: this.doc.getCurrentPageInfo().pageNumber });
    this.y = CONTENT_TOP;
    this.drawPageChrome();
  }

  continueSection() {
    this.doc.addPage();
    this.y = CONTENT_TOP;
    this.drawPageChrome();
  }

  ensureSpace(needed: number) {
    if (this.y + needed > CONTENT_BOTTOM) {
      if (this.tocFillMode) return;
      this.continueSection();
    }
  }

  drawPageChrome() {
    const { doc } = this;
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, PAGE_W, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.navy);
    doc.text("RESTAURANT SITE FINDER", MARGIN, MARGIN + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(this.currentSection.toUpperCase(), PAGE_W / 2, MARGIN + 4, { align: "center" });

    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, MARGIN + HEADER_H, PAGE_W - MARGIN, MARGIN + HEADER_H);

    doc.setFontSize(7);
    doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - MARGIN, { align: "right" });
    doc.text("Confidential — Due diligence document", MARGIN, PAGE_H - MARGIN);
  }

  sectionHeading(text: string) {
    this.ensureSpace(16);
    this.doc.setFillColor(...C.accent);
    this.doc.rect(MARGIN, this.y - 4, 3, 10, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...C.heading);
    this.doc.text(text, MARGIN + 6, this.y + 2);
    this.y += 14;
  }

  subsectionHeading(text: string) {
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...C.navyMid);
    this.doc.text(text.toUpperCase(), MARGIN, this.y);
    this.y += lineStep(10) + 2;
    this.doc.setDrawColor(...C.rule);
    this.doc.setLineWidth(0.15);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 4;
  }

  body(text: string, size = 9.5) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...C.body);
    const lines = this.doc.splitTextToSize(pdfText(text), CONTENT_W);
    for (const line of lines) {
      this.ensureSpace(lineStep(size));
      this.doc.text(line, MARGIN, this.y);
      this.y += lineStep(size);
    }
  }

  muted(text: string, size = 7.5) {
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

  gap(n = SECTION_GAP) {
    this.y += n;
  }

  drawRule() {
    this.doc.setDrawColor(...C.rule);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 4;
  }

  drawMetaGrid(items: { label: string; value: string }[]) {
    const colW = CONTENT_W / 2;
    const rowH = 14;
    this.ensureSpace(rowH * Math.ceil(items.length / 2) + 4);
    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * colW;
      const y = this.y + row * rowH;
      this.doc.setFillColor(...C.tableStripe);
      this.doc.rect(x, y - 5, colW - 3, rowH - 2, "F");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(6.5);
      this.doc.setTextColor(...C.muted);
      this.doc.text(item.label.toUpperCase(), x + 3, y);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...C.heading);
      this.doc.text(item.value, x + 3, y + 5);
    });
    this.y += rowH * Math.ceil(items.length / 2) + 4;
  }

  drawKpiRow(metrics: { label: string; value: string; sub?: string }[]) {
    const n = metrics.length;
    const boxW = (CONTENT_W - (n - 1) * 3) / n;
    const boxH = 22;
    this.ensureSpace(boxH + 4);
    metrics.forEach((m, i) => {
      const x = MARGIN + i * (boxW + 3);
      this.doc.setFillColor(...C.tableStripe);
      this.doc.setDrawColor(...C.rule);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(x, this.y, boxW, boxH, 1.5, 1.5, "FD");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(6.5);
      this.doc.setTextColor(...C.muted);
      this.doc.text(m.label.toUpperCase(), x + 3, this.y + 6);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(14);
      this.doc.setTextColor(...C.navy);
      this.doc.text(m.value, x + 3, this.y + 14);
      if (m.sub) {
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(6.5);
        this.doc.setTextColor(...C.muted);
        this.doc.text(m.sub, x + 3, this.y + 19);
      }
    });
    this.y += boxH + 6;
  }

  drawScorePanel(score: number, rec: string) {
    const w = CONTENT_W;
    const h = 32;
    this.ensureSpace(h + 6);
    const rgb = recColor(rec);
    const bg = recBg(rec);
    this.doc.setFillColor(...bg);
    this.doc.setDrawColor(...rgb);
    this.doc.setLineWidth(0.4);
    this.doc.roundedRect(MARGIN, this.y, w, h, 2, 2, "FD");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(28);
    this.doc.setTextColor(...rgb);
    this.doc.text(`${score}`, MARGIN + 8, this.y + 18);
    this.doc.setFontSize(12);
    this.doc.text("/10", MARGIN + 22, this.y + 18);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.text("SITE OPPORTUNITY SCORE", MARGIN + 38, this.y + 12);
    this.doc.setFontSize(14);
    this.doc.text(rec, MARGIN + 38, this.y + 22);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...C.muted);
    this.doc.text("Composite score from market demand, competition density, and concept fit", MARGIN + 38, this.y + 28);

    this.y += h + 8;
  }

  drawCallout(title: string, body: string, rec?: string) {
    const rgb = rec ? recColor(rec) : C.navyMid;
    const bg = rec ? recBg(rec) : C.tableStripe;
    const lines = this.doc.splitTextToSize(pdfText(body), CONTENT_W - 16);
    const h = 12 + lines.length * lineStep(9);
    this.ensureSpace(h);

    this.doc.setFillColor(...bg);
    this.doc.setDrawColor(...rgb);
    this.doc.setLineWidth(0.3);
    this.doc.rect(MARGIN, this.y, 2.5, h, "F");
    this.doc.setDrawColor(...C.rule);
    this.doc.rect(MARGIN + 2.5, this.y, CONTENT_W - 2.5, h, "S");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...rgb);
    this.doc.text(title, MARGIN + 8, this.y + 7);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...C.body);
    let ly = this.y + 13;
    for (const line of lines) {
      this.doc.text(line, MARGIN + 8, ly);
      ly += lineStep(9);
    }
    this.y += h + 5;
  }

  drawBullets(items: string[]) {
    for (const item of items) {
      const lines = this.doc.splitTextToSize(pdfText(item), CONTENT_W - 8);
      this.ensureSpace(lines.length * lineStep(9) + 2);
      this.doc.setFillColor(...C.accent);
      this.doc.circle(MARGIN + 2, this.y - 1, 0.8, "F");
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...C.body);
      for (let i = 0; i < lines.length; i++) {
        this.doc.text(lines[i], MARGIN + 6, this.y + i * lineStep(9));
      }
      this.y += lines.length * lineStep(9) + 3;
    }
  }

  drawProTable(headers: string[], rows: string[][], colWidths: number[]) {
    const baseRowH = 7;
    const headerH = 8;
    this.ensureSpace(headerH + baseRowH);

    const startX = MARGIN;
    let x = startX;

    this.doc.setFillColor(...C.tableHead);
    this.doc.rect(startX, this.y - 5, CONTENT_W, headerH, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...C.white);
    headers.forEach((h, i) => {
      this.doc.text(h.toUpperCase(), x + 2, this.y);
      x += colWidths[i];
    });
    this.y += headerH - 2;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    for (let r = 0; r < rows.length; r++) {
      const cellLines = rows[r].map((cell, i) =>
        this.doc.splitTextToSize(pdfText(cell), colWidths[i] - 3)
      );
      const maxLines = Math.max(1, ...cellLines.map((lines) => lines.length));
      const rowH = baseRowH + (maxLines - 1) * lineStep(8);
      this.ensureSpace(rowH + 2);
      if (r % 2 === 0) {
        this.doc.setFillColor(...C.tableStripe);
        this.doc.rect(startX, this.y - 4.5, CONTENT_W, rowH, "F");
      }
      x = startX;
      this.doc.setTextColor(...C.body);
      rows[r].forEach((_cell, i) => {
        const lines = cellLines[i];
        lines.forEach((line, li) => {
          this.doc.text(line || "—", x + 2, this.y + li * lineStep(8));
        });
        x += colWidths[i];
      });
      this.y += rowH;
    }
    this.y += 4;
  }

  drawScoreBar(label: string, score: number, max = 10) {
    const barW = CONTENT_W - 50;
    const pct = Math.min(1, score / max);
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.body);
    this.doc.text(label, MARGIN, this.y);
    const barX = MARGIN + 48;
    this.doc.setFillColor(...C.rule);
    this.doc.roundedRect(barX, this.y - 3.5, barW, 4, 1, 1, "F");
    const rgb = score >= 7 ? C.green : score >= 4 ? C.yellow : C.red;
    this.doc.setFillColor(...rgb);
    if (pct > 0) this.doc.roundedRect(barX, this.y - 3.5, barW * pct, 4, 1, 1, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${score}/${max}`, barX + barW + 3, this.y);
    this.y += 8;
  }

  drawNumberedStep(num: number, title: string, detail: string) {
    this.ensureSpace(20);
    this.doc.setFillColor(...C.navy);
    this.doc.circle(MARGIN + 4, this.y, 4, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...C.white);
    this.doc.text(String(num), MARGIN + 4, this.y + 1, { align: "center" });

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...C.heading);
    this.doc.text(title, MARGIN + 12, this.y + 1);

    this.y += 6;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...C.body);
    const lines = this.doc.splitTextToSize(detail, CONTENT_W - 12);
    for (const line of lines) {
      this.ensureSpace(lineStep(9));
      this.doc.text(line, MARGIN + 12, this.y);
      this.y += lineStep(9);
    }
    this.y += 4;
  }
}

/* ─── Cover ──────────────────────────────────────────────────────────────── */
function pageCover(w: PdfWriter, report: FullReport) {
  const { doc } = w;
  const parts = parseAddressParts(report.address);
  const radius = report.searchRadiusMiles ?? 5;
  const rec = displayRec(report.conceptFit?.recommendation ?? report.recommendation);
  const score = clampScore(report.conceptFit?.fitScore ?? report.opportunityScore);

  doc.setFillColor(...C.navy);
  doc.rect(0, 0, PAGE_W, 130, "F");

  doc.setFillColor(...C.accent);
  doc.rect(0, 130, PAGE_W, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text("RESTAURANT SITE FINDER  ·  A HORECA STORE COMPANY", MARGIN, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...C.white);
  doc.text("Site Selection", MARGIN, 48);
  doc.text("Due Diligence Report", MARGIN, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 200, 220);
  doc.text("Site selection due diligence  ·  Restaurant Site Finder by Horeca Store", MARGIN, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  const streetLines = doc.splitTextToSize(parts.street, CONTENT_W);
  doc.text(streetLines, MARGIN, 88);
  doc.setFontSize(10);
  doc.text(`${parts.city}, ${parts.state} ${parts.zip}`, MARGIN, 88 + streetLines.length * 5 + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 160, 180);
  doc.text(formatReportDate(), PAGE_W - MARGIN, 22, { align: "right" });
  doc.text(reportRef(report.address), PAGE_W - MARGIN, 28, { align: "right" });

  const panelY = 145;
  doc.setFillColor(...C.tableStripe);
  doc.roundedRect(MARGIN, panelY, CONTENT_W, 52, 2, 2, "F");

  const kpis = [
    { label: "Recommendation", value: rec },
    { label: "Opportunity Score", value: `${score}/10` },
    { label: "Competitors Mapped", value: String(report.competitors.length) },
    { label: "Analysis Radius", value: `${radius} mi` },
  ];
  const kpiW = CONTENT_W / 4;
  kpis.forEach((k, i) => {
    const x = MARGIN + i * kpiW + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(k.label.toUpperCase(), x, panelY + 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.navy);
    doc.text(k.value, x, panelY + 22);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.body);
  const preview = executiveNarrative(report);
  const previewLines = doc.splitTextToSize(preview, CONTENT_W);
  doc.text(previewLines.slice(0, 4), MARGIN, panelY + 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(
    "Confidential analysis generated from public data and AI-assisted modeling. Not professional advice. See disclaimer.",
    MARGIN,
    PAGE_H - 28,
    { maxWidth: CONTENT_W }
  );
  doc.text("Confidential — not for redistribution without authorization", MARGIN, PAGE_H - 20);
}

function fillTableOfContents(w: PdfWriter) {
  w.tocFillMode = true;
  w.doc.setPage(w.tocPageIndex);
  w.y = CONTENT_TOP;
  w.currentSection = "Contents";
  w.drawPageChrome();

  w.doc.setFillColor(...C.accent);
  w.doc.rect(MARGIN, w.y - 4, 3, 10, "F");
  w.doc.setFont("helvetica", "bold");
  w.doc.setFontSize(16);
  w.doc.setTextColor(...C.heading);
  w.doc.text("Table of Contents", MARGIN + 6, w.y + 2);
  w.y += 14;
  w.gap(2);

  w.toc.forEach((entry, i) => {
    w.doc.setFont("helvetica", "normal");
    w.doc.setFontSize(10);
    w.doc.setTextColor(...C.body);
    w.doc.text(`${i + 1}.`, MARGIN, w.y);
    w.doc.setFont("helvetica", "bold");
    const titleLines = w.doc.splitTextToSize(entry.title, CONTENT_W - 50);
    w.doc.text(titleLines[0], MARGIN + 8, w.y);
    w.doc.setFont("helvetica", "normal");
    w.doc.setTextColor(...C.muted);
    w.doc.text(" . . . . . . . . . . . . . . . . . . . . ", MARGIN + 72, w.y);
    w.doc.setFont("helvetica", "bold");
    w.doc.setTextColor(...C.navy);
    w.doc.text(String(entry.page), PAGE_W - MARGIN, w.y, { align: "right" });
    w.y += titleLines.length > 1 ? 12 : 8;
  });

  w.gap(6);
  w.muted(
    "Site selection due diligence memorandum. Data sources: Google Places, public demographics, AI-assisted review sentiment. See disclaimer for limitations."
  );
  w.tocFillMode = false;
}

function pageExecutiveSummary(w: PdfWriter, report: FullReport) {
  w.beginSection("Executive Summary");
  const rec = displayRec(report.conceptFit?.recommendation ?? report.recommendation);
  const score = clampScore(report.conceptFit?.fitScore ?? report.opportunityScore);
  const direct = report.directCompetitors?.length ?? report.conceptFit?.directCompetitorCount ?? 0;
  const radius = report.searchRadiusMiles ?? 5;

  w.drawScorePanel(score, rec);
  w.body(executiveNarrative(report));
  w.gap(6);

  w.drawKpiRow([
    { label: "Restaurants Mapped", value: String(report.competitors.length), sub: `${radius}-mile radius` },
    { label: "Direct Rivals", value: String(direct), sub: "Same concept type" },
    { label: "Avg. Rating", value: avgRating(report.competitors), sub: "Market benchmark" },
    { label: "Top Gap", value: report.marketAnalysis.underservedCuisines[0]?.slice(0, 12) ?? "—", sub: "Underserved" },
  ]);

  w.subsectionHeading("Key Findings");
  const m = report.marketAnalysis;
  w.drawCallout(
    "Market Opportunity",
    m.underservedCuisines.length
      ? `Underserved categories: ${m.underservedCuisines.slice(0, 4).join(", ")}. ${m.demographics.slice(0, 180)}`
      : m.demographics.slice(0, 220),
    rec
  );
  w.drawCallout(
    "Competitive Landscape",
    `${report.competitors.length} restaurants mapped. ${direct} direct competitor(s). Average market rating ${avgRating(report.competitors)}/5. ${
      m.reviewSentiment.topComplaints[0] ? `Top complaint in market: ${m.reviewSentiment.topComplaints[0]}.` : ""
    }`
  );
  if (report.conceptFit) {
    w.drawCallout(
      "Concept Fit Assessment",
      `${report.conceptFit.summary} ${report.conceptFit.whyItWorksOrFails}`.slice(0, 320),
      displayRec(report.conceptFit.recommendation)
    );
  }
}

function pageSiteOverview(w: PdfWriter, report: FullReport) {
  w.beginSection("Site Overview");
  const parts = parseAddressParts(report.address);
  const factors = deriveFactorScores(report);
  const radius = report.searchRadiusMiles ?? 5;

  w.subsectionHeading("Property & Coordinates");
  w.drawMetaGrid([
    { label: "Street Address", value: parts.street },
    { label: "City / State / ZIP", value: `${parts.city}, ${parts.state} ${parts.zip}` },
    { label: "Latitude / Longitude", value: `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}` },
    { label: "Analysis Radius", value: `${radius} miles` },
    { label: "Report Date", value: formatReportDate() },
    { label: "Report ID", value: reportRef(report.address) },
  ]);

  if (report.conceptInput) {
    w.subsectionHeading("Concept Under Review");
    w.drawMetaGrid([
      { label: "Service Model", value: serviceModelLabel(report.conceptInput.serviceModel) },
      { label: "Cuisine", value: report.conceptInput.cuisineConcept ?? "Open exploration" },
      { label: "Price Tier", value: report.conceptInput.priceTier ?? "—" },
    ]);
  }

  w.subsectionHeading("Opportunity Score Breakdown");
  w.drawScoreBar("Market Demand", factors.marketDemand.score);
  w.drawScoreBar("Competition Density", factors.competition.score);
  w.drawScoreBar("Concept Fit", factors.conceptFit.score);
  w.drawScoreBar("Overall Site Score", factors.overall.score);
  w.gap(4);

  w.drawProTable(
    ["Factor", "Score", "Assessment"],
    [
      ["Market Demand", `${factors.marketDemand.score}/10`, factors.marketDemand.note],
      ["Competition Density", `${factors.competition.score}/10`, factors.competition.note],
      ["Concept Fit", `${factors.conceptFit.score}/10`, factors.conceptFit.note],
      ["Overall", `${factors.overall.score}/10`, factors.overall.note],
    ],
    [45, 22, CONTENT_W - 67]
  );
}

function pageMarketAnalysis(w: PdfWriter, report: FullReport) {
  w.beginSection("Market Analysis");
  for (const section of buildMarketSections(report)) {
    w.subsectionHeading(section.title);
    w.body(section.body);
    w.gap(3);
  }

  const rs = report.marketAnalysis.reviewSentiment;
  if (rs.patterns.length) {
    w.subsectionHeading("Review Sentiment — Market Patterns");
    w.drawBullets(rs.patterns.slice(0, 5));
  }
  if (rs.topComplaints.length) {
    w.subsectionHeading("Customer Pain Points — Your Opportunity");
    w.drawBullets(rs.topComplaints.slice(0, 5));
  }
  if (rs.topPraises.length) {
    w.subsectionHeading("What This Market Values");
    w.drawBullets(rs.topPraises.slice(0, 5));
  }
}

function pageCompetition(w: PdfWriter, report: FullReport) {
  w.beginSection("Competitive Landscape");
  w.body(formatCompetitorAreaSubtitle(report.competitors.length, report.conceptInput?.serviceModel));
  w.gap(3);
  w.subsectionHeading("Market Gap Assessment");
  w.body(marketGapParagraph(report));
  w.gap(4);

  w.subsectionHeading(`Competitor Registry — Top ${Math.min(25, report.competitors.length)} by Proximity`);
  const rows = report.competitors.slice(0, 25).map((c) => [
    c.name,
    c.conceptLabel ?? c.cuisine,
    `${distanceMiles(report.lat, report.lng, c.lat, c.lng).toFixed(1)} mi`,
    `${c.rating.toFixed(1)}/5`,
    c.userRatingsTotal > 999 ? `${(c.userRatingsTotal / 1000).toFixed(1)}k` : String(c.userRatingsTotal),
  ]);

  if (rows.length) {
    w.drawProTable(["Restaurant", "Concept", "Distance", "Rating", "Reviews"], rows, [40, 42, 20, 18, 20]);
  }
}

function pageConceptFit(w: PdfWriter, report: FullReport) {
  w.beginSection("Concept Fit Analysis");

  if (report.conceptFit) {
    const cf = report.conceptFit;
    w.drawScorePanel(clampScore(cf.fitScore), displayRec(cf.recommendation));
    w.body(cf.summary);
    w.gap(4);
    w.subsectionHeading("Competitive Verdict");
    w.body(cf.competitiveVerdict);
    w.subsectionHeading("Why This Works or Fails Here");
    w.body(cf.whyItWorksOrFails);

    if (cf.alternativeConcepts.length > 0) {
      w.subsectionHeading("Alternative Concepts Better Suited to This Site");
      w.drawProTable(
        ["Concept", "Cuisine", "Fit", "Rationale"],
        cf.alternativeConcepts.slice(0, 4).map((a) => [
          a.name,
          a.cuisineType,
          `${clampScore(a.fitScore)}/10`,
          a.whyBetter,
        ]),
        [38, 28, 14, CONTENT_W - 80]
      );
    }
    if (cf.alternativeLocationGuidance) {
      w.subsectionHeading("Location Guidance");
      w.body(cf.alternativeLocationGuidance);
    }
  } else if (report.concepts[0]) {
    const c = report.concepts[0];
    w.drawScorePanel(clampScore(10 - c.riskScore), "GO");
    w.body(`Recommended concept: ${c.name} (${c.cuisineType}). ${c.reasoning}`);
  }
}

function pageWinningConcepts(w: PdfWriter, report: FullReport) {
  if (!report.concepts.length) return;
  w.beginSection("Winning Concept Recommendations");

  report.concepts.slice(0, 3).forEach((concept, idx) => {
    if (idx > 0) w.gap(6);
    w.subsectionHeading(`Concept ${idx + 1}: ${concept.name}`);
    w.drawMetaGrid([
      { label: "Cuisine Type", value: concept.cuisineType },
      { label: "Risk Score", value: `${concept.riskScore}/10` },
      { label: "Target Audience", value: concept.targetAudience.slice(0, 40) },
      { label: "Est. Investment", value: concept.estimatedInvestment },
    ]);
    w.body(concept.description);
    w.gap(2);
    w.drawScoreBar("Menu-Market Fit", clampScore(concept.menuMarketFit.demandScore));
    w.body(concept.menuMarketFit.demandExplanation);
    if (concept.menuIdeas.length) {
      w.subsectionHeading("Sample Menu Direction");
      w.drawBullets(concept.menuIdeas.slice(0, 5));
    }
  });
}

function pageRentStress(w: PdfWriter, rent: RentStressData) {
  w.beginSection("Financial Viability — Rent Stress Test");
  w.body(
    "This analysis models whether the stated rent is sustainable at industry-standard rent-to-revenue ratios (5-8%). Use alongside your own financial projections and professional advice."
  );
  w.gap(4);

  w.drawKpiRow([
    { label: "Monthly Rent", value: formatCurrency(rent.monthlyRent) },
    { label: "Revenue Required", value: formatCurrency(rent.monthlyRevenueNeeded), sub: "At 8% rent ratio" },
    { label: "Daily Covers", value: String(Math.ceil(rent.dailyCovers)) },
    { label: "Risk Rating", value: riskLabel(rent.risk) },
  ]);

  w.drawCallout("Financial Assessment", riskVerdict(rent.risk), rent.risk === "safe" ? "GO" : rent.risk === "tight" ? "CAUTION" : "NO-GO");
  w.muted("Benchmark: rent should represent 5–8% of gross revenue. Source: National Restaurant Association industry standards.");
}

function pageEquipmentAndRoadmap(w: PdfWriter, report: FullReport) {
  w.beginSection("Equipment & Implementation");
  const items = collectEquipmentItems(report);

  w.body(
    "Equipment checklist based on concept type and service model. Consult a commercial kitchen designer before finalizing purchases."
  );
  w.gap(3);

  if (items.length) {
    w.drawProTable(
      ["Equipment Item", "Priority", "Notes"],
      items.map((i) => [i.name, i.priority, i.priority === "Essential" ? "Required for opening" : "Phase 2"]),
      [CONTENT_W - 52, 26, 26]
    );
  }

  for (const bundle of report.equipmentBundles.slice(0, 1)) {
    w.subsectionHeading(`${bundle.conceptName} — Estimated Investment`);
    w.body(`Total equipment estimate: ${bundle.totalEstimate}`);
  }

  w.subsectionHeading("Implementation Roadmap");
  w.body("Recommended actions before lease execution, in priority order:");
  w.gap(2);

  const steps = [
    {
      title: "Validate foot traffic on-site",
      detail:
        "Visit during your projected peak daypart. Count pedestrian and vehicle traffic for one hour. Compare to your break-even cover count.",
    },
    {
      title: "Engage a commercial leasing attorney",
      detail:
        "Review lock-in period, demolition clause, CAM charge caps, personal guarantee terms, and tenant improvement allowances.",
    },
    {
      title: "Model unit economics",
      detail:
        "Build a 12-month P&L projection. Rent should be 5–8% of projected revenue. If break-even requires above 70% capacity from day one, renegotiate or walk.",
    },
    {
      title: "Conduct neighbor due diligence",
      detail:
        "Speak with adjacent operators about foot traffic patterns, landlord responsiveness, and planned development.",
    },
    {
      title: "Confirm permits and zoning",
      detail:
        "Verify food-service zoning, grease trap availability, hood/ventilation capacity, and Certificate of Occupancy feasibility.",
    },
    {
      title: "Prepare your due diligence package",
      detail:
        "Attach this report to your business plan, lease term sheet, and financial projections. Have qualified professionals review before any lease or investment decision.",
    },
  ];

  steps.forEach((step, i) => w.drawNumberedStep(i + 1, step.title, step.detail));
}

function pageDisclaimer(w: PdfWriter, report: FullReport) {
  w.beginSection("Disclaimer & Methodology");
  w.subsectionHeading("Data Sources & Methodology");
  w.drawBullets([
    "Competitor data sourced from Google Places API within a concept-adjusted trade area radius.",
    "Review sentiment derived from AI analysis of aggregated public competitor reviews.",
    "Demographic and foot traffic signals synthesized from public data and market pattern analysis.",
    "Opportunity scores and recommendations are composite estimates — not guarantees of financial performance or business success.",
  ]);

  w.subsectionHeading("No Professional Advice");
  w.body(
    "This Site Selection Due Diligence Report is provided by Restaurant Site Finder (RestaurantSiteFinder.com), a product of Horeca Store (thehorecastore.com). It is a research and decision-support tool only. It does not constitute legal, tax, accounting, financial, investment, or real estate advice. No attorney-client, fiduciary, or advisory relationship is created."
  );
  w.gap(3);
  w.body(
    "You should consult licensed attorneys, accountants, financial advisors, commercial brokers, and other qualified professionals before signing a lease, making an investment, or opening a restaurant. Do not rely on this report as the sole basis for any decision."
  );

  w.subsectionHeading("AI & Data Limitations");
  w.body(
    "Portions of this report are generated using artificial intelligence and publicly available third-party data that may be incomplete, outdated, or inaccurate. Competitor counts, ratings, demographics, and scores are estimates. Horeca Store and Restaurant Site Finder do not warrant the accuracy, completeness, or timeliness of any information in this document."
  );
  w.gap(3);
  w.body(
    "Market conditions change. Independent verification is required — including on-site visits, permit and zoning confirmation, lease review by qualified counsel, and your own financial modeling."
  );

  w.subsectionHeading("Limitation of Liability");
  w.body(
    "To the fullest extent permitted by law, Horeca Store, Restaurant Site Finder, and their officers, employees, and affiliates disclaim all liability for any loss, damage, or expense arising from use of or reliance on this report, whether direct, indirect, incidental, or consequential. Your use of this report is at your own risk."
  );
  w.gap(3);
  w.body(
    "This report is not endorsed by, affiliated with, or submitted to any government agency, lender, or franchisor. References to due diligence describe the document format only and do not imply approval by any third party."
  );
  w.gap(4);

  w.ensureSpace(32);
  w.doc.setFillColor(...C.navy);
  w.doc.rect(MARGIN, w.y, CONTENT_W, 28, "F");
  w.doc.setFont("helvetica", "bold");
  w.doc.setFontSize(11);
  w.doc.setTextColor(...C.white);
  w.doc.text("RestaurantSiteFinder.com", PAGE_W / 2, w.y + 10, { align: "center" });
  w.doc.setFont("helvetica", "normal");
  w.doc.setFontSize(8);
  w.doc.setTextColor(180, 200, 220);
  w.doc.text(
    `A Horeca Store Company  ·  thehorecastore.com  ·  © ${copyrightYear()} All Rights Reserved`,
    PAGE_W / 2,
    w.y + 18,
    { align: "center" }
  );
  w.doc.text(reportRef(report.address), PAGE_W / 2, w.y + 24, { align: "center" });
}

export function generatePdfReport(report: FullReport): jsPDF {
  const w = new PdfWriter();

  pageCover(w, report);

  w.doc.addPage();
  w.tocPageIndex = w.doc.getNumberOfPages();

  pageExecutiveSummary(w, report);
  pageSiteOverview(w, report);
  pageMarketAnalysis(w, report);
  pageCompetition(w, report);
  pageConceptFit(w, report);
  pageWinningConcepts(w, report);

  const rentData = loadRentStressData();
  if (rentData?.monthlyRent) pageRentStress(w, rentData);

  pageEquipmentAndRoadmap(w, report);
  pageDisclaimer(w, report);

  fillTableOfContents(w);

  return w.doc;
}
