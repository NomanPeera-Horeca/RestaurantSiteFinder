"""Generate blog markdown files from docx sources."""
import zipfile
import xml.etree.ElementTree as ET
import re
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1] / "content" / "blog"

ARTICLES = [
    {
        "file": r"c:\Users\Shree\Downloads\Choosing the Perfect Spot for Restaurants.docx",
        "slug": "choosing-perfect-spot-restaurants",
        "title": "Mastering Restaurant Location Analysis: Site Selection Insights",
        "metaDescription": "Master the art of restaurant location analysis and market analysis to secure the perfect spot. Learn strategic site selection, geographic analysis, and more.",
        "skip_lines": {"Choosing the Perfect Spot for Restaurants"},
        "date": "2026-06-02",
        "category": "Site Selection",
        "tags": ["restaurant location", "site selection", "location analysis", "foot traffic", "rent ratio"],
        "excerpt": "Learn how to evaluate visibility, traffic quality, demographics, competition, and rent before signing a restaurant lease.",
        "keywords": ["restaurant location analysis", "choosing restaurant location", "site selection insights", "restaurant visibility", "rent to revenue ratio"],
        "relatedSlugs": ["how-to-choose-restaurant-location", "restaurant-site-selection-checklist", "restaurant-market-analysis-guide"],
        "faq": [
            ("Why does corner location matter for restaurants?", "Corner lots offer 360-degree visibility and natural stopping points at intersections, reducing the marketing spend needed to prove you exist compared to mid-block locations hidden by parked cars."),
            ("What rent-to-sales ratio should restaurants target?", "Keep total occupancy cost under 10% of projected gross sales. On $50,000 monthly sales, total rent and NNN fees should not exceed $5,000."),
            ("How do you count foot traffic for a restaurant site?", "Count pedestrians in 15-minute bursts at your peak daypart, note direction of travel, check if walkers match your target demographic, and look for shopping bags indicating active spending."),
            ("What are signs of restaurant market saturation?", "Heavy discounting by neighbors, high turnover of similar concepts, and clumping of identical cuisines within the same trade area."),
            ("What tools help with restaurant location analysis?", "Combine field observation with census data, broker flyers, and free AI scoring from Restaurant Site Finder for competitor mapping and opportunity analysis."),
        ],
        "tldr": [
            "Location is the most expensive irreversible decision—match <a href=\"/glossary/trade-area\">trade-area</a> demand to your concept before signing.",
            "Relevant traffic beats raw volume; 100 qualified walkers beat 1,000 rushing commuters.",
            "Keep occupancy under 10% of sales and run a weighted site scorecard before committing.",
            "Use <a href=\"https://restaurantsitefinder.com/\">Restaurant Site Finder</a> for free location scoring, then validate with lease counsel.",
        ],
    },
    {
        "file": r"c:\Users\Shree\Downloads\Understanding Trade Area Analysis for Restaurants.docx",
        "slug": "trade-area-analysis-restaurants",
        "title": "Trade Area Analysis for Restaurant Success",
        "metaDescription": "Master trade area analysis for restaurants to optimize site selection and attract the right customers. Discover key strategies for successful restaurant location planning and market research.",
        "skip_lines": {"Understanding Trade Area Analysis for Restaurants", "Trade Area Analysis for Restaurants"},
        "date": "2026-06-03",
        "category": "Site Selection",
        "tags": ["trade area", "site selection", "market research", "demographics", "competition"],
        "excerpt": "Map your restaurant trade area with primary, secondary, and tertiary zones—and learn why circles lie but drive-time polygons tell the truth.",
        "keywords": ["trade area analysis restaurant", "restaurant trade area", "drive time analysis", "restaurant site selection", "market footprint"],
        "relatedSlugs": ["restaurant-market-analysis-guide", "choosing-perfect-spot-restaurants", "restaurant-site-selection-checklist"],
        "faq": [
            ("What is a restaurant trade area?", "The geographic zone from which your restaurant draws the majority of customers—defined by drive time, walk time, or delivery radius rather than a simple distance circle."),
            ("What are primary, secondary, and tertiary trade zones?", "Primary delivers 50–70% of daily customers, secondary 15–25%, and tertiary captures rare pass-through visitors. Focus marketing on the primary zone."),
            ("Why use drive-time polygons instead of radius circles?", "Circles ignore rivers, highways, and one-way streets. Isochrone polygons show who can actually reach you in 8–12 minutes by real roads."),
            ("How far will customers drive for different restaurant types?", "Morning coffee: 3–5 minutes. Fast-casual lunch: 8–12 minutes. Fine dining: 20–30 minutes."),
            ("What is market leakage in trade area analysis?", "When residents leave their neighborhood to buy food elsewhere—signaling an underserved gap you can fill with the right concept."),
        ],
        "tldr": [
            "Trade area analysis maps where paying customers live, work, and commute—not where you wish they were.",
            "Use drive-time polygons, not radius circles, to account for rivers, highways, and traffic barriers.",
            "Segment primary (50–70%), secondary (15–25%), and tertiary zones to focus marketing spend.",
            "Run free trade-area scoring with <a href=\"https://restaurantsitefinder.com/\">Restaurant Site Finder</a> before signing a lease.",
        ],
    },
    {
        "file": r"c:\Users\Shree\Downloads\Understanding Restaurant Market Saturation Trends.docx",
        "slug": "restaurant-market-saturation-trends",
        "title": "Master Restaurant Market Saturation: Key Analysis Tips",
        "metaDescription": "Master restaurant market saturation and competitor analysis to thrive in the food industry. Learn essential strategies for standing out, even in saturated markets.",
        "skip_lines": {"Understanding Restaurant Market Saturation Trends"},
        "date": "2026-06-04",
        "category": "Site Selection",
        "tags": ["market saturation", "competitor analysis", "trade area density", "SWOT", "market share"],
        "excerpt": "Evaluate supply versus demand in your trade area, benchmark competitors, and find gaps that let you thrive even in crowded dining corridors.",
        "keywords": ["restaurant market saturation", "competitor analysis restaurant", "trade area density", "restaurant market share", "saturated market"],
        "relatedSlugs": ["restaurant-market-analysis-guide", "trade-area-analysis-restaurants", "go-no-go-restaurant-location-decision"],
        "faq": [
            ("What is restaurant market saturation?", "When the supply of dining options in an area exceeds consumer demand—restaurants fight over the same limited dining dollars instead of sharing a growing market."),
            ("How do you measure trade area density?", "Compare residential and daytime population to competitor seat counts. High seats-per-capita signals severe saturation."),
            ("What is the difference between direct and indirect competitors?", "Direct competitors offer similar cuisine and price point. Indirect competitors satisfy the same meal occasion differently—grocery hot bars, sandwich shops, or meal kits."),
            ("How do you calculate restaurant market share?", "Estimate total market revenue from competitor seats, turnover, and average check, then divide your projected sales by that total."),
            ("Can you succeed in a saturated market?", "Yes, with a clear unique selling proposition, niche specialization, daypart optimization, or a documented gap in local food supply."),
        ],
        "tldr": [
            "Saturation means supply exceeds demand—high foot traffic alone does not guarantee sales.",
            "Map direct and indirect competitors and calculate seats per capita in your <a href=\"/glossary/trade-area\">trade area</a>.",
            "Find gaps: unmet cuisines, dietary needs, or dayparts where competitors are closed.",
            "Validate demand with <a href=\"https://restaurantsitefinder.com/\">Restaurant Site Finder</a> before committing capital.",
        ],
    },
    {
        "file": r"c:\Users\Shree\Downloads\Restaurant Location Strategies for Maximum Profit.docx",
        "slug": "restaurant-location-strategies-maximum-profit",
        "title": "Should I Open a Restaurant Here? Location Strategy Guide",
        "metaDescription": 'Discover if "Should I open a restaurant here?" is the right question with expert location strategy and site selection analysis for maximum profit.',
        "skip_lines": {"Restaurant Location Strategies for Maximum Profit"},
        "date": "2026-06-05",
        "category": "Site Selection",
        "tags": ["location strategy", "feasibility study", "demographics", "foot traffic", "lease negotiation"],
        "excerpt": "Balance urban versus suburban trade-offs, anchor tenants, rent versus visibility, and feasibility math to position your restaurant for maximum profit.",
        "keywords": ["restaurant location strategy", "should I open a restaurant here", "restaurant feasibility study", "site selection checklist", "maximum profit location"],
        "relatedSlugs": ["how-to-choose-restaurant-location", "restaurant-site-selection-checklist", "restaurant-profit-margins-unit-economics"],
        "faq": [
            ("Should I open a restaurant in an urban or suburban location?", "Urban sites offer density and transit but higher rent and parking friction. Suburban sites offer lower rent and parking but rely on car traffic and predictable evening/weekend peaks."),
            ("Is high rent worth high foot traffic?", "Often yes—prime visibility acts as free marketing. Low-rent hidden locations require heavy advertising to overcome obscurity."),
            ("What is an anchor tenant and why does it matter?", "A high-traffic neighbor like a grocery store, cinema, or office tower that draws crowds your restaurant can capture through complementary positioning."),
            ("How do you calculate if foot traffic supports a lease?", "Count pedestrians during target dayparts, apply a conservative capture rate (1–2%), and compare resulting covers to your break-even point."),
            ("What belongs on a site selection checklist?", "Visibility, accessibility, parking, demographic match, competition density, infrastructure, zoning, anchor tenants, and lease terms."),
        ],
        "tldr": [
            "Ask \"Should I open here?\" only after a feasibility study—not after falling in love with exposed brick.",
            "Balance urban density versus suburban parking; align psychographics with your menu, not just income.",
            "High rent on a visible corner often beats cheap rent in a hidden alley.",
            "Score every finalist with <a href=\"https://restaurantsitefinder.com/\">Restaurant Site Finder</a> and a written checklist.",
        ],
    },
    {
        "file": r"c:\Users\Shree\Downloads\Choosing the Perfect Go No Go Location.docx",
        "slug": "go-no-go-restaurant-location-decision",
        "title": "Mastering Go/No-Go Restaurant Location Decision",
        "metaDescription": "Make informed Go/No-Go restaurant location decisions with our data-driven guide. Learn key factors, site analysis tips, and criteria for success.",
        "skip_lines": {"Choosing the Perfect Go No Go Location"},
        "date": "2026-06-06",
        "category": "Site Selection",
        "tags": ["go no go", "site selection", "feasibility", "lease red flags", "break-even"],
        "excerpt": "Use a formal Go/No-Go framework, site scoring matrix, and non-negotiable criteria to decide whether a location fits your concept before you sign.",
        "keywords": ["go no go restaurant location", "restaurant site selection criteria", "restaurant feasibility study", "site scoring matrix", "location decision"],
        "relatedSlugs": ["restaurant-site-selection-checklist", "choosing-perfect-spot-restaurants", "restaurant-location-strategies-maximum-profit"],
        "faq": [
            ("What is a Go/No-Go restaurant location decision?", "A formal checkpoint where hard data and non-negotiable criteria determine whether a site is viable for your specific concept—not whether the building is generically good or bad."),
            ("When should you walk away from a restaurant lease?", "When break-even requires 95% capacity daily, zoning blocks your use, CAM charges are uncapped, demolition clauses exist, or the corridor shows multiple vacant storefronts."),
            ("What is a site scoring matrix?", "A weighted spreadsheet scoring locations 1–5 on visibility, demographics, traffic, infrastructure, competition, and rent ratio to remove emotional bias."),
            ("What lease red flags should restaurateurs avoid?", "Demolition clauses, uncapped CAM/NNN fees, restrictive signage rules, and missing exclusivity for your category in shopping centers."),
            ("How do you calculate break-even for a new location?", "Divide fixed costs (rent, insurance, management salary) by contribution margin percentage to find the monthly sales required to cover all expenses."),
        ],
        "tldr": [
            "Go/No-Go decisions are concept-specific—a speakeasy alley can be a Go while a fast-casual spot there is a No-Go.",
            "Use weighted scorecards on visibility, traffic, infrastructure, rent ratio, and saturation.",
            "Walk away from uncapped CAM, demolition clauses, and corridors with heavy vacancy.",
            "Validate finalists with <a href=\"https://restaurantsitefinder.com/\">Restaurant Site Finder</a> before signing.",
        ],
    },
]

HEADING_PATTERNS = [
    r"^The Reality of",
    r"^The Foundation of",
    r"^Steps for",
    r"^Evaluating ",
    r"^Conducting ",
    r"^Direct vs",
    r"^Analyzing ",
    r"^Restaurant Competitive",
    r"^Tools for",
    r"^Advanced ",
    r"^Assessing ",
    r"^Identifying ",
    r"^Adapting ",
    r"^Standing ",
    r"^Niche ",
    r"^Conclusion",
    r"^Stop ",
    r"^The Bullseye",
    r"^Circles vs",
    r"^How Far",
    r"^Finding the",
    r"^Beyond Age",
    r"^The 'Pond'",
    r"^The Quality",
    r"^Defining Your Delivery",
    r"^The 'Look Around'",
    r"^Building Your",
    r"^Corner vs",
    r"^Is Your Traffic",
    r"^Reading the Room",
    r"^How to Spot",
    r"^The Halo Effect",
    r"^Hidden Deal",
    r"^The Golden Ratio",
    r"^The Go/No-Go Framework",
    r"^Urban Versus",
    r"^Knowing Your",
    r"^Mastering Geographic",
    r"^Visibility, Traffic",
    r"^Calculating Pedestrian",
    r"^The Impact of",
    r"^Neighborhood Gentrification",
    r"^Legalities",
    r"^Zoning Laws",
    r"^Commercial Lease",
    r"^Optimizing Delivery",
    r"^Best Tools",
    r"^Restaurant Site Selection",
    r"^A Restaurant Location",
    r"^What is a Go",
    r"^Core Location",
    r"^Navigating Restaurant",
    r"^Standalone Buildings",
    r"^The Financial",
    r"^Seating Capacity",
    r"^Finding the Break",
    r"^Identifying the Red",
    r"^Recognizing a Dying",
    r"^Commercial Lease Traps",
    r"^The Bureaucracy",
    r"^Building Your Go",
    r"^Making the Final",
    r"^\d+\. ",
]


def extract_paras(path: str) -> list[str]:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

    def para_text(p):
        texts = []
        for t in p.findall(".//w:t", ns):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        return "".join(texts).strip()

    return [para_text(p) for p in root.findall(".//w:p", ns) if para_text(p)]


def fix_text(text: str) -> str:
    return (
        text.replace("\u2014", "—")
        .replace("\u2013", "–")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\ufffd", "'")
    )


def is_heading(p: str) -> bool:
    if p.startswith("Meta title:") or p.startswith("Meta description:"):
        return False
    if len(p) > 140:
        return False
    for pat in HEADING_PATTERNS:
        if re.match(pat, p):
            return True
    if len(p) < 90 and p.endswith("?"):
        return True
    return False


def paras_to_markdown(paras: list[str], skip_lines: set[str]) -> str:
    lines: list[str] = []
    i = 0
    while i < len(paras):
        p = fix_text(paras[i])
        if p.startswith("Meta title:") or p.startswith("Meta description:"):
            i += 1
            continue
        if p in skip_lines:
            i += 1
            continue
        if is_heading(p):
            lines.append(f"\n## {p}\n")
            i += 1
            continue
        # short label lines ending with colon -> bold
        if len(p) < 80 and p.endswith(":") and not p.startswith("http"):
            lines.append(f"\n**{p.rstrip(':')}:**\n")
            i += 1
            continue
        # checklist items
        if p.startswith("[ ]"):
            lines.append(f"- {p[3:].strip()}")
            i += 1
            continue
        lines.append(p + "\n")
        i += 1
    return "\n".join(lines).strip()


def yaml_list(items: list[str]) -> str:
    return "\n".join(f"  - {item}" for item in items)


def yaml_faq(faq: list[tuple[str, str]]) -> str:
    out = []
    for q, a in faq:
        out.append(f'  - question: "{q}"')
        out.append(f'    answer: "{a.replace(chr(34), chr(39))}"')
    return "\n".join(out)


def tldr_html(items: list[str]) -> str:
    lis = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="tldr-box"><p><strong>Key Takeaways</strong></p><ul>{lis}</ul></div>'


def faq_section(faq: list[tuple[str, str]]) -> str:
    parts = ["\n## Frequently Asked Questions\n"]
    for q, a in faq:
        parts.append(f"### {q}\n\n{a}\n")
    return "\n".join(parts)


def build_article(art: dict) -> str:
    paras = extract_paras(art["file"])
    body = paras_to_markdown(paras, art["skip_lines"])
    intro = (
        f"Pair this guide with our [restaurant site selection checklist](/blog/restaurant-site-selection-checklist) "
        f"and [how to choose a restaurant location](/blog/how-to-choose-restaurant-location). "
        f"For free AI-powered scoring, run your address through "
        f"[Restaurant Site Finder](https://restaurantsitefinder.com/).\n"
    )
    return f"""---
title: "{art['title']}"
slug: {art['slug']}
metaDescription: "{art['metaDescription']}"
date: "{art['date']}"
lastModified: "{art['date']}"
author: "Horeca Store"
category: "{art['category']}"
tags:
{yaml_list(art['tags'])}
excerpt: "{art['excerpt']}"
keywords:
{yaml_list(art['keywords'])}
relatedSlugs:
{yaml_list(art['relatedSlugs'])}
faq:
{yaml_faq(art['faq'])}
---

{tldr_html(art['tldr'])}

{intro}

{body}
{faq_section(art['faq'])}
"""


def main():
    for art in ARTICLES:
        md = build_article(art)
        out = PROJECT / f"{art['slug']}.md"
        out.write_text(md, encoding="utf-8")
        print(f"Wrote {out.name} ({len(md)} chars)")


if __name__ == "__main__":
    main()
