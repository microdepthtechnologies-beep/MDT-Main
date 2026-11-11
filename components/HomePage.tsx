import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CircleCheck, Mail, MapPin, Phone, Store, Wrench } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import { contact } from "@/data/company";
import type { Brand, Testimonial } from "@/lib/brands";
import { organisationSchema, siteOrigin } from "@/lib/site-seo";
import { StructuredData } from "./StructuredData";
import { EnquiryForm } from "./EnquiryForm";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";
import { LineHeading, MarketingLayout, SectionHeading, sectionLabel } from "./MarketingLayout";
import { BrandsCarousel } from "./BrandsCarousel";
import { TestimonialsSection } from "./TestimonialsSection";

interface HomePageProps {
  content: typeof siteContent.home;
  brands: Brand[];
  testimonials: Testimonial[];
}

export function HomePage({ content: c, brands, testimonials }: HomePageProps) {
  return <MarketingLayout>
    <StructuredData value={organisationSchema} />
    <StructuredData value={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteOrigin}/#website`, url: siteOrigin, name: "Micro Depth Technologies", publisher: { "@id": `${siteOrigin}/#organization` } }} />
    <section id="top" className="hq-hero">
      <div className="site-width hq-hero-grid">
        <div className="hq-hero-copy">
          <p className="eyebrow"><span className="status-dot" />{c.hero.eyebrow}</p>
          <h1><LineHeading text={c.hero.title} /></h1>
          <p className="hq-hero-description">{c.hero.description}</p>
          <div className="hq-hero-actions">
            <Link href={c.hero.primaryHref} className="button button-red">{c.hero.primaryLabel}<ArrowUpRight size={18} /></Link>
          </div>
          <a className="hero-scroll" href="#approach"><span><ArrowDown size={17} /></span>How we work with you</a>
        </div>
        <div className="hq-hero-art">
          <div className="hq-hero-photo"><MediaImage src={c.hero.image} alt={c.hero.imageAlt} fill preload sizes="(max-width:800px) 90vw, 48vw" className="object-cover" /><span className="photo-overline">{c.hero.caption}</span></div>
          <div className="hero-orbit" aria-hidden="true"><span /></div>
          <div className="hero-note"><CircleCheck size={25} strokeWidth={1.4} aria-hidden="true" /><div><strong>{c.hero.noteTitle}</strong><span>{c.hero.noteText}</span></div></div>
        </div>
      </div>
      <div className="hq-hero-baseline site-width"><span>MICRO DEPTH TECHNOLOGIES</span><span>YOUR PARTNER IN TECHNOLOGY <span className="baseline-plus">+</span></span></div>
    </section>
    <BrandsCarousel brands={brands} />
    <section id="approach" className="site-width home-approach"><SectionHeading eyebrow={sectionLabel(1, c.approach.eyebrow)} title={c.approach.title} /><div className="approach-grid">{c.approach.steps.map((step, index) => <Reveal key={step.title}><span className="approach-number">0{index + 1}<ArrowRight size={21} /></span><h3>{step.title}</h3><p>{step.description}</p></Reveal>)}</div></section>
    <section className="site-width home-collections"><SectionHeading eyebrow={sectionLabel(2, c.collections.eyebrow)} title={c.collections.title} description={c.collections.description} /><div className="home-collection-grid">{c.collections.items.map(item => <Reveal key={item.href} className="collection-reveal"><Link href={item.href} className="home-collection"><MediaImage src={item.image} alt={item.imageAlt} fill sizes="(max-width:700px) 90vw, 33vw" className="object-cover" /><div><span className="eyebrow">{item.eyebrow}</span><h3><LineHeading text={item.title} /></h3><span className="collection-cta">{item.label}<ArrowUpRight size={20} /></span></div></Link></Reveal>)}</div></section>
    <section id="platforms" className="home-platforms"><div className="site-width"><SectionHeading eyebrow={sectionLabel(3, c.platforms.eyebrow)} title={c.platforms.title} description={c.platforms.description} /><div className="platform-grid">{c.platforms.items.map((item, index) => <Reveal key={item.href} className="platform-reveal"><a href={item.href} target="_blank" rel="noreferrer" className={`platform-card ${index === 0 ? "retail-platform" : "repairs-platform"}`}><div className="platform-card-top">{index === 0 ? <Store size={30} strokeWidth={1.4} /> : <Wrench size={30} strokeWidth={1.4} />}<span>0{index + 1} / {item.domain}</span><ArrowUpRight size={26} /></div><h3><LineHeading text={item.title} /></h3><p>{item.description}</p><span className="platform-link">{item.label}<ArrowRight size={18} /></span><span className="platform-watermark" aria-hidden="true">{index === 0 ? "retail." : "repair."}</span></a></Reveal>)}</div></div></section>
    <Reveal className="site-width home-about"><section id="about"><div className="section-index"><span>{sectionLabel(4, c.about.eyebrow)}</span><ArrowUpRight size={22} /></div><div className="home-about-grid"><h2><LineHeading text={c.about.title} /></h2><div><p className="large-copy">{c.about.lead}</p><p>{c.about.description}</p><Link href={c.about.linkHref} className="text-link">{c.about.linkLabel}<ArrowUpRight size={18} /></Link></div></div></section></Reveal>
    <TestimonialsSection testimonials={testimonials} eyebrow={sectionLabel(5, "WHAT CLIENTS SAY")} />
    <section id="contact" className="home-contact"><div className="site-width home-contact-grid"><div><p className="eyebrow">{sectionLabel(testimonials.length ? 6 : 5, c.contact.eyebrow)}</p><h2><LineHeading text={c.contact.title} /></h2><p>{c.contact.description}</p><div className="home-contact-links"><a href={`tel:${contact.phoneIntl}`}><Phone size={18} />{contact.phoneDisplay}</a><a href={`mailto:${contact.email}`}><Mail size={18} />{contact.email}</a><a href={contact.mapUrl} target="_blank" rel="noreferrer"><MapPin size={18} /><span>{contact.address}<br />{contact.addressLine2}</span></a></div><a href={contact.whatsapp} target="_blank" rel="noreferrer" className="contact-whatsapp">Chat with us on WhatsApp <ArrowUpRight size={16} /></a></div><EnquiryForm /></div></section>
  </MarketingLayout>;
}
