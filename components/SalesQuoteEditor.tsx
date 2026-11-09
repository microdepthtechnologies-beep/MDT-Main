"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Save, Send, LoaderCircle, UserRoundCheck, X, Check, FileText } from "lucide-react";
import { availabilityLabels, blankQuotation, money, quotationTotals, validateQuotation, type Quotation, type SalesQuote, type Availability } from "@/lib/quotation";
import { quoteDate, type QuoteStage } from "@/lib/dashboard-types";
import { QuoteBadge } from "./DashboardUI";
import { QuotationSummary } from "./QuotationSummary";

export function SalesQuoteEditor({ quote }: { quote: SalesQuote }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Quotation>(quote.draft || quote.offer || blankQuotation(quote.items));
  const [internalNote, setInternalNote] = useState(quote.internalNote);
  const [base, setBase] = useState(quote.revision);
  const [seen, setSeen] = useState(quote.revision);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const preview = useRef<HTMLDialogElement>(null);
  if (seen !== quote.revision && !pending) {
    setSeen(quote.revision);
    if (!dirty) {
      setDraft(quote.draft || quote.offer || blankQuotation(quote.items));
      setInternalNote(quote.internalNote); setBase(quote.revision);
    }
  }
  const stale = dirty && base !== quote.revision;
  const editable = ["submitted", "reviewed", "quoted"].includes(quote.status);
  const busy = pending || quote.delivery?.state === "sending";
  const totals = quotationTotals(draft);
  const update = (value: Partial<Quotation>) => { setDraft({ ...draft, ...value }); setDirty(true); setNotice(""); };
  function updateLine(index: number, value: Partial<Quotation["lines"][number]>) {
    update({ lines: draft.lines.map((line, i) => i === index ? { ...line, ...value } : line) });
  }
  function reload() {
    setDraft(quote.draft || quote.offer || blankQuotation(quote.items));
    setInternalNote(quote.internalNote); setBase(quote.revision); setDirty(false); setError(""); setNotice("");
  }
  async function act(action: string, status?: string) {
    if (pending) return;
    setPending(true); setError(""); setNotice("");
    try {
      const res = await fetch(`/api/sales/quotes/${encodeURIComponent(quote.number)}/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, revision: base, draft, internalNote, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not update this request.");
      const updated: SalesQuote = result.quote;
      setDraft(updated.draft || updated.offer || blankQuotation(updated.items));
      setInternalNote(updated.internalNote); setBase(updated.revision); setDirty(false);
      setNotice(result.emailFailed ? "Quotation published to the customer’s account. Email delivery failed — use Retry email below." : action === "send" ? "Quotation published and emailed to the customer." : "Request updated.");
      preview.current?.close(); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setPending(false); }
  }
  function openPreview() {
    try { validateQuotation(draft, quote.items, true); setError(""); setPreviewOpen(true); preview.current?.showModal(); }
    catch (error) { setError(error instanceof Error ? error.message : "Check your quotation."); }
  }
  const nextStages: Record<string, { value: string; label: string }[]> = {
    submitted: [{ value: "reviewed", label: "Start review" }, { value: "closed", label: "Close request" }],
    reviewed: [{ value: "closed", label: "Close request" }],
    quoted: [{ value: "closed", label: "Close request" }],
    accepted: [{ value: "processing", label: "Start fulfilment" }, { value: "closed", label: "Close request" }],
    processing: [{ value: "fulfilled", label: "Mark fulfilled" }, { value: "closed", label: "Close request" }],
    declined: [{ value: "closed", label: "Close request" }],
  };
  return <>
    <Link href="/sales/" className="sales-back"><ArrowLeft size={16} />All requests</Link>
    <div className="sales-detail-heading"><div><p className="workspace-eyebrow">REQUEST / {quote.number}</p><h1>{quote.company || quote.customerName}<span>.</span></h1><p>Received {quoteDate(quote.createdAt)} · {quote.items.length} requested products</p></div><QuoteBadge status={quote.status as QuoteStage} /></div>
    {stale && <div className="sales-conflict" role="alert">This request has changed while you were editing. Your inputs are still here; reload the latest version before continuing.<button onClick={reload}>Discard my edits & load latest</button></div>}
    {notice && <p className="account-notice" role="status">{notice}</p>}
    {error && !previewOpen && <p className="account-error" role="alert">{error}</p>}
    <div className="sales-editor-layout">
      <div className="sales-editor-main">
        <section className="workspace-panel sales-products">
          <div className="workspace-panel-heading"><div><span className="workspace-eyebrow">01 / AVAILABILITY & PRICING</span><h2>Build the right offer.</h2><p>Unit prices exclude tax. Include only the quantity you can supply.</p></div><FileText size={25} strokeWidth={1.3} /></div>
          <fieldset disabled={!editable || busy || stale}>
            {quote.items.map((item, index) => {
              const line = draft.lines[index];
              return <div className="sales-product" key={index}>
                <div className="sales-product-heading"><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.name}</h3><p>{item.sku ? `SKU ${item.sku} · ` : ""}{item.quantity} requested{item.configuration ? ` · ${item.configuration}` : ""}</p></div>{item.slug && <Link href={`/product/${encodeURIComponent(item.slug)}/`} target="_blank" aria-label={`Open ${item.name}`}><ArrowUpRight size={18} /></Link>}</div>
                <div className="sales-line-inputs">
                  <label>Availability<select value={line.availability} onChange={e => { const availability = e.target.value as Availability; updateLine(index, { availability, quantity: availability === "unavailable" ? 0 : line.quantity || item.quantity }); }}>{Object.entries(availabilityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label>Quantity<input type="number" min={line.availability === "unavailable" ? 0 : 1} max={item.quantity} step="1" disabled={line.availability === "unavailable"} value={line.quantity} onChange={e => updateLine(index, { quantity: Number(e.target.value) })} /></label>
                  <label>Unit price · KES<input type="number" min="0" max="10000000" step="0.01" disabled={line.availability === "unavailable"} value={line.unitPrice / 100} onChange={e => updateLine(index, { unitPrice: Math.round(Number(e.target.value) * 100) })} /></label>
                  <div className="sales-line-amount"><span>Line total</span><strong>{money(line.availability === "unavailable" ? 0 : line.quantity * line.unitPrice)}</strong></div>
                </div>
                <label className="sales-line-note">Product note <span>Shared with customer</span><input placeholder="Warranty, alternative specification, availability detail…" maxLength={500} value={line.note} onChange={e => updateLine(index, { note: e.target.value })} /></label>
              </div>;
            })}
          </fieldset>
        </section>
        <section className="workspace-panel sales-terms">
          <div className="workspace-panel-heading"><div><span className="workspace-eyebrow">02 / THE FINER DETAILS</span><h2>Set clear expectations.</h2></div></div>
          <fieldset disabled={!editable || busy || stale} className="sales-terms-fields">
            <div className="sales-field-grid"><label>Valid through<input type="date" value={draft.validUntil} onChange={e => update({ validUntil: e.target.value })} /></label><label>Tax rate · %<input type="number" min="0" max="100" step="0.01" value={draft.taxRate} onChange={e => update({ taxRate: Number(e.target.value) })} /></label><label>Delivery charge · KES<input type="number" min="0" max="1000000" step="0.01" value={draft.deliveryFee / 100} onChange={e => update({ deliveryFee: Math.round(Number(e.target.value) * 100) })} /></label></div>
            <p className="sales-field-help">Tax is applied to products plus delivery. Set the rate explicitly for this quotation.</p>
            <label>Expected delivery / lead time<input value={draft.leadTime} maxLength={500} placeholder="For example: 3–5 working days after order confirmation" onChange={e => update({ leadTime: e.target.value })} /></label>
            <label>Payment & quotation terms<textarea rows={3} value={draft.terms} maxLength={2000} placeholder="Payment arrangements, warranty and any conditions…" onChange={e => update({ terms: e.target.value })} /></label>
            <label>Message to your customer<textarea rows={3} value={draft.note} maxLength={2000} placeholder="A personal note to go with this quotation…" onChange={e => update({ note: e.target.value })} /></label>
            <label>Internal team notes <span>Visible only to sales</span><textarea rows={3} value={internalNote} maxLength={4000} placeholder="Supplier checks, follow-ups and internal context…" onChange={e => { setInternalNote(e.target.value); setDirty(true); }} /></label>
          </fieldset>
        </section>
        {quote.offer && <details className="workspace-panel sales-issued"><summary>View the last issued quotation <span>{quote.offer.issuedAt.slice(0, 10)}</span></summary><QuotationSummary offer={quote.offer} items={quote.items} /></details>}
      </div>
      <aside className="sales-editor-side">
        <section className="sales-total-card"><span className="workspace-eyebrow">QUOTATION SUMMARY</span><h2>{money(totals.total)}</h2><span>Prepared in Kenyan shillings</span><dl><div><dt>Products</dt><dd>{money(totals.subtotal)}</dd></div><div><dt>Delivery</dt><dd>{money(draft.deliveryFee)}</dd></div><div><dt>Tax ({draft.taxRate}%)</dt><dd>{money(totals.tax)}</dd></div></dl>
          {editable && <div className="sales-summary-actions"><button className="workspace-button workspace-button-red" disabled={busy || stale} onClick={openPreview}><Send size={16} />Preview & send</button><button className="workspace-button workspace-button-outline" disabled={busy || stale} onClick={() => act("save")}>{pending ? <LoaderCircle size={16} className="filter-spinner" /> : <Save size={16} />}Save draft</button></div>}
          <p>{dirty ? "You have unsaved changes." : "Only issued quotations are visible to the customer."}</p>
        </section>
        <section className="workspace-panel sales-client"><span className="workspace-eyebrow">THE PERSON BEHIND THE REQUEST</span><h3>{quote.customerName}</h3><a href={`mailto:${quote.customerEmail}`}>{quote.customerEmail}</a>{quote.phone && <a href={`tel:${quote.phone}`}>{quote.phone}</a>}{quote.message && <div><h4>Customer requirements</h4><p>{quote.message}</p></div>}<div><h4>Request owner</h4><p>{quote.assignedTo || "Unassigned"}</p>{!quote.assignedTo && <button className="workspace-button workspace-button-outline" disabled={busy || dirty} onClick={() => act("claim")}><UserRoundCheck size={16} />Assign to me</button>}</div>
          {quote.delivery && <div><h4>Quotation email</h4><p>{quote.delivery.state === "sent" ? "Sent to the customer" : quote.delivery.state === "failed" ? "Delivery failed. The quotation is available in the customer’s account." : "Sending quotation…"}</p>{quote.delivery.state === "failed" && <button className="workspace-button workspace-button-outline" disabled={pending || dirty} onClick={() => act("retry-email")}>Retry email</button>}</div>}
          {quote.canRecoverEmail && <div><p>This send appears interrupted. Check whether the customer received the message before retrying to avoid a duplicate email.</p><button className="workspace-button workspace-button-outline" disabled={pending} onClick={() => act("recover-email")}>Release interrupted send</button></div>}
        </section>
        {!!nextStages[quote.status]?.length && <section className="workspace-panel sales-client"><h3>Next step</h3><p>Keep the customer’s dashboard up to date.</p><div className="sales-status-actions">{nextStages[quote.status].map(stage => <button key={stage.value} className={`workspace-button ${stage.value === "closed" ? "workspace-button-outline" : "workspace-button-dark"}`} disabled={busy || dirty} onClick={() => act("status", stage.value)}>{stage.label}<ArrowUpRight size={15} /></button>)}</div></section>}
        <section className="workspace-panel sales-client quotation-timeline"><h3>Activity</h3>{quote.activity.length ? quote.activity.slice().reverse().map((entry, index) => <div key={index}><span /><p>{entry.label}<small>{entry.by} · {quoteDate(entry.at)}</small></p></div>) : <p>Request received {quoteDate(quote.createdAt)}.</p>}</section>
      </aside>
    </div>
    {editable && <div className="sales-mobile-actions"><button className="workspace-button workspace-button-outline" disabled={busy || stale} onClick={() => act("save")}><Save size={16} />Save draft</button><button className="workspace-button workspace-button-red" disabled={busy || stale} onClick={openPreview}><Send size={16} />Preview & send</button></div>}
    <dialog ref={preview} className="sales-preview" aria-labelledby="preview-title" onClose={() => setPreviewOpen(false)} onCancel={e => { if (pending) e.preventDefault(); }}>
      <header><div><p className="workspace-eyebrow">03 / READY TO SHARE</p><h2 id="preview-title">Review your quotation.</h2><p>To {quote.customerName} · {quote.customerEmail}</p></div><button aria-label="Close quotation preview" disabled={pending} onClick={() => preview.current?.close()}><X size={22} /></button></header>
      <QuotationSummary offer={{ ...draft, ...totals, id: "preview", issuedAt: "" }} items={quote.items} />
      {error && <p className="account-error" role="alert">{error}</p>}
      <footer><p>This publishes the quotation in the customer’s account and sends it by email.</p><button className="workspace-button workspace-button-red" disabled={pending || stale} onClick={() => act("send")}>{pending ? <LoaderCircle size={17} className="filter-spinner" /> : <Check size={17} />}Send quotation</button></footer>
    </dialog>
  </>;
}
