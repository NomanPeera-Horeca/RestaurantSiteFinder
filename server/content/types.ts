export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogFrontmatter {
  title: string;
  /** Optional SEO title tag; defaults to `title` when omitted */
  metaTitle?: string;
  slug: string;
  metaDescription: string;
  date: string;
  lastModified: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
  keywords: string[];
  faq: BlogFaq[];
  relatedSlugs?: string[];
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  html: string;
  readTimeMinutes: number;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  shortDefinition: string;
  longDefinition: string;
  relatedTerms: string[];
  relatedBlogSlugs: string[];
  category: string;
}

export interface GlossaryData {
  terms: GlossaryTerm[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}
