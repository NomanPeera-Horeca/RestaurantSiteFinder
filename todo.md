# SiteFind AI - Project TODO

## Landing Page & Lead Capture
- [x] Hero section with "Don't sign that lease until you run the numbers" headline
- [x] Address search bar with Google Maps autocomplete
- [x] "Analyze My Location" CTA button
- [x] Lead capture wall (email + phone) after initial scan
- [x] Lead storage to database

## SiteFind AI Report Dashboard
- [x] Competitor Snapshot table (Name, Cuisine, Rating, Price Level) via Google Places
- [x] Market Logic section with saturated vs underserved cuisine checkmarks
- [x] Review Sentiment extraction (top complaints from competitors)
- [x] LLM-powered analysis of competitor reviews and market gaps
- [x] 3 Winning Concept suggestions with menu ideas
- [x] Risk Analysis with 1-10 Opportunity Score
- [x] GO / NO-GO recommendation

## Horeca Store Integration
- [x] Dynamic Equipment List based on winning concepts
- [x] Branded CTAs linking to www.thehorecastore.com
- [x] "Shop Pre-Opening Equipment Bundles" button
- [x] Footer: "SiteFind AI is a free tool provided by Horeca Store"
- [x] Contact info: sales@thehorecastore.com and 866.446.7322

## Backend & Infrastructure
- [x] Database schema for leads and reports
- [x] Google Places API integration for competitor data
- [x] LLM integration for market analysis and concept generation
- [x] Owner notification for high-quality leads (opportunity score >= 7)
- [x] Design system and theming

## Testing
- [x] Backend API tests (8/8 passing)
- [x] End-to-end flow verification

## SEO & Google Discoverability
- [x] Add comprehensive meta tags (title, description, keywords) for all pages
- [x] Add Open Graph and Twitter Card meta tags for social sharing
- [x] Create sitemap.xml for Google indexing
- [x] Create robots.txt allowing all crawlers
- [x] Add JSON-LD structured data (Organization, WebApplication, FAQPage, BreadcrumbList, HowTo)
- [x] Add canonical URLs
- [x] Add SEO-rich content sections with restaurant industry keywords

## LLM / AI Discoverability
- [x] Create llms.txt file for AI crawler discovery
- [x] Add semantic HTML with proper heading hierarchy
- [x] Add structured FAQ section for LLM knowledge extraction
- [x] Add meta descriptions optimized for AI summarization

## Horeca Store Branding & Backlinks
- [x] Increase dofollow backlinks to www.thehorecastore.com throughout all pages
- [x] Add Horeca Store branding banner/ribbon on landing page
- [x] Add "Powered by Horeca Store" with link in header and footer
- [x] Add Horeca Store logo/branding in report header
- [x] Add "About Horeca Store" section on landing page
- [x] Add Horeca Store trust badges and value propositions
- [x] Ensure all equipment CTAs link to www.thehorecastore.com with proper anchor text
- [x] Add Horeca Store contact info prominently (sales@thehorecastore.com, 866.446.7322)
- [x] Add "Why Horeca Store" section highlighting benefits for new restaurant owners

## Lead Magnet Positioning
- [x] Make it clear this is a free tool BY Horeca Store (not just "powered by")
- [x] Add Horeca Store value proposition messaging throughout the funnel
- [x] Add social proof / trust signals for Horeca Store

## Blog Section
- [x] Create blog data structure with articles
- [x] Build blog listing page (/blog)
- [x] Build blog article detail page (/blog/:slug)
- [x] Write article: How to Choose a Restaurant Location
- [x] Write article: Restaurant Equipment Checklist for New Owners
- [x] Write article: Restaurant Market Analysis Guide
- [x] Write article: Opening a Restaurant Costs Breakdown
- [x] Write article: Restaurant Concept Development Guide
- [x] Add blog navigation link to site header
- [x] Add blog section to sitemap.xml
- [x] Add Horeca Store backlinks and CTAs in every article
- [x] Add blog tests (covered in seo.test.ts)

## Favicon & Manus Removal
- [x] Generate custom favicon for Restaurant Site Finder
- [x] Remove all Manus branding/references from the site
- [ ] Update VITE_APP_TITLE and VITE_APP_LOGO (user: Settings > General)

## Promotional Banners
- [x] Add promotional offer banners (free kitchen design, free consultancy, 5-year financing, etc.)
- [x] Place banners on landing page, report page, and blog pages
- [x] Ensure banners link to Horeca Store with strong CTAs

## PDF Report Download
- [x] Create server-side PDF generation endpoint with Horeca Store branding
- [x] Add download PDF button to Report page
- [x] Include all report sections in PDF (competitors, market, concepts, equipment)
- [x] Add Horeca Store logo, contact info, and CTAs in PDF

## Copy Overhaul & Storytelling
- [x] Remove all em dashes (replace with commas, periods, or rewrite)
- [x] Remove "lead magnet" language from all user-facing copy (keeping AI references per user request)
- [x] Rewrite hero/landing copy with storytelling: Horeca Store helps small restaurant owners access $5,000+ analysis for free
- [x] Rewrite "About" section with mission story (consultants charge thousands, we give it free)
- [x] Rewrite FAQ with human tone
- [x] Update all CTAs to feel helpful, not salesy
- [x] Update blog articles to remove em dashes
- [x] Update meta descriptions and SEO text

## Google Sheets Integration
- [x] Create Google Sheets integration for lead capture (email, phone, address, score)
- [x] Create Google Sheets integration for website metrics (visits, page views)
- [x] Add analytics tracking endpoint (trpc lead.trackEvent)

## Social Sharing
- [x] Add WhatsApp share button
- [x] Add Facebook share button
- [x] Add Twitter/X share button
- [x] Add LinkedIn share button
- [x] Add Email share button
- [x] Add share buttons to Report page
- [x] Add share buttons to landing page CTA section

## AI Disclaimer
- [x] Add AI disclaimer on report page (similar to ChatGPT/Claude style)
- [x] Add disclaimer in PDF report
- [x] Add disclaimer in landing page footer
- [x] Disclaimer says analysis is for informational purposes, not professional advice

## Mobile UI Fixes
- [x] Fix Horeca Store banner overlapping content on mobile
- [x] Fix promo banner arrows cut off on edges
- [x] Fix "GO" badge clipping on report opportunity score section
- [x] Fix opportunity score layout breaking on mobile
- [x] Fix concept cards layout on mobile (risk score getting cut off)
- [x] General mobile responsive cleanup for iPhone/Samsung devices
- [x] Remove remaining "lead magnet" text from FAQ answer (already done in previous session)
- [x] Remove remaining em dashes from hero subtitle and other copy (already done in previous session)

## Menu-Market Fit Enhancement
- [x] Enhance AI prompt to analyze demographic demand for suggested cuisines
- [x] Add population/demographic context to analysis
- [x] Include demand signals (do people in this area actually want this cuisine?)
- [x] Show menu-market fit score or indicator for each concept
- [x] Add MenuMarketFit type with demandScore, demandExplanation, populationMatch, searchDemandSignals, competitiveAdvantage
- [x] Update LLM JSON schema to require menuMarketFit for each concept
- [x] Add Menu-Market Fit UI section in Report concept cards
- [x] Write vitest tests for MenuMarketFit types (5 tests passing)

## Live Test & PDF Enhancement
- [x] Run live test with 6800 Bissonnet St, Houston, TX to verify Menu-Market Fit AI output
- [x] Add Menu-Market Fit section to PDF report generation
- [x] Verify PDF includes demand score, population match, demand signals, competitive advantage
- [x] Update PDF tests for Menu-Market Fit (2 new tests, 60 total passing)

## International Location Support
- [x] Investigate why analysis fails for non-US locations (e.g., Al Quoz, Dubai) - CONFIRMED: No issue found, tool works globally
- [x] Fix any US-only restrictions in the analysis pipeline - No restrictions existed
- [x] Test with Dubai/UAE location - Full report generated successfully (7/10 GO, 18 competitors, 3 concepts with Menu-Market Fit)

## Google Search Console
- [x] Add Google site verification meta tag to index.html
- [ ] Publish and verify ownership in Google Search Console

## Branding Cleanup
- [x] Remove all remaining "SiteFind AI" references and replace with "Restaurant Site Finder"

## SEO - Sitemap Enhancement
- [ ] Add individual blog article URLs to sitemap.xml

## Favicon Fix
- [x] Fix favicon showing as dark green box instead of proper icon - generated new location pin + fork/knife icon
## Sitemap Live Check
- [ ] Verify live sitemap has all 8 URLs after publish

## LLM Visibility Enhancements
- [x] Add Article JSON-LD schema to each blog post page
- [x] Create glossary page with 30-40 restaurant industry terms
- [x] Add glossary route to App.tsx and navigation
- [x] Expand llms.txt with sample report output, use cases, pricing comparison
- [x] Update sitemap to include glossary page
- [x] Add glossary page to sitemap in seo.ts

## PDF Report Overhaul
- [x] Fix blank pages in PDF report (pages 6-12 are empty)
- [x] Add strong Horeca Store branding on every page (header/footer)
- [x] Make Horeca Store links clickable in PDF (www.thehorecastore.com)
- [x] Improve overall PDF design (better typography, colors, spacing)
- [x] Add Horeca Store branded header on every page
- [x] Add Horeca Store footer with contact info on every page
- [x] Ensure no wasted space / blank pages
