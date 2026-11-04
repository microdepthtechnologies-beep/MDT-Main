"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { MediaImage } from "./MediaImage";

export function QuoteCartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="quote-cart-button" aria-label="Quote cart" aria-haspopup="dialog" onClick={() => setOpen(true)}><ShoppingCart size={20} />{count > 0 && <span className="quote-cart-count">{count}</span>}</button>
    {open && <QuoteCartDialog onClose={() => setOpen(false)} />}
  </>;
}

function QuoteCartDialog({ onClose }: { onClose: () => void }) {
  const { items, count, update, remove, clear } = useCart();
  return <div className="quote-cart-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="quote-cart-dialog" role="dialog" aria-label="Your quote cart">
      <div className="quote-cart-top"><h2>Your quote request <span>{count} {count === 1 ? "item" : "items"}</span></h2><button type="button" aria-label="Close quote cart" onClick={onClose}><X size={22} /></button></div>
      {items.length === 0 ? <div className="quote-cart-empty"><ShoppingCart size={40} /><p>Your quote cart is empty.</p><Link href="/shop/" className="button button-red" onClick={onClose}>Browse products <ArrowUpRight size={16} /></Link></div> : <>
        <div className="quote-cart-items">
          {items.map(item => <div key={item.wpId} className="quote-cart-item">
            <div className="quote-cart-thumb"><MediaImage src={item.image || ""} alt="" width={64} height={64} className="object-contain" /></div>
            <div className="quote-cart-info"><Link href={`/product/${item.slug}/`} onClick={onClose}>{item.name}</Link><span>{item.brand}{item.sku && ` · Model ${item.sku}`}{item.configuration && ` · ${item.configuration}`}</span></div>
            <div className="quote-cart-qty"><button type="button" aria-label="Decrease quantity" onClick={() => update(item.wpId, item.quantity - 1)}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => update(item.wpId, item.quantity + 1)}><Plus size={14} /></button></div>
            <button type="button" className="quote-cart-remove" aria-label="Remove item" onClick={() => remove(item.wpId)}><Trash2 size={16} /></button>
          </div>)}
        </div>
        <div className="quote-cart-actions"><button type="button" className="text-link" onClick={clear}>Clear all</button><Link href="/quote/checkout/" className="button button-red" onClick={onClose}>Review & send request <ArrowUpRight size={18} /></Link></div>
      </>}
    </div>
  </div>;
}
