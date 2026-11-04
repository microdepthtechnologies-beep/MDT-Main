import { notFound } from "next/navigation";
import { BlogPage } from "@/components/BlogPage";
import { getSiteContent } from "@/lib/site-content";
import { getJournalPosts } from "@/lib/journal";
import { pageMetadata } from "@/lib/site-seo";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params, searchParams }: Props) {
  const [{ slug }, search, posts] = await Promise.all([params, searchParams, getJournalPosts()]);
  const post = posts.find(post => post.categorySlug === slug && !post.noindex);
  if (!post) notFound();
  const page = Math.max(1, Number.parseInt(String(search.page || "1"), 10) || 1);
  return { ...pageMetadata(`${post.topic} | MDT Journal`, `Explore ${post.topic.toLowerCase()} articles and insights from Micro Depth Technologies.`, `/category/${slug}/${page > 1 ? `?page=${page}` : ""}`), ...(search.q ? { robots: { index: false, follow: true } } : {}) };
}
export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, search, content, posts] = await Promise.all([params, searchParams, getSiteContent("blog"), getJournalPosts()]);
  return <BlogPage content={content} posts={posts.filter(post => !post.noindex)} category={slug} query={typeof search.q === "string" ? search.q.trim().slice(0, 200) : ""} page={Math.max(1, Number.parseInt(String(search.page || "1"), 10) || 1)} />;
}
