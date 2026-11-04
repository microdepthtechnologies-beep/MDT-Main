import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import { MarketingCTA, MarketingFAQs, MarketingHero, MarketingLayout, MarketingProcess, SectionHeading } from "./MarketingLayout";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

export function ServicesPage({ content: c }: { content: typeof siteContent.services }) {
  return <MarketingLayout breadcrumbs={[{ name: "Our services", path: "/our-services/" }]}>
    <MarketingHero data={c.hero} kind="services" />
    <nav className="site-width service-jump-links" aria-label="Explore our services">{c.items.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}<ArrowUpRight size={14} /></a>)}</nav>
    <section className="site-width service-collection"><SectionHeading {...c.intro} /><div className="service-grid">{c.items.map((item, index) => <Reveal className="service-card" key={item.id}><article id={item.id}><div className="service-card-image"><MediaImage src={item.image} alt={item.imageAlt} fill sizes="(max-width:700px) 90vw, 45vw" className="object-cover" /><span>0{index + 1} / MDT SERVICES</span></div><div className="service-card-copy"><h2>{item.title}</h2><p>{item.description}</p><ul>{item.bullets.map(bullet => <li key={bullet}><Check size={14} />{bullet}</li>)}</ul><Link href={item.href}>{item.label}<ArrowUpRight size={19} /></Link></div></article></Reveal>)}</div></section>
    <section className="services-engagement"><div className="site-width"><SectionHeading eyebrow={c.engagement.eyebrow} title={c.engagement.title} /><div className="services-engagement-grid">{c.engagement.items.map((item, index) => <div key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>
    <MarketingProcess data={c.process} />
    <MarketingFAQs data={c.faqs} />
    <MarketingCTA data={c.cta} />
  </MarketingLayout>;
}
