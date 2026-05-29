import { Marked } from "marked";

const marked = new Marked({
  gfm: true,
  breaks: false,
});

marked.use({
  renderer: {
    image({ href, title, text }) {
      const alt = text || "";
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${alt}" loading="lazy" decoding="async"${titleAttr} />`;
    },
    link({ href, title, text }) {
      const isExternal = href?.startsWith("http");
      const rel = isExternal ? ' rel="noopener"' : "";
      const target = isExternal ? ' target="_blank"' : "";
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${href}"${target}${rel}${titleAttr}>${text}</a>`;
    },
  },
});

export function markdownToHtml(md: string): string {
  return marked.parse(md) as string;
}

export function estimateReadTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
