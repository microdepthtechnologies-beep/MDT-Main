import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCheck, Clock3, FileText, Headphones, Layers, Plus, UserRound } from "lucide-react";
import { contact } from "@/data/company";
import { quoteDate, type DashboardAccount, type DashboardQuote } from "@/lib/dashboard-types";
import { DashboardHeading, NewQuoteLink, QuoteBadge, QuotesEmpty } from "./DashboardUI";

export function DashboardOverview({ account, quotes }: { account: DashboardAccount; quotes: DashboardQuote[] }) {
  const active = quotes.filter(q => q.status === "submitted" || q.status === "reviewed").length;
  const quoted = quotes.filter(q => q.status === "quoted").length;
  const stats = [
    { title: "Total requests", value: quotes.length, caption: "Your requests, all in one place", icon: FileText, href: "/dashboard/quotes/" },
    { title: "Awaiting a quotation", value: active, caption: "Submitted or being reviewed", icon: Clock3, href: "/dashboard/quotes/?status=active" },
    { title: "Quoted", value: quoted, caption: "Details shared directly with you", icon: CheckCheck, href: "/dashboard/quotes/?status=quoted" },
  ];
  return <>
    <DashboardHeading eyebrow="YOUR MDT WORKSPACE" title={`Hello, ${account.name.trim().split(/\s+/)[0]}`} description="Your technology plans, your requests and your people. Right here." action={<NewQuoteLink />} />
    <div className="workspace-welcome">
      <div><span className="workspace-eyebrow"><span /> LET’S BUILD WHAT’S NEXT</span><h2>The right technology.<br /><span>A little closer.</span></h2><p>From a single device to your next business project, we’ll help you find the right fit.</p><Link href="/shop/">Find your next solution <ArrowRight size={17} /></Link></div>
      <div className="workspace-welcome-art" aria-hidden="true"><div className="workspace-art-orbit" /><div className="workspace-art-card"><Layers size={30} strokeWidth={1.2} /><span>YOUR NEXT PROJECT</span><strong>Made possible<br />with MDT<span>.</span></strong><div><span>Explore</span><span>Connect</span><span>Create</span></div></div><span className="workspace-art-plus"><Plus size={25} strokeWidth={1.4} /></span></div>
    </div>
    <div className="workspace-stats">{stats.map(({ title, value, caption, icon: Icon, href }) => <Link href={href} key={title} className="workspace-stat"><div><span>{title}</span><Icon size={19} strokeWidth={1.5} /></div><strong>{value.toLocaleString()}</strong><div><small>{caption}</small><ArrowUpRight size={16} /></div></Link>)}</div>
    <div className="workspace-overview-grid">
      <section className="workspace-panel">
        <div className="workspace-panel-heading"><div><h2>Recent requests</h2><p>A clear view of where things stand.</p></div><Link href="/dashboard/quotes/" className="workspace-text-link">View all <ArrowUpRight size={15} /></Link></div>
        {quotes.length ? <div className="workspace-recent-list">{quotes.slice(0, 4).map(quote => <Link className="workspace-recent" key={quote.number} href={`/dashboard/quotes/?q=${encodeURIComponent(quote.number)}`}><span className="workspace-document-icon"><FileText size={20} strokeWidth={1.5} /></span><div><strong>{quote.number}</strong><span>{quote.items[0]?.name || "Product request"}{quote.items.length > 1 ? ` + ${quote.items.length - 1} more` : ""}</span><small>{quoteDate(quote.createdAt)}</small></div><QuoteBadge status={quote.status} /><ArrowUpRight size={16} /></Link>)}</div> : <QuotesEmpty />}
      </section>
      <div className="workspace-overview-side">
        <section className="workspace-panel workspace-contact-card"><span className="workspace-small-icon"><Headphones size={23} strokeWidth={1.5} /></span><p className="workspace-eyebrow">A HUMAN CONNECTION</p><h2>Let’s talk about<br />your next move.</h2><p>Need help with specifications, availability or a quote? Talk directly to our team.</p><a className="workspace-text-link" href={`mailto:${contact.email}`}>Contact sales <ArrowUpRight size={16} /></a></section>
        <Link href="/dashboard/profile/" className="workspace-profile-shortcut"><UserRound size={21} strokeWidth={1.5} /><div><strong>Make it personal</strong><span>Keep your contact details up to date.</span></div><ArrowUpRight size={17} /></Link>
      </div>
    </div>
    <section className="workspace-process" aria-label="How quotations work"><div><span>01</span><h3>Choose your technology</h3><p>Add products and configurations to your quote cart.</p></div><div><span>02</span><h3>Tell us what you need</h3><p>Send your requirements, quantities and project details.</p></div><div><span>03</span><h3>We’ll take it from there</h3><p>Our team confirms availability and shares your quotation.</p></div></section>
  </>;
}
