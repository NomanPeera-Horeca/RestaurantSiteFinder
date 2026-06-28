import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { PREVIEW_REPORT } from "./mock-report-data.ts";

// Mock rent stress so the financial section appears in preview
const rentMock = {
  monthlyRent: 8500,
  monthlyRevenueNeeded: 106250,
  dailyCovers: 118,
  seatTurnover: 2.4,
  risk: "tight" as const,
  pricePointLabel: "$$",
};
(globalThis as typeof globalThis & { localStorage: Storage }).localStorage = {
  getItem: (key: string) => (key === "rsf_rent_stress_test" ? JSON.stringify(rentMock) : null),
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

const { generatePdfReport } = await import("../client/src/lib/pdf-report-generator.ts");

const outDir = join(process.cwd(), "preview");
mkdirSync(outDir, { recursive: true });

const pdf = generatePdfReport(PREVIEW_REPORT);
const pdfPath = join(outDir, "RSF-Report-preview.pdf");
writeFileSync(pdfPath, Buffer.from(pdf.output("arraybuffer")));

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RSF PDF Preview — Before Deploy</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    header { padding: 16px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    header h1 { margin: 0; font-size: 18px; }
    header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    a.dl { background: #059669; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    #pages { max-width: 920px; margin: 24px auto; padding: 0 16px 48px; display: flex; flex-direction: column; gap: 20px; }
    .page-wrap { background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,.35); border-radius: 4px; overflow: hidden; }
    .page-label { background: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 8px 12px; }
    canvas { display: block; width: 100%; height: auto; }
    .loading { text-align: center; padding: 48px; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>PDF Report Preview (pre-deploy)</h1>
      <p>8800 Bissonnet St, Houston — sample data · scroll to review all pages</p>
    </div>
    <a class="dl" href="./RSF-Report-preview.pdf" download>Download PDF</a>
  </header>
  <div id="pages"><p class="loading">Rendering pages…</p></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs" type="module"></script>
  <script type="module">
    import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs";
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";
    const container = document.getElementById("pages");
    container.innerHTML = "";
    const pdf = await pdfjsLib.getDocument("./RSF-Report-preview.pdf").promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;
      const wrap = document.createElement("div");
      wrap.className = "page-wrap";
      wrap.innerHTML = '<div class="page-label">Page ' + i + ' of ' + pdf.numPages + '</div>';
      wrap.appendChild(canvas);
      container.appendChild(wrap);
    }
  </script>
</body>
</html>`;

writeFileSync(join(outDir, "index.html"), viewerHtml);

console.log(`\n✓ PDF:  ${pdfPath}`);
console.log(`✓ Viewer: ${join(outDir, "index.html")}`);
console.log(`  Pages: ${pdf.getNumberOfPages()}\n`);
