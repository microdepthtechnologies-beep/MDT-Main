import { cache } from "react";
import { notFound } from "next/navigation";
import { servicePages } from "@/data/service-pages";
import { getPublishedTemplate } from "@/lib/site-content";
import { getJournalPost, getJournalPosts } from "@/lib/journal";
import { pageMetadata } from "@/lib/site-seo";
import { JournalArticle } from "@/components/JournalArticle";
import { ServiceDetail } from "@/components/ServiceDetail";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ contentPath: string[] }> };
const resolve = cache(async (path: string) => {
  if (Object.hasOwn(servicePages, path)) return { kind: "service" as const, content: { ...await getPublishedTemplate(`service:${path}`, servicePages[path]), path: servicePages[path].path } };
  if (/^\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+$/i.test(path)) {
    const post = await getJournalPost(path.split("/")[3]);
    if (post && post.href === `/${path}/`) return { kind: "post" as const, content: post };
  }
  notFound();
});
export async function generateMetadata({ params }: Props) {
  const result = await resolve((await params).contentPath.join("/"));
  if (result.kind === "service") return pageMetadata(`${result.content.title} in Kenya | MDT`, result.content.description, result.content.path, result.content.image);
  const post = result.content;
  const metadata = pageMetadata(`${post.seoTitle} | MDT`, post.seoDescription, post.href, post.image);
  return { ...metadata, robots: { index: !post.noindex, follow: true }, openGraph: { ...metadata.openGraph, type: "article" as const, publishedTime: post.publishedAt, modifiedTime: post.updatedAt } };
}
export default async function Page({ params }: Props) {
  const result = await resolve((await params).contentPath.join("/"));
  if (result.kind === "service") return <ServiceDetail content={result.content} />;
  return <JournalArticle post={result.content} related={(await getJournalPosts()).filter(post => post.slug !== result.content.slug && !post.noindex).slice(0, 3)} />;
}
