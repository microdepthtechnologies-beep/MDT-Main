import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { servicePages } from "@/data/service-pages";
import { MarketingCTA, MarketingHero, MarketingLayout, SectionHeading } from "./MarketingLayout";
import { StructuredData } from "./StructuredData";
import { siteOrigin } from "@/lib/site-seo";

export function ServiceDetail({ content: c }: { content: (typeof servicePages)[string] }) {
  return <MarketingLayout breadcrumbs={[{ name: "Our services", path: "/our-services/" }, { name: c.title, path: c.path }]}>
    <StructuredData value={{ "@context": "https://schema.org", "@type": "Service", name: c.title, description: c.description, url: `${siteOrigin}${c.path}`, provider: { "@type": "Organization", name: "Micro Depth Technologies", url: siteOrigin }, areaServed: { "@type": "Country", name: "Kenya" } }} />
    <MarketingHero kind="detail" data={{ eyebrow: "MDT / SOLUTIONS & SERVICES", title: c.title, description: c.description, image: c.image, imageAlt: c.imageAlt, note: "CONSIDERED IN DEPTH.", primaryLabel: "Discuss your requirements", primaryHref: `/contact/?interest=${encodeURIComponent(c.title)}` }} />
    <section className="site-width service-detail-intro"><SectionHeading eyebrow="BUILT AROUND YOUR REQUIREMENTS" title="The right fit.\nFrom the beginning." /><div>{c.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></section>
    <section className="site-width service-detail-capabilities"><h2>How we can help.</h2><div className="about-values-grid">{c.capabilities.map((item, index) => <div key={item.title}><div><span>0{index + 1}</span><ArrowUpRight size={20} /></div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div><Link href={c.catalogueHref} className="text-link">Explore related products & support <ArrowUpRight size={18} /></Link></section>
    <MarketingCTA data={{ eyebrow: "YOUR NEXT STEP", title: "Let’s work out\nthe details.", description: "Tell us about your equipment, environment and priorities. We’ll help define the scope and prepare a quotation.", label: "Start a conversation", href: `/contact/?interest=${encodeURIComponent(c.title)}` }} />
  </MarketingLayout>;
}
