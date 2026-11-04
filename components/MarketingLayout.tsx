import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";
import { StructuredData } from "./StructuredData";
import { breadcrumbSchema } from "@/lib/site-seo";

export function MarketingLayout({ children, breadcrumbs = [] }: { children: ReactNode; breadcrumbs?: { name: string; path: string }[] }) {
  return <><SiteHeader /><main className="marketing-main">{breadcrumbs.length > 0 && <><StructuredData value={breadcrumbSchema([{ name: "Home", path: "/" }, ...breadcrumbs])} /><nav className="site-width marketing-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link>{breadcrumbs.map((item, index) => <span key={item.path}><span>/</span>{index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</span>)}</nav></>}{children}</main><SiteFooter /></>;
}

export function LineHeading({ text }: { text: string }) {
  return <>{text.split("\n").map((line, index, lines) => <span key={index}>{line}{index < lines.length - 1 && <br />}</span>)}</>;
}

export type MarketingHeroData = { eyebrow: string; title: string; description: string; image: string; imageAlt: string; note: string; primaryLabel: string; primaryHref: string };
export function MarketingHero({ data, kind }: { data: MarketingHeroData; kind: "about" | "services" | "software" | "detail" }) {
  return <section className={`site-width marketing-hero marketing-hero-${kind}`}>
    <div className="marketing-hero-copy"><p className="eyebrow"><span className="red-dash" />{data.eyebrow}</p><h1><LineHeading text={data.title} /></h1><p>{data.description}</p><Link href={data.primaryHref} className="button button-red">{data.primaryLabel}<ArrowUpRight size={18} /></Link><div className="marketing-hero-foot"><span>MICRO DEPTH TECHNOLOGIES</span><span>NAIROBI, KE</span></div></div>
    <div className="marketing-hero-visual"><div className="marketing-hero-photo"><MediaImage src={data.image} alt={data.imageAlt} fill preload sizes="(max-width:800px) 92vw, 48vw" className="object-cover" /></div><div className="marketing-hero-stamp"><span>{data.note}</span><ArrowUpRight size={27} strokeWidth={1.4} /></div><span className="marketing-photo-corner" aria-hidden="true">+</span></div>
  </section>;
}

export function SectionHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="marketing-section-heading"><div><p className="eyebrow">{eyebrow}</p><h2><LineHeading text={title} /></h2></div><div>{description && <p>{description}</p>}{children}</div></div>;
}

export type CtaData = { eyebrow: string; title: string; description: string; label: string; href: string };
export function MarketingCTA({ data }: { data: CtaData }) {
  return <section className="site-width marketing-cta"><Reveal className="marketing-cta-inner"><div><p className="eyebrow">{data.eyebrow}</p><h2><LineHeading text={data.title} /></h2></div><div><p>{data.description}</p><Link href={data.href} className="button button-red">{data.label}<ArrowUpRight size={18} /></Link></div><span aria-hidden="true" className="marketing-cta-mark">+</span></Reveal></section>;
}

export function MarketingFAQs({ data }: { data: { title: string; items: { question: string; answer: string }[] } }) {
  return <section className="site-width marketing-faqs"><div><p className="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</p><h2>{data.title}</h2><p>Need something more specific?<br /><Link href="/contact/">Our team is here to help <ArrowUpRight size={14} /></Link></p></div><div>{data.items.map(item => <details key={item.question}><summary>{item.question}<ChevronDown size={19} /></summary><p>{item.answer}</p></details>)}</div></section>;
}

export function MarketingProcess({ data }: { data: { eyebrow: string; title: string; steps: { title: string; description: string }[] } }) {
  return <section id="approach" className="site-width marketing-process"><SectionHeading eyebrow={data.eyebrow} title={data.title} /><div>{data.steps.map((step, index) => <div key={step.title}><span>0{index + 1}<ArrowUpRight size={19} /></span><h3>{step.title}</h3><p>{step.description}</p></div>)}</div></section>;
}
