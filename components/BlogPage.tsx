import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import { articleDate, type JournalPost } from "@/lib/journal";
import { JournalCards } from "./JournalCards";
import { MediaImage } from "./MediaImage";
import { LineHeading, MarketingCTA, MarketingLayout } from "./MarketingLayout";

export function BlogPage({ content: c, posts, query = "", page = 1, category }: {
  content: typeof siteContent.blog; posts: JournalPost[]; query?: string; page?: number; category?: string;
}) {
  const topics = [...new Map(posts.map(post => [post.categorySlug, post.topic])).entries()];
  const topic = topics.find(([slug]) => slug === category);
  if (category && !topic) notFound();
  const base = category ? `/category/${category}/` : "/blog/";
  const matching = posts.filter(post => (!category || post.categorySlug === category) && `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(matching.length / 6));
  if (page > pages) notFound();
  const current = matching.slice((page - 1) * 6, page * 6);
  const featured = !category && !query && page === 1 ? current[0] : undefined;
  const grid = featured ? current.slice(1) : current;
  const withQuery = (path: string) => query ? `${path}?q=${encodeURIComponent(query)}` : path;
  const pageUrl = (number: number) => `${base}?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(number) })}`;
  return <MarketingLayout breadcrumbs={[{ name: "Blog", path: "/blog/" }, ...(category ? [{ name: topic![1], path: base }] : [])]}>
    <section className="site-width journal-hero"><div><p className="eyebrow"><span className="red-dash" />{c.hero.eyebrow}</p><h1>{topic ? topic[1] : <LineHeading text={c.hero.title} />}</h1></div><p>{c.hero.description}</p></section>
    {featured && <section className="site-width journal-feature"><Link href={featured.href} className="journal-feature-image" aria-hidden="true" tabIndex={-1}><MediaImage src={featured.image} alt="" fill preload sizes="(max-width:800px) 92vw, 55vw" className="object-cover" /><span>IN FOCUS / THE LATEST</span></Link><div className="journal-feature-copy"><div className="journal-card-meta"><span>{featured.topic}</span><span>{featured.readingMinutes} min read</span></div><h2><Link href={featured.href}>{featured.title}</Link></h2><p>{featured.excerpt}</p><div><time dateTime={featured.publishedAt.slice(0, 10)}>{articleDate(featured.publishedAt)}</time><Link href={featured.href} aria-label={`Read ${featured.title}`}><ArrowUpRight size={25} /></Link></div></div></section>}
    <section className="site-width journal-listing" id="articles"><div className="journal-listing-heading"><h2>{query ? "Search the journal" : featured ? "More from the journal" : "From the journal"}</h2><span>{matching.length} {matching.length === 1 ? "article" : "articles"}</span></div>
      <div className="journal-toolbar"><nav aria-label="Article topics"><Link href={withQuery("/blog/")} aria-current={!category ? "page" : undefined}>All stories</Link>{topics.map(([slug, name]) => <Link key={slug} href={withQuery(`/category/${slug}/`)} aria-current={category === slug ? "page" : undefined}>{name}</Link>)}</nav><form action={base} role="search"><label htmlFor="journal-search" className="sr-only">Search articles</label><input id="journal-search" name="q" type="search" placeholder="Find an article…" defaultValue={query} /><button type="submit" aria-label="Search articles"><Search size={19} /></button></form></div>
      {grid.length ? <JournalCards posts={grid} /> : !featured && <div className="journal-empty"><Search size={32} strokeWidth={1.3} /><h3>{query ? "Let’s try another search." : "More insights are on the way."}</h3><p>{query ? "Try a different keyword, or return to all stories." : "Explore our services or speak to our team about your technology requirements."}</p><Link className="text-link" href={query ? base : "/our-services/"}>{query ? "Clear search" : "Explore our services"}<ArrowUpRight size={17} /></Link></div>}
      {pages > 1 && <nav className="journal-pagination" aria-label="Article pagination">{page > 1 ? <Link href={pageUrl(page - 1)}><ArrowLeft size={16} />Previous</Link> : <span />}<span>Page {page} of {pages}</span>{page < pages ? <Link href={pageUrl(page + 1)}>Next<ArrowRight size={16} /></Link> : <span />}</nav>}
    </section><MarketingCTA data={c.cta} />
  </MarketingLayout>;
}
