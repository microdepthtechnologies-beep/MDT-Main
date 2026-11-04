import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "lucide-react";
import { quoteStages, type QuoteStage } from "@/lib/dashboard-types";
import type { ReactNode } from "react";

export function DashboardHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="workspace-heading"><div><p className="workspace-eyebrow">{eyebrow}</p><h1>{title}<span>.</span></h1><p>{description}</p></div>{action}</div>;
}

export function QuoteBadge({ status }: { status: QuoteStage }) {
  return <span className={`workspace-status workspace-status-${status}`}><span />{quoteStages[status].label}</span>;
}

export function NewQuoteLink() {
  return <Link className="workspace-button workspace-button-red" href="/shop/"><Plus size={17} /> Start a quote</Link>;
}

export function QuotesEmpty() {
  return <div className="workspace-empty"><div className="workspace-empty-icon"><FileText size={28} strokeWidth={1.3} /></div><h3>Your next project starts with a conversation.</h3><p>Find the products you need, add them to your quote cart and send us your requirements. Your requests will appear here.</p><Link href="/shop/" className="workspace-button workspace-button-dark">Explore the catalogue <ArrowUpRight size={16} /></Link><span>No online payment. Just the right advice.</span></div>;
}
