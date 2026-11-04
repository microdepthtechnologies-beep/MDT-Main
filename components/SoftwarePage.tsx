import Link from "next/link";
import { ArrowUpRight, Check, KeyRound, Layers, Plus } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import type { Product } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";
import { MarketingCTA, MarketingFAQs, MarketingHero, MarketingLayout, SectionHeading } from "./MarketingLayout";
import { Reveal } from "./Reveal";

export function SoftwarePage({ content: c, products, catalogueHref }: { content: typeof siteContent.software; products: Product[]; catalogueHref?: string }) {
  return <MarketingLayout breadcrumbs={[{ name: "Software & Licenses", path: "/software-licenses/" }]}>
    <MarketingHero data={c.hero} kind="software" />
    <section className="site-width software-intro" id="software-solutions"><SectionHeading {...c.intro} /><div className="software-solution-grid">{c.categories.map((item, index) => <Reveal key={item.id}><article><div><span>0{index + 1}</span><Plus size={20} /></div><h2>{item.title}</h2><p>{item.text}</p><ul>{item.bullets.map(bullet => <li key={bullet}><Check size={13} />{bullet}</li>)}</ul></article></Reveal>)}</div></section>
    <section className="software-products"><div className="site-width"><SectionHeading eyebrow={c.products.eyebrow} title={c.products.title} description={products.length ? c.products.description : undefined}>{catalogueHref && <Link href={catalogueHref} className="text-link">Browse software products <ArrowUpRight size={17} /></Link>}</SectionHeading>
      {products.length ? <div className="product-grid software-product-grid">{products.map(product => <ProductCard key={product.wpId} p={product} />)}</div> : <div className="software-product-enquiry"><div className="software-licence-art" aria-hidden="true"><KeyRound size={36} strokeWidth={1.3} /><span>YOUR SOFTWARE REQUIREMENTS</span><strong>The right licence.<br />For the way you work.</strong><div><span>Users</span><span>Devices</span><span>Renewals</span></div></div><div><span className="eyebrow">TAILORED TO YOUR REQUIREMENTS</span><h3>{c.products.emptyTitle}</h3><p>{c.products.emptyText}</p><Link href={c.products.emptyHref} className="button button-red">{c.products.emptyLabel}<ArrowUpRight size={18} /></Link></div></div>}
    </div></section>
    <section className="site-width software-checklist"><SectionHeading eyebrow={c.checklist.eyebrow} title={c.checklist.title} description={c.checklist.description} /><div>{c.checklist.items.map((item, index) => <div key={item.title}><span className="software-checklist-icon">{index === 0 ? <Layers size={24} strokeWidth={1.4} /> : index === 1 ? <KeyRound size={24} strokeWidth={1.4} /> : <Check size={24} strokeWidth={1.4} />}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></section>
    <MarketingFAQs data={c.faqs} /><MarketingCTA data={c.cta} />
  </MarketingLayout>;
}
