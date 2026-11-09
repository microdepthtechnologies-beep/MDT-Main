"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, Inbox, Clock3, Send, PackageCheck } from "lucide-react";
import { quoteDate, quoteStages, type QuoteStage } from "@/lib/dashboard-types";
import { money, type SalesQuote } from "@/lib/quotation";
import { DashboardHeading, QuoteBadge } from "./DashboardUI";

export function SalesWorkspace({ quotes, email }: { quotes: SalesQuote[]; email: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [mine, setMine] = useState(false);
  const visible = quotes.filter(q => (status === "all" || q.status === status) && (!mine || q.assignedTo === email) && `${q.number} ${q.customerName} ${q.customerEmail} ${q.company} ${q.items.map(item => item.name).join(" ")}`.toLowerCase().includes(query.toLowerCase().trim()));
  const stats = [
    { label: "New requests", value: quotes.filter(q => q.status === "submitted").length, icon: Inbox, caption: "Ready for a personal response" },
    { label: "In preparation", value: quotes.filter(q => q.status === "reviewed").length, icon: Clock3, caption: "Availability, details and pricing" },
    { label: "Awaiting a decision", value: quotes.filter(q => q.status === "quoted").length, icon: Send, caption: "Quotations with your customers" },
    { label: "Ready to fulfil", value: quotes.filter(q => ["accepted", "processing"].includes(q.status)).length, icon: PackageCheck, caption: "Turn a yes into a delivery" },
  ];
  return <>
    <DashboardHeading eyebrow="MDT / SALES OPERATIONS" title="Good business starts here" description="Every request. Every detail. A clear next step." />
    <section className="sales-intro"><div><span className="workspace-eyebrow">FROM INTEREST TO POSSIBILITY</span><h2>Less back-and-forth.<br /><span>More moving forward.</span></h2><p>Confirm what’s available, prepare the right offer and keep your customers in the picture.</p></div><div className="sales-intro-mark" aria-hidden="true"><span>01 / REVIEW</span><span>02 / QUOTE</span><span>03 / DELIVER <ArrowUpRight size={22} /></span></div></section>
    <div className="sales-stats">{stats.map(({ label, value, icon: Icon, caption }) => <div className="workspace-stat" key={label}><div><span>{label}</span><Icon size={19} /></div><strong>{value}</strong><small>{caption}</small></div>)}</div>
    <section className="workspace-panel sales-inbox">
      <div className="workspace-panel-heading"><div><h2>Request desk</h2><p>Open a request to prepare its quotation.</p></div><span className="sales-count">{quotes.length} requests</span></div>
      <div className="sales-toolbar"><label className="sales-search"><Search size={18} /><span className="sr-only">Search requests</span><input type="search" placeholder="Search client, reference or product…" value={query} onChange={e => setQuery(e.target.value)} /></label><label><span className="sr-only">Filter by status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All stages</option>{Object.entries(quoteStages).map(([key, stage]) => <option key={key} value={key}>{stage.label}</option>)}</select></label><button className="sales-mine" aria-pressed={mine} onClick={() => setMine(!mine)}>Assigned to me</button></div>
      <div className="sales-table-head" aria-hidden="true"><span>CLIENT / REQUEST</span><span>PRODUCTS</span><span>STATUS</span><span>QUOTATION</span><span /></div>
      {visible.map(quote => <Link className="sales-request-row" href={`/sales/${encodeURIComponent(quote.number)}/`} key={quote.number}><div><strong>{quote.company || quote.customerName}</strong><span>{quote.number} · {quoteDate(quote.createdAt)}</span><small>{quote.assignedTo ? `Owner: ${quote.assignedTo}` : "Unassigned"}{quote.delivery?.state === "failed" ? " · Email needs attention" : ""}</small></div><div><strong>{quote.items.length} products</strong><span>{quote.items[0]?.name}{quote.items.length > 1 ? ` + ${quote.items.length - 1} more` : ""}</span></div><QuoteBadge status={(Object.hasOwn(quoteStages, quote.status) ? quote.status : "submitted") as QuoteStage} /><div className="sales-row-total">{quote.offer ? money(quote.offer.total) : "To prepare"}</div><ArrowUpRight size={18} /></Link>)}
      {!visible.length && <div className="workspace-empty"><Inbox size={32} strokeWidth={1.3} /><h3>{quotes.length ? "No requests match your search." : "Your next opportunity will appear here."}</h3><p>{quotes.length ? "Try another client, reference or stage." : "New customer requests arrive automatically in this workspace."}</p></div>}
    </section>
  </>;
}
