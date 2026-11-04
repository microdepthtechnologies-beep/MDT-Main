import { cache } from "react";
import { decode } from "he";
import { getDb } from "./mongodb";
import { contentHtml } from "./content-html";
import { editorialMedia } from "@/data/editorial-media";

export type JournalPost = {
  slug: string; title: string; excerpt: string; content: string;
  image: string; imageAlt: string; publishedAt: string; updatedAt: string;
  href: string; topic: string; categorySlug: string; readingMinutes: number;
  seoTitle: string; seoDescription: string; noindex: boolean;
};
const plain = (value: unknown) => decode(String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const dateValue = (value: unknown) => value instanceof Date ? value.toISOString() : String(value || "").replace(" ", "T");
const knownCategories: Record<string, { name: string; slug: string }> = {
  "11-branch-network-refresh-for-a-regional-sacco": { name: "Financial services", slug: "financial-services" },
  "deploying-campus-wide-wi-fi-a-120-seat-desktop-lab-for-higher-education": { name: "Education", slug: "education" },
};

export const getJournalPosts = cache(async (): Promise<JournalPost[]> => {
  const db = await getDb();
  const rows = await db.collection("posts").find({ status: "publish", slug: { $nin: ["", null] } }, {
    projection: { _id: 0, slug: 1, title: 1, content: 1, excerpt: 1, featuredImage: 1, createdAt: 1, updatedAt: 1, seo: 1, topic: 1, categorySlug: 1 },
  }).sort({ createdAt: -1 }).toArray();
  return rows.flatMap(row => {
    const publishedAt = dateValue(row.createdAt);
    const date = publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!date || !/^[a-z0-9][a-z0-9-]*$/i.test(row.slug)) return [];
    const category = knownCategories[row.slug];
    const source = String(row.featuredImage?.url || "").replace(/^https?:\/\/(?:www\.)?mdt\.co\.ke/, "");
    const image = source.startsWith("/wp-content/uploads/") ? source : editorialMedia.hero;
    const content = contentHtml(String(row.content || "").replace(/\[\/?(?:vc_|mfn_|fusion_)[^\]]*\]/g, ""));
    const excerpt = plain(row.excerpt) || plain(content).slice(0, 210).replace(/\s+\S*$/, "") + "…";
    return [{
      slug: row.slug, title: plain(row.title), excerpt, content, image, imageAlt: plain(row.featuredImage?.alt) || plain(row.title),
      publishedAt, updatedAt: dateValue(row.updatedAt || row.createdAt),
      href: `/${date[1]}/${date[2]}/${date[3]}/${row.slug}/`,
      topic: plain(row.topic) || category?.name || "Technology insights",
      categorySlug: /^[a-z0-9-]+$/.test(row.categorySlug || "") ? row.categorySlug : category?.slug || "technology-insights",
      readingMinutes: Math.max(1, Math.ceil(plain(content).split(/\s+/).length / 220)),
      seoTitle: plain(row.seo?.title).replace(/%%[^%]+%%/g, "").trim() || plain(row.title),
      seoDescription: plain(row.seo?.metaDescription) || excerpt,
      noindex: row.seo?.noindex === true,
    }];
  });
});

export const getJournalPost = cache(async (slug: string) => (await getJournalPosts()).find(post => post.slug === slug));

export function articleDate(value: string) {
  const date = new Date(value.slice(0, 10) + "T12:00:00Z");
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
}

export function articleSections(content: string) {
  const headings: { id: string; title: string }[] = [];
  const html = content.replace(/<h([1-3])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_match, level, body) => {
    const id = `section-${headings.length + 1}`;
    headings.push({ id, title: plain(body) });
    const tag = level === "1" ? "2" : level;
    return `<h${tag} id="${id}">${body}</h${tag}>`;
  });
  return { headings, html };
}
