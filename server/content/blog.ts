import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BLOG_DIR } from "./paths";
import type { BlogFrontmatter, BlogPost } from "./types";
import { markdownToHtml, estimateReadTimeMinutes } from "./markdown";

function parseFrontmatter(data: Record<string, unknown>): BlogFrontmatter {
  return {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    metaDescription: String(data.metaDescription ?? ""),
    date: String(data.date ?? ""),
    lastModified: String(data.lastModified ?? data.date ?? ""),
    author: String(data.author ?? "Horeca Store"),
    category: String(data.category ?? "Guides"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    excerpt: String(data.excerpt ?? ""),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    faq: Array.isArray(data.faq)
      ? (data.faq as { question?: string; answer?: string }[]).map(f => ({
          question: String(f.question ?? ""),
          answer: String(f.answer ?? ""),
        }))
      : [],
    relatedSlugs: Array.isArray(data.relatedSlugs) ? data.relatedSlugs.map(String) : [],
  };
}

export function loadBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(data as Record<string, unknown>);
  const html = markdownToHtml(content);

  return {
    frontmatter,
    content,
    html,
    readTimeMinutes: estimateReadTimeMinutes(html),
  };
}

export function loadAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"))
    .sort();

  const posts: BlogPost[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const post = loadBlogPost(slug);
    if (post) posts.push(post);
  }

  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export function getAllBlogSlugs(): string[] {
  return loadAllBlogPosts().map(p => p.frontmatter.slug);
}
