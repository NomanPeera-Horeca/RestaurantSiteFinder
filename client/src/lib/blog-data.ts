export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
}
export const blogArticles: BlogArticle[] = [];
export default blogArticles;
