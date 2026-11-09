"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, LoaderCircle } from "lucide-react";
import { offerExpired } from "@/lib/quotation";
import type { DashboardQuote } from "@/lib/dashboard-types";
import { QuotationSummary } from "./QuotationSummary";

export function CustomerQuotation({ quote }: { quote: DashboardQuote }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  if (!quote.offer) return null;
  const expired = offerExpired(quote.offer);
  const available = quote.offer.lines.some(line => line.quantity > 0);
  async function respond() {
    if (!confirm || pending) return;
    setPending(true); setError("");
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(quote.number)}/respond/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: confirm, offerId: quote.offer!.id }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not record your response.");
      setDone(confirm === "accepted" ? "Quotation accepted. Our team will arrange the next steps with you." : "Quotation declined. Our team has been updated.");
      setConfirm(null); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setPending(false); }
  }
  return <section className="customer-quotation" aria-label="Your private quotation">
    <QuotationSummary offer={quote.offer} items={quote.items} />
    {error && <p className="account-error" role="alert">{error}</p>}
    {done && <p className="account-notice" role="status">{done}</p>}
    {quote.status === "quoted" && !done && <div className="quotation-response">
      {expired ? <p>This quotation has expired. Please ask our team for an updated offer.</p> : confirm ? <div><p>{confirm === "accepted" ? "Accept this quotation and ask our sales team to arrange payment and delivery? This does not take a payment." : "Decline this quotation? Our sales team will see your decision."}</p><div className="sales-actions"><button className="workspace-button workspace-button-red" disabled={pending} onClick={respond}>{pending ? <LoaderCircle size={17} className="filter-spinner" /> : <Check size={17} />}Confirm {confirm === "accepted" ? "acceptance" : "decline"}</button><button className="workspace-button workspace-button-outline" disabled={pending} onClick={() => setConfirm(null)}>Go back</button></div></div> : <><div><strong>Ready for the next step?</strong><p>Accept to arrange payment and delivery with our team. No online payment is taken.</p></div><div className="sales-actions"><button className="workspace-button workspace-button-red" disabled={!available} onClick={() => setConfirm("accepted")}><Check size={16} />Accept quotation</button><button className="workspace-button workspace-button-outline" onClick={() => setConfirm("declined")}><X size={16} />Decline</button></div></>}
    </div>}
    {!!quote.activity?.length && <div className="quotation-timeline"><h4>Request journey</h4>{quote.activity.map((entry, i) => <div key={i}><span /><p>{entry.label}<small>{new Date(entry.at).toLocaleString("en-GB", { timeZone: "Africa/Nairobi" })}</small></p></div>)}</div>}
  </section>;
}
