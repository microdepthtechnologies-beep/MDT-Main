import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { articleDate, articleSections, type JournalPost } from "@/lib/journal";
import { siteOrigin } from "@/lib/site-seo";
import { StructuredData } from "./StructuredData";
import { MarketingLayout } from "./MarketingLayout";
import { JournalCards } from "./JournalCards";
import { MediaImage } from "./MediaImage";

export function JournalArticle({ post, related }: { post: JournalPost; related: JournalPost[] }) {
  const { headings, html } = articleSections(post.content);
  return <MarketingLayout breadcrumbs={[{ name: "Blog", path: "/blog/" }, { name: post.title, path: post.href }]}>
    <StructuredData value={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription, image: `${siteOrigin}${post.image}`, datePublished: post.publishedAt, dateModified: post.updatedAt, mainEntityOfPage: `${siteOrigin}${post.href}`, author: { "@type": "Organization", name: "Micro Depth Technologies", url: `${siteOrigin}/about/` }, publisher: { "@type": "Organization", name: "Micro Depth Technologies", logo: { "@type": "ImageObject", url: `${siteOrigin}/wp-content/uploads/2024/09/MDT-Logo-Red-1680px-613px.webp` } } }} />
    <header className="site-width article-header"><Link href={`/category/${post.categorySlug}/`} className="eyebrow"><span className="red-dash" />{post.topic}</Link><h1>{post.title}</h1><div><span>By Micro Depth Technologies</span><time dateTime={post.publishedAt.slice(0, 10)}>{articleDate(post.publishedAt)}</time><span><Clock3 size={14} />{post.readingMinutes} min read</span></div></header>
    <div className="site-width article-cover"><MediaImage src={post.image} alt={post.imageAlt} fill preload sizes="90vw" className="object-cover" /></div>
    <div className="site-width article-layout"><aside>{headings.length > 0 && <nav aria-label="In this article"><p className="eyebrow">IN THIS ARTICLE</p>{headings.map(heading => <a href={`#${heading.id}`} key={heading.id}>{heading.title}</a>)}</nav>}<div className="article-contact"><p>Put insight into action.</p><Link href="/contact/">Talk to MDT<ArrowUpRight size={17} /></Link></div></aside><article className="article-body content-copy" dangerouslySetInnerHTML={{ __html: html }} /></div>
    <div className="site-width article-bottom"><Link href="/blog/" className="text-link"><ArrowLeft size={17} />Back to the journal</Link><Link href="/contact/" className="text-link">Discuss your next project<ArrowUpRight size={17} /></Link></div>
    {related.length > 0 && <section className="site-width article-related"><p className="eyebrow">KEEP EXPLORING</p><h2>A little more perspective.</h2><JournalCards posts={related.slice(0, 3)} /></section>}
  </MarketingLayout>;
}
