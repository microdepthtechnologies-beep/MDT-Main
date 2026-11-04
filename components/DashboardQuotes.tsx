"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, FileText, Search, SlidersHorizontal, X } from "lucide-react";
import { contact } from "@/data/company";
import { quoteDate, quoteStages, quoteUnits, type DashboardQuote } from "@/lib/dashboard-types";
import { DashboardHeading, NewQuoteLink, QuoteBadge, QuotesEmpty } from "./DashboardUI";

const filters = [
  { value: "all", label: "All requests" }, { value: "active", label: "In progress" },
  { value: "quoted", label: "Quoted" }, { value: "closed", label: "Closed" },
];
export function DashboardQuotes({ quotes, initialQuery = "", initialStatus = "all" }: { quotes: DashboardQuote[]; initialQuery?: string; initialStatus?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(filters.some(f => f.value === initialStatus) ? initialStatus : "all");
  const matchesStatus = (quote: DashboardQuote, value: string) => value === "all" || (value === "active" ? quote.status === "submitted" || quote.status === "reviewed" : quote.status === value);
  const visible = quotes.filter(q => matchesStatus(q, status) && `${q.number} ${q.items.map(i => `${i.name} ${i.sku}`).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <DashboardHeading eyebrow="YOUR REQUESTS, AT A GLANCE" title="My quotes" description="Follow your requests, revisit the details and keep the conversation going." action={<NewQuoteLink />} />
    <section className="workspace-panel workspace-quotes-panel" aria-label="Quote requests">
      <div className="workspace-quote-toolbar"><div className="workspace-filter-buttons" aria-label="Filter quotes by status">{filters.map(filter => <button key={filter.value} type="button" aria-pressed={filter.value === status} onClick={() => setStatus(filter.value)}>{filter.label}<span>{quotes.filter(q => matchesStatus(q, filter.value)).length}</span></button>)}</div><label className="workspace-quote-search"><Search size={17} /><span className="sr-only">Search quote reference, product or SKU</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your requests…" type="search" /></label></div>
      {quotes.length === 0 ? <QuotesEmpty /> : <>
        <div className="workspace-quote-columns" aria-hidden="true"><span>REQUEST / PRODUCTS</span><span>SUBMITTED</span><span>STATUS</span><span /></div>
        <p className="workspace-results" role="status">{visible.length} {visible.length === 1 ? "request" : "requests"}{query.trim() ? ` matching “${query.trim()}”` : ""}</p>
        {visible.length === 0 ? <div className="workspace-empty"><SlidersHorizontal size={28} strokeWidth={1.4} /><h3>No matching requests.</h3><p>Try a different reference, product name or status.</p><button type="button" className="workspace-button workspace-button-outline" onClick={() => { setQuery(""); setStatus("all"); }}><X size={16} /> Clear filters</button></div> : <div className="workspace-quote-list">
          {visible.map(quote => <details className="workspace-quote" key={quote.number} open={query.trim() === quote.number}>
            <summary><div className="workspace-quote-name"><span className="workspace-document-icon"><FileText size={20} strokeWidth={1.5} /></span><div><strong>{quote.number}</strong><span>{quote.items.length} {quote.items.length === 1 ? "product" : "products"} · {quoteUnits(quote)} {quoteUnits(quote) === 1 ? "unit" : "units"}</span></div></div><time dateTime={quote.createdAt || undefined}>{quoteDate(quote.createdAt)}</time><QuoteBadge status={quote.status} /><ChevronDown size={18} className="workspace-quote-chevron" /></summary>
            <div className="workspace-quote-detail">
              <div className="workspace-quote-update"><QuoteBadge status={quote.status} /><p>{quoteStages[quote.status].description}</p><small>Updated {quoteDate(quote.updatedAt)}</small></div>
              <div className="workspace-request-products"><h3>Requested products</h3>{quote.items.map((item, index) => <div className="workspace-request-product" key={`${item.slug}-${index}`}><span className="workspace-product-number">{String(index + 1).padStart(2, "0")}</span><div>{item.slug ? <Link href={`/product/${encodeURIComponent(item.slug)}/`}>{item.name} <ArrowUpRight size={13} /></Link> : <strong>{item.name}</strong>}{item.sku && <small>SKU: {item.sku}</small>}{item.configuration && <p>{item.configuration}</p>}</div><span>Qty <strong>{item.quantity}</strong></span></div>)}</div>
              {(quote.message || quote.company || quote.phone) && <div className="workspace-request-notes"><h3>Your request details</h3>{quote.message && <p>{quote.message}</p>}{(quote.company || quote.phone) && <span>{[quote.company, quote.phone].filter(Boolean).join(" · ")}</span>}</div>}
              <div className="workspace-request-bottom"><span>Quotations are shared directly by our sales team.</span><a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Question about quote ${quote.number}`)}`} className="workspace-text-link">Ask about this request <ArrowUpRight size={15} /></a></div>
            </div>
          </details>)}
        </div>}
      </>}
    </section>
    <div className="workspace-quote-help"><FileText size={19} strokeWidth={1.5} /><p>Your dashboard tracks quote requests. For order or delivery updates, <a href={`mailto:${contact.email}`}>contact our team</a> with your quote reference.</p></div>
  </>;
}
