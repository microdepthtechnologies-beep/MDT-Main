import { BlogPage } from "@/components/BlogPage";
import { getSiteContent } from "@/lib/site-content";
import { getJournalPosts } from "@/lib/journal";
import { pageMetadata } from "@/lib/site-seo";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props) {
  const [c, params] = await Promise.all([getSiteContent("blog"), searchParams]);
  const page = Math.max(1, Number.parseInt(String(params.page || "1"), 10) || 1);
  return { ...pageMetadata(c.seo.title, c.seo.description, page > 1 ? `/blog/?page=${page}` : "/blog/"), ...(params.q ? { robots: { index: false, follow: true } } : {}) };
}
export default async function Page({ searchParams }: Props) {
  const [content, posts, search] = await Promise.all([getSiteContent("blog"), getJournalPosts(), searchParams]);
  return <BlogPage content={content} posts={posts.filter(post => !post.noindex)} query={typeof search.q === "string" ? search.q.trim().slice(0, 200) : ""} page={Math.max(1, Number.parseInt(String(search.page || "1"), 10) || 1)} />;
}
