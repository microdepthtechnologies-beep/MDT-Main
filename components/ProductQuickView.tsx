"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Plus, X } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { MediaImage } from "./MediaImage";

export type QuickViewProduct = Pick<Product, "wpId" | "name" | "slug" | "sku" | "featuredImage" | "attributes" | "stock">;

export function ProductQuickView({ product: p }: { product: QuickViewProduct }) {
  const { add } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const brand = p.attributes?.brand?.[0];
  const addToQuote = () => {
    add({ wpId: p.wpId, slug: p.slug, name: p.name, sku: p.sku, image: p.featuredImage?.url, brand });
    dialog.current?.close();
  };
  return <>
    <button className="quick-look" aria-label={`Quick look at ${p.name}`} onClick={() => dialog.current?.showModal()}><Plus size={17} /><span>Quick look</span></button>
    <dialog className="quick-view-dialog" ref={dialog} aria-label={`Quick look: ${p.name}`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="dialog-heading"><span className="eyebrow">A CLOSER LOOK / MDT COLLECTION</span><button className="icon-button" aria-label="Close quick look" onClick={() => dialog.current?.close()}><X size={22} /></button></div>
      <div className="quick-view-content">
        <div className="quick-view-photo"><MediaImage src={p.featuredImage?.url || ""} alt={p.name} fill sizes="(max-width:700px) 85vw, 400px" className="object-contain" /></div>
        <div className="quick-view-copy"><p className="eyebrow">{p.attributes?.brand?.join(" / ") || "BUSINESS TECHNOLOGY"}</p><h2>{p.name}</h2><p className="product-model">MODEL / SKU <span>{p.sku || "Enquire for details"}</span></p>
          <dl>{Object.entries(p.attributes || {}).filter(([key]) => key !== "brand").slice(0, 5).map(([key, values]) => <div key={key}><dt>{key.replace(/-/g, " ")}</dt><dd>{values.join(" / ")}</dd></div>)}</dl>
          <div className="quick-view-price"><strong>Price on request</strong><span>{p.stock?.status === "instock" ? "In stock · confirm your requirements" : "Speak to us about availability"}</span></div>
          <div className="quick-view-actions"><Link href={`/product/${p.slug}/`} className="button button-red" onClick={() => dialog.current?.close()}>Explore this product <ArrowUpRight size={18} /></Link><button type="button" className="button button-dark" onClick={addToQuote}><Plus size={18} /> Add to quote</button></div>
          <p className="quick-view-note">View all images, specifications and configurations, or request a tailored quotation.</p>
        </div>
      </div>
    </dialog>
  </>;
}
