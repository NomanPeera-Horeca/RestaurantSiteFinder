import { HORECA, SITE } from "../brand";
import { breadcrumbJsonLd, scriptsFromJsonLd } from "./jsonld";
import { breadcrumbHtml, renderPage } from "./layout";

const base = () => SITE.url.replace(/\/$/, "");

function legalBody(title: string, sections: { heading: string; paragraphs: string[] }[]): string {
  const content = sections
    .map(
      s => `
      <h2>${s.heading}</h2>
      ${s.paragraphs.map(p => `<p>${p}</p>`).join("")}`
    )
    .join("");

  return `
    ${breadcrumbHtml([{ name: "Home", href: `${base()}/` }, { name: title }])}
    <article class="prose">
      <header class="page-hero">
        <h1>${title}</h1>
        <p class="excerpt">Last updated: June 1, 2026</p>
      </header>
      ${content}
    </article>`;
}

export function renderPrivacyPolicy(): string {
  const url = `${base()}/privacy`;
  const body = legalBody("Privacy Policy", [
    {
      heading: "Overview",
      paragraphs: [
        `${SITE.name} is a free restaurant location analysis tool operated by ${HORECA.name} (${HORECA.website}). This policy explains what information we collect, how we use it, and your choices.`,
      ],
    },
    {
      heading: "Information We Collect",
      paragraphs: [
        "When you request a full analysis report, we collect contact information you provide (such as name, email address, and phone number), the address you analyze, and your selected restaurant concept.",
        "We automatically collect standard technical data such as browser type, device information, IP address, and pages visited through analytics tools to improve the service.",
      ],
    },
    {
      heading: "How We Use Information",
      paragraphs: [
        "We use your information to generate and deliver location analysis reports, respond to support requests, improve our AI models and product experience, and—where permitted—share relevant equipment and opening resources from Horeca Store.",
        "We do not sell your personal information to third parties.",
      ],
    },
    {
      heading: "Cookies & Analytics",
      paragraphs: [
        "We use cookies and similar technologies for site functionality and analytics (including PostHog product analytics and session replay). Password fields are masked in recordings; other form data such as email and phone may be visible in our analytics tools. You can control cookies through your browser settings.",
      ],
    },
    {
      heading: "Data Retention & Security",
      paragraphs: [
        "We retain lead and analysis data as long as needed to provide the service and meet legal obligations. We apply reasonable technical and organizational safeguards, but no online service is 100% secure.",
      ],
    },
    {
      heading: "Your Rights",
      paragraphs: [
        `You may request access, correction, or deletion of your personal data by emailing ${HORECA.email}. California and other state privacy rights may apply depending on your location.`,
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Questions about this policy: ${HORECA.email} or ${HORECA.phone}.`,
      ],
    },
  ]);

  return renderPage(
    {
      title: "Privacy Policy | Restaurant Site Finder",
      description:
        "Privacy policy for Restaurant Site Finder — how Horeca Store collects, uses, and protects your data when you use our free location analysis tool.",
      canonical: url,
      jsonLdScripts: scriptsFromJsonLd(
        breadcrumbJsonLd([
          { name: "Home", url: `${base()}/` },
          { name: "Privacy Policy", url },
        ])
      ),
    },
    body,
    "home"
  );
}

export function renderTermsOfService(): string {
  const url = `${base()}/terms`;
  const body = legalBody("Terms of Service", [
    {
      heading: "Acceptance",
      paragraphs: [
        `By using ${SITE.name} at ${SITE.url}, you agree to these Terms of Service. If you do not agree, do not use the service.`,
      ],
    },
    {
      heading: "Service Description",
      paragraphs: [
        `${SITE.name} provides AI-generated restaurant location analysis based on publicly available and third-party data. Reports include competitor insights, market signals, concept suggestions, and equipment planning resources.`,
      ],
    },
    {
      heading: "No Professional Advice",
      paragraphs: [
        "Analysis results are for informational purposes only. They are not legal, financial, real estate, or business advice. Always verify findings independently and consult qualified professionals before signing a lease or making investment decisions.",
      ],
    },
    {
      heading: "Accuracy & AI Limitations",
      paragraphs: [
        "AI and map data can be incomplete, outdated, or inaccurate. We do not guarantee the accuracy of scores, recommendations, or third-party information displayed in reports.",
      ],
    },
    {
      heading: "Acceptable Use",
      paragraphs: [
        "You may not scrape, reverse engineer, overload, or misuse the service. Automated access beyond normal use is prohibited without written permission.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        `The ${SITE.name} brand, software, and content are owned by ${HORECA.name} or its licensors. You may not copy or redistribute report content for commercial resale without permission.`,
      ],
    },
    {
      heading: "Limitation of Liability",
      paragraphs: [
        `${HORECA.name} is not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability is limited to the amount you paid for the service (which is $0 for free users).`,
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update these terms at any time. Continued use after changes constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Questions: ${HORECA.email} or ${HORECA.phone}.`,
      ],
    },
  ]);

  return renderPage(
    {
      title: "Terms of Service | Restaurant Site Finder",
      description:
        "Terms of Service for Restaurant Site Finder — acceptable use, disclaimers, and limitations for our free AI restaurant location analysis tool.",
      canonical: url,
      jsonLdScripts: scriptsFromJsonLd(
        breadcrumbJsonLd([
          { name: "Home", url: `${base()}/` },
          { name: "Terms of Service", url },
        ])
      ),
    },
    body,
    "home"
  );
}

export function renderAboutPage(): string {
  const url = `${base()}/about`;
  const body = `
    ${breadcrumbHtml([{ name: "Home", href: `${base()}/` }, { name: "About" }])}
    <article class="prose">
      <header class="page-hero">
        <h1>About Restaurant Site Finder</h1>
        <p class="excerpt">Free AI-powered restaurant location analysis by ${HORECA.name}.</p>
      </header>
      <h2>Our Mission</h2>
      <p>Restaurant Site Finder helps aspiring and experienced restaurant owners evaluate locations before signing a lease. We believe professional-grade site analysis should not cost thousands of dollars or be reserved for large chains.</p>
      <h2>Who Built This</h2>
      <p>${SITE.name} is built and maintained by the team at <a href="${HORECA.website}">${HORECA.name}</a>, a U.S. restaurant supply company stocking 100,000+ commercial kitchen products. Our team works with operators daily on equipment, opening timelines, and kitchen planning—and we built this tool to support smarter site decisions upstream.</p>
      <h2>What the Tool Does</h2>
      <p>Enter any address and receive competitor mapping, review sentiment signals, market gap analysis, GO/NO-GO scoring, and concept-specific equipment planning. Explore our <a href="${base()}/blog">restaurant opening guides</a> and <a href="${base()}/glossary">industry glossary</a> for deeper methodology.</p>
      <h2>Contact</h2>
      <p>Email <a href="mailto:${HORECA.email}">${HORECA.email}</a> or call <a href="${HORECA.phoneHref}">${HORECA.phone}</a>.</p>
    </article>`;

  return renderPage(
    {
      title: "About Restaurant Site Finder | Free Location Analysis Tool",
      description:
        "Learn about Restaurant Site Finder — a free AI restaurant location analysis tool built by Horeca Store to help owners evaluate sites before signing a lease.",
      canonical: url,
      jsonLdScripts: scriptsFromJsonLd(
        breadcrumbJsonLd([
          { name: "Home", url: `${base()}/` },
          { name: "About", url },
        ])
      ),
    },
    body,
    "home"
  );
}

export function renderContactPage(): string {
  const url = `${base()}/contact`;
  const body = `
    ${breadcrumbHtml([{ name: "Home", href: `${base()}/` }, { name: "Contact" }])}
    <article class="prose">
      <header class="page-hero">
        <h1>Contact Us</h1>
        <p class="excerpt">Questions about ${SITE.name} or restaurant equipment? We're here to help.</p>
      </header>
      <h2>Restaurant Site Finder Support</h2>
      <p>For questions about location analysis reports, account access, or technical issues, email <a href="mailto:${HORECA.email}">${HORECA.email}</a>.</p>
      <h2>Horeca Store Sales & Equipment</h2>
      <p>Need help choosing commercial kitchen equipment for your concept? Call <a href="${HORECA.phoneHref}">${HORECA.phone}</a> or visit <a href="${HORECA.website}">${HORECA.website}</a>.</p>
      <h2>Follow Us</h2>
      <ul>
        <li><a href="${HORECA.social.facebook}" target="_blank" rel="noopener">Facebook</a></li>
        <li><a href="${HORECA.social.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </article>`;

  return renderPage(
    {
      title: "Contact | Restaurant Site Finder",
      description:
        "Contact Restaurant Site Finder and Horeca Store for support with free location analysis, restaurant equipment, and opening questions.",
      canonical: url,
      jsonLdScripts: scriptsFromJsonLd(
        breadcrumbJsonLd([
          { name: "Home", url: `${base()}/` },
          { name: "Contact", url },
        ])
      ),
    },
    body,
    "home"
  );
}
