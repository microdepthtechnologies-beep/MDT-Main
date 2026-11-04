import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Headphones, Network, Settings2 } from "lucide-react";
import { categoryChain, categoryHref, cleanProduct, getCategories, getProduct, text, type Product } from "@/lib/catalogue";
import { getDb } from "@/lib/mongodb";
import { contentHtml } from "@/lib/content-html";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ProductExperience } from "./ProductExperience";
import { ProductCard } from "./ProductCard";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const title = p.seo?.title && !p.seo.title.includes("%%") ? p.seo.title : p.name;
  return {
    title, description: p.seo?.metaDescription || text(p.shortDescription).slice(0, 160),
    alternates: { canonical: p.seo?.canonical || `/product/${p.slug}/` },
    robots: p.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, images: p.featuredImage?.url ? [new URL(p.featuredImage.url, "https://mdt.co.ke").href] : [] },
  };
}
export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [p, categories, db] = await Promise.all([getProduct(slug), getCategories(), getDb()]);
  if (!p) notFound();
  const category = categories.filter(c => p.categories?.some(pc => pc.slug === c.slug)).sort((a, b) => categoryChain(b, categories).length - categoryChain(a, categories).length)[0];
  const related = category ? await db.collection<Product>("products").find({ status: "publish", "categories.slug": category.slug, wpId: { $ne: p.wpId } }).limit(4).toArray() : [];
  const specs = Object.entries(p.attributes || {});
  return <>
    <SiteHeader />
    <main className="product-detail-page">
      <div className="site-width">
        <nav className="breadcrumbs product-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop/">Products</Link>{category && <><span>/</span><Link href={categoryHref(category, categories)}>{category.name}</Link></>}<span>/</span><span aria-current="page">{p.name}</span></nav>
        <ProductExperience product={p} summary={contentHtml(p.shortDescription)} categoryLink={category ? categoryHref(category, categories) : undefined} />
        <nav className="product-section-nav" aria-label="Product information"><a href="#overview">Overview <ArrowRight size={14} /></a><a href="#specifications">Specifications <ArrowRight size={14} /></a><a href="#product-support">Services & support <ArrowRight size={14} /></a></nav>
        <section id="overview" className="product-information-section"><div><p className="eyebrow">01 / THE DETAILS</p><h2>A closer look.</h2></div><div className="content-copy" dangerouslySetInnerHTML={{ __html: contentHtml(p.description || p.shortDescription || "<p>Talk to our team for detailed product information and help choosing the right configuration.</p>") }} /></section>
        <section id="specifications" className="product-information-section"><div><p className="eyebrow">02 / SPECIFICATIONS</p><h2>Know your<br />technology.</h2><p>Specifications may vary by configuration. Confirm your requirements when requesting a quotation.</p></div><dl className="specification-table">{specs.length ? specs.map(([key, values]) => <div key={key}><dt>{key.replace(/-/g, " ")}</dt><dd>{values.join(" / ")}</dd></div>) : <div><dt>Specifications</dt><dd>Contact our team for a detailed specification sheet.</dd></div>}{p.sku && <div><dt>Model / SKU</dt><dd>{p.sku}</dd></div>}</dl></section>
        <section id="product-support" className="product-support-section"><div><p className="eyebrow">03 / BEYOND THE PURCHASE</p><h2>Technology that works.<br />People who make it work.</h2><Link className="text-link" href="/#contact">Talk to our team <ArrowUpRight size={16} /></Link></div><div className="support-options">{[{ icon: Network, title: "Plan with confidence", copy: "Get help matching equipment to your team, infrastructure and goals." }, { icon: Settings2, title: "Get up and running", copy: "Discuss installation, configuration and integration with our engineers." }, { icon: Headphones, title: "Keep moving forward", copy: "Explore maintenance, troubleshooting and ongoing IT support." }].map(({ icon: Icon, title, copy }) => <div key={title}><Icon size={24} strokeWidth={1.4} /><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div></section>
        {related.length > 0 && <section className="related-section"><div className="section-caption"><div><p className="eyebrow">KEEP EXPLORING</p><h2>Also worth a look<span className="heading-dot">.</span></h2></div>{category && <Link className="text-link" href={categoryHref(category, categories)}>View category <ArrowUpRight size={16} /></Link>}</div><div className="product-grid related-grid">{related.map(p => <ProductCard p={cleanProduct(p)} key={p.wpId} />)}</div></section>}
      </div>
    </main>
    <SiteFooter />
  </>;
}
