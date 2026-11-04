import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/data/company";
import { getSiteContent } from "@/lib/site-content";
import { pageMetadata } from "@/lib/site-seo";
import { MarketingLayout, LineHeading } from "@/components/MarketingLayout";
import { EnquiryForm } from "@/components/EnquiryForm";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("contact");
  return pageMetadata(c.seo.title, c.seo.description, "/contact/");
}
export default async function Page({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const [c, search] = await Promise.all([getSiteContent("contact"), searchParams]);
  return <MarketingLayout breadcrumbs={[{ name: "Contact", path: "/contact/" }]}>
    <section className="site-width contact-page-intro"><p className="eyebrow"><span className="red-dash" />{c.eyebrow}</p><h1><LineHeading text={c.title} /></h1><p>{c.description}</p></section>
    <section className="site-width contact-page-grid"><div className="contact-page-details"><p className="eyebrow">PEOPLE YOU CAN TALK TO.</p><h2>A direct connection.</h2><a href={`tel:${contact.phoneIntl}`}><Phone size={22} /><span><small>CALL OUR TEAM</small>{contact.phoneDisplay}</span><ArrowUpRight size={18} /></a><a href={`mailto:${contact.email}`}><Mail size={22} /><span><small>WRITE TO US</small>{contact.email}</span><ArrowUpRight size={18} /></a><a href={contact.whatsapp} target="_blank" rel="noreferrer"><span className="contact-page-chat">W</span><span><small>START A CHAT</small>Find us on WhatsApp</span><ArrowUpRight size={18} /></a><div className="contact-page-office"><MapPin size={24} /><h3>{c.officeTitle}</h3><p>{contact.address}<br />{contact.addressLine2}</p><p>{c.officeText}</p><a href={contact.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={16} /></a></div></div><EnquiryForm initialInterest={typeof search.interest === "string" ? search.interest.slice(0, 120) : ""} /></section>
  </MarketingLayout>;
}
