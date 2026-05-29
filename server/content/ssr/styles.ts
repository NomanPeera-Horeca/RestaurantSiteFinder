/** Standalone CSS for server-rendered blog/glossary pages */
export const SSR_STYLES = `
:root {
  --primary: #166534;
  --primary-dark: #14532d;
  --primary-light: #dcfce7;
  --foreground: #1e293b;
  --muted: #64748b;
  --border: #e2e8f0;
  --bg: #fafafa;
  --card: #ffffff;
  --radius: 0.625rem;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: 'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--foreground);
  background: var(--bg);
}
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; }
.container { width: 100%; max-width: 72rem; margin: 0 auto; padding: 0 1.25rem; }

/* Header */
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.site-header .inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 4rem;
}
.brand { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1.125rem; color: var(--foreground); text-decoration: none; }
.brand:hover { text-decoration: none; }
.brand-icon {
  width: 2rem; height: 2rem; border-radius: 0.5rem;
  background: var(--primary); display: flex; align-items: center; justify-content: center;
  color: white; font-size: 0.875rem;
}
.nav { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
.nav a { color: var(--muted); font-size: 0.875rem; font-weight: 500; }
.nav a:hover, .nav a.active { color: var(--primary); text-decoration: none; }
.horeca-banner {
  background: linear-gradient(90deg, var(--primary-dark), var(--primary));
  color: white; text-align: center; padding: 0.375rem 1rem; font-size: 0.75rem;
}
.horeca-banner a { color: white; }

/* Main */
main { padding: 2rem 0 4rem; min-height: 60vh; }
.page-hero { margin-bottom: 2.5rem; }
.page-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); line-height: 1.2; margin: 0 0 1rem; font-weight: 700; }
.page-hero .meta { color: var(--muted); font-size: 0.875rem; display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
.page-hero .excerpt { font-size: 1.125rem; color: var(--muted); margin-top: 0.75rem; max-width: 42rem; }

/* Breadcrumb */
.breadcrumb { font-size: 0.8125rem; color: var(--muted); margin-bottom: 1.5rem; }
.breadcrumb a { color: var(--muted); }
.breadcrumb span { margin: 0 0.35rem; }

/* TL;DR */
.tldr-box {
  background: var(--primary-light);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  margin: 0 0 2rem;
}
.tldr-box strong { color: var(--primary-dark); display: block; margin-bottom: 0.5rem; }

/* Prose */
.prose { max-width: 48rem; }
.prose h2 { font-size: 1.5rem; margin: 2.5rem 0 1rem; font-weight: 700; line-height: 1.3; }
.prose h3 { font-size: 1.25rem; margin: 2rem 0 0.75rem; font-weight: 600; }
.prose p { margin: 0 0 1.25rem; }
.prose ul, .prose ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
.prose li { margin-bottom: 0.5rem; }
.prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9375rem; }
.prose th, .prose td { border: 1px solid var(--border); padding: 0.625rem 0.875rem; text-align: left; }
.prose th { background: var(--primary-light); font-weight: 600; }
.prose blockquote { border-left: 3px solid var(--border); margin: 1.5rem 0; padding-left: 1rem; color: var(--muted); }
.prose code { background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; }
.prose pre { background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: var(--radius); overflow-x: auto; }
.prose pre code { background: none; padding: 0; color: inherit; }

/* Definition block */
.def-block {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin: 1rem 0;
}
.def-block dt { font-weight: 700; color: var(--primary-dark); }
.def-block dd { margin: 0.5rem 0 0; color: var(--muted); }

/* FAQ */
.faq-section { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); }
.faq-section h2 { font-size: 1.5rem; margin-bottom: 1.25rem; }
.faq-item { margin-bottom: 1.25rem; }
.faq-item h3 { font-size: 1.0625rem; margin: 0 0 0.5rem; font-weight: 600; }
.faq-item p { margin: 0; color: var(--muted); }

/* CTA */
.cta-box {
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white; border-radius: var(--radius);
  padding: 2rem; margin: 3rem 0 0; text-align: center;
}
.cta-box h2 { color: white; margin: 0 0 0.75rem; font-size: 1.375rem; }
.cta-box p { color: rgba(255,255,255,0.8); margin: 0 0 1.25rem; }
.btn {
  display: inline-block; padding: 0.75rem 1.5rem; border-radius: 0.75rem;
  font-weight: 600; font-size: 0.9375rem; text-decoration: none;
}
.btn-primary { background: white; color: var(--foreground); }
.btn-primary:hover { background: #f1f5f9; text-decoration: none; }
.btn-outline { border: 1px solid rgba(255,255,255,0.4); color: white; margin-left: 0.75rem; }
.btn-outline:hover { background: rgba(255,255,255,0.1); text-decoration: none; }

/* Blog listing */
.blog-grid { display: grid; gap: 1.5rem; }
@media (min-width: 640px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
.blog-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.blog-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(22,101,52,0.08); }
.blog-card h2 { font-size: 1.125rem; margin: 0 0 0.5rem; }
.blog-card h2 a { color: var(--foreground); text-decoration: none; }
.blog-card h2 a:hover { color: var(--primary); }
.blog-card .cat { font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.blog-card p { font-size: 0.875rem; color: var(--muted); margin: 0; }

/* Glossary */
.glossary-index { display: grid; gap: 2rem; }
.glossary-cat h2 { font-size: 1.25rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem; margin-bottom: 1rem; }
.term-list { list-style: none; padding: 0; margin: 0; columns: 1; }
@media (min-width: 640px) { .term-list { columns: 2; } }
.term-list li { margin-bottom: 0.625rem; break-inside: avoid; }
.term-list a { font-weight: 500; }
.term-short { color: var(--muted); font-size: 0.875rem; display: block; margin-top: 0.15rem; }
.related-links { margin-top: 2rem; padding: 1.25rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
.related-links h3 { font-size: 1rem; margin: 0 0 0.75rem; }
.related-links ul { margin: 0; padding-left: 1.25rem; }
.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
.tag { font-size: 0.75rem; background: var(--primary-light); color: var(--primary-dark); padding: 0.25rem 0.625rem; border-radius: 999px; }

/* Footer */
.site-footer { background: var(--card); border-top: 1px solid var(--border); padding: 3rem 0 2rem; margin-top: 2rem; }
.footer-grid { display: grid; gap: 2rem; }
@media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(3, 1fr); } }
.site-footer h3 { font-size: 0.9375rem; margin: 0 0 1rem; }
.site-footer ul { list-style: none; padding: 0; margin: 0; }
.site-footer li { margin-bottom: 0.5rem; }
.site-footer a { color: var(--muted); font-size: 0.875rem; }
.footer-bottom { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--muted); text-align: center; }

@media (max-width: 639px) {
  .nav { gap: 0.75rem; }
  .horeca-logo { display: none; }
}
`;
