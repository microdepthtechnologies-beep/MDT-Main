import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import { MarketingCTA, MarketingHero, MarketingLayout, SectionHeading, LineHeading } from "./MarketingLayout";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

export function AboutPage({ content: c }: { content: typeof siteContent.about }) {
  return <MarketingLayout breadcrumbs={[{ name: "About us", path: "/about/" }]}>
    <MarketingHero data={c.hero} kind="about" />
    <section className="site-width about-story"><SectionHeading eyebrow={c.story.eyebrow} title={c.story.title} /><div className="about-story-grid"><p className="about-story-lead">{c.story.lead}</p><div>{c.story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div></section>
    <section className="about-purpose"><div className="site-width"><div><p className="eyebrow">THE MDT WAY</p><h2><LineHeading text={c.purpose.title} /></h2><span className="about-purpose-mark" aria-hidden="true">m<span>+</span></span></div><div>{c.purpose.items.map((item, index) => <Reveal key={item.title} className="about-purpose-item"><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}</div></div></section>
    <section className="site-width about-values"><SectionHeading eyebrow={c.values.eyebrow} title={c.values.title} /><div className="about-values-grid">{c.values.items.map((item, index) => <Reveal key={item.title}><div><span>0{index + 1}</span><Plus size={20} /></div><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}</div></section>
    <section className="site-width about-expertise"><div className="about-expertise-photo"><MediaImage src={c.expertise.image} alt={c.expertise.imageAlt} fill sizes="(max-width:800px) 90vw, 45vw" className="object-cover" /></div><div><p className="eyebrow">{c.expertise.eyebrow}</p><h2><LineHeading text={c.expertise.title} /></h2><p>{c.expertise.description}</p><ul>{c.expertise.disciplines.map(item => <li key={item}><span />{item}</li>)}</ul><Link className="text-link" href="/our-services/">Explore our services <ArrowUpRight size={18} /></Link></div></section>
    <section className="site-width about-sectors"><SectionHeading eyebrow={c.sectors.eyebrow} title={c.sectors.title} /><div>{c.sectors.items.map((item, index) => <div key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></section>
    <MarketingCTA data={c.cta} />
  </MarketingLayout>;
}
