"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, LoaderCircle, Mail, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { MediaImage } from "./MediaImage";

export function QuoteCheckoutClient({ user }: { user: { name?: string | null; email?: string | null } }) {
  const { items, count, update, remove, clear } = useCart();
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (items.length === 0) return;
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/quotes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, company, phone, message }),
    });
    const data = await res.json();
    if (res.ok) {
      setNumber(data.number);
      setStatus("done");
      clear();
    } else {
      setError(data.error || "Could not submit your quote request.");
      setStatus("idle");
    }
  }

  if (status === "done") return <div className="quote-success">
    <div className="quote-success-mark"><Mail size={40} /></div>
    <h2>Your request has been sent.</h2>
    <p>Quote reference <strong>#{number}</strong> has been emailed to {user.email}. Our sales team will confirm availability and pricing and reply shortly.</p>
    <Link href="/dashboard/quotes/" className="button button-red">View your quotes <ArrowUpRight size={18} /></Link>
    <Link href="/shop/" className="text-link">Continue browsing</Link>
  </div>;

  if (items.length === 0) return <div className="quote-empty">
    <h2>Your quote cart is empty.</h2>
    <p>Add products to build a quote request.</p>
    <Link href="/shop/" className="button button-red">Browse products <ArrowUpRight size={18} /></Link>
  </div>;

  return <>
    <div className="quote-checkout-grid">
      <div className="quote-items-panel">
        <h2>{count} {count === 1 ? "item" : "items"} in your request</h2>
        <div className="quote-items">
          {items.map(item => <div key={item.wpId} className="quote-item">
            <div className="quote-item-thumb"><MediaImage src={item.image || ""} alt="" width={80} height={80} className="object-contain" /></div>
            <div className="quote-item-info"><Link href={`/product/${item.slug}/`}>{item.name}</Link><span>{item.brand}{item.sku && ` · Model ${item.sku}`}{item.configuration && ` · ${item.configuration}`}</span></div>
            <div className="quote-item-qty"><button type="button" onClick={() => update(item.wpId, item.quantity - 1)}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => update(item.wpId, item.quantity + 1)}><Plus size={14} /></button></div>
            <button type="button" className="quote-item-remove" aria-label="Remove" onClick={() => remove(item.wpId)}><Trash2 size={18} /></button>
          </div>)}
        </div>
      </div>
      <div className="quote-form-panel">
        <h2>Send your request</h2>
        <p className="quote-form-intro">Logged in as <strong>{user.name || user.email}</strong>.<br/>Add your project details and we’ll prepare your tailored quotation.</p>
        <label><span>Company</span><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company name" /></label>
        <label><span>Phone</span><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact number" /></label>
        <label><span>Requirements <small>optional</small></span><textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Quantity, timeline, delivery location, special requirements…" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="button" className="button button-red" disabled={status === "submitting"} onClick={submit}>{status === "submitting" ? <><LoaderCircle size={17} className="filter-spinner" /> Sending…</> : <>Send quote request <ArrowUpRight size={18} /></>}</button>
        <p className="quote-privacy-note">Prices are confirmed by our sales team and sent directly to you. They are never displayed on the website.</p>
      </div>
    </div>
  </>;
}
