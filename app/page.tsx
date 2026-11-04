import { HomePage } from "@/components/HomePage";
import { getSiteContent } from "@/lib/site-content";
import { getJournalPosts } from "@/lib/journal";
import { pageMetadata } from "@/lib/site-seo";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("home");
  return pageMetadata(c.seo.title, c.seo.description, "/", c.hero.image);
}
export default async function Home() {
  const [content, posts] = await Promise.all([getSiteContent("home"), getJournalPosts()]);
  return <HomePage content={content} posts={posts.filter(post => !post.noindex)} />;
}
