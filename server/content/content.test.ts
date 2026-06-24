import { describe, expect, it } from "vitest";
import { getAllBlogSlugs, loadAllBlogPosts, loadBlogPost } from "./blog";
import { getAllGlossarySlugs, getAllGlossaryTerms, getGlossaryTerm } from "./glossary";
import { renderBlogArticle, renderBlogListing, renderGlossaryIndex, renderGlossaryTerm } from "./ssr/pages";
import { renderPrivacyPolicy, renderTermsOfService } from "./ssr/legal-pages";

describe("content", () => {
  it("loads 17 blog posts", () => {
    expect(getAllBlogSlugs().length).toBe(17);
    expect(loadAllBlogPosts().every(p => p.html.length > 500)).toBe(true);
  });

  it("loads 55 glossary terms", () => {
    expect(getAllGlossarySlugs().length).toBe(55);
    expect(getGlossaryTerm("prime-cost")?.term).toBe("Prime Cost");
  });

  it("renders SSR HTML with visible body content", () => {
    const listing = renderBlogListing();
    expect(listing).toContain("<h1>Restaurant Opening Guides</h1>");
    expect(listing).toContain("BlogPosting");
    expect(listing).toContain("Site Selection Tips");

    const article = renderBlogArticle("how-to-choose-restaurant-location");
    expect(article).toContain("tldr-box");
    expect(article).toContain("BlogPosting");
    expect(article).toContain("Article");
    expect(article).toContain("FAQPage");
    expect(loadBlogPost("how-to-choose-restaurant-location")!.frontmatter.faq.length).toBeGreaterThanOrEqual(3);

    const glossary = renderGlossaryIndex();
    expect(glossary).toContain("DefinedTermSet");

    const term = renderGlossaryTerm("prime-cost");
    expect(term).toContain("Prime Cost");
    expect(term).toContain("DefinedTerm");
    expect(term).toContain("Definition & Guide");
  });

  it("renders legal pages with footer links", () => {
    const privacy = renderPrivacyPolicy();
    expect(privacy).toContain("Privacy Policy");
    expect(privacy).toContain("/privacy");

    const terms = renderTermsOfService();
    expect(terms).toContain("Terms of Service");
    expect(terms).toContain("/terms");
  });
});
