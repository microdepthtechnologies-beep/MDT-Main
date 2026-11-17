import type { MetadataRoute } from "next";
import { categoryHref, getCategories } from "@/lib/catalogue";
import { getJournalPosts } from "@/lib/journal";
import { sitePaths } from "@/data/site-content";
import { servicePages } from "@/data/service-pages";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://mdt.co.ke";
  const [cats, posts] = await Promise.all([
    getCategories(),
    getJournalPosts(),
  ]);
  return [
    ...Object.values(sitePaths).map(path => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.8 })),
    { url: `${base}/shop/`, changeFrequency: "weekly", priority: 0.9 },
    ...Object.values(servicePages).map(page => ({ url: `${base}${page.path}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.filter(post => !post.noindex).map(post => ({ url: `${base}${post.href}`, lastModified: new Date(post.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...[...new Set(posts.filter(post => !post.noindex).map(post => post.categorySlug))].map(slug => ({ url: `${base}/category/${slug}/`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...cats.map((c) => ({
      url: `${base}${categoryHref(c, cats)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
