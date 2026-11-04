"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Mail, MessageCircle, Phone, Plus, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { contact } from "@/data/company";
import { useCart } from "@/lib/cart";
import { ProductGallery } from "./ProductGallery";

export function ProductExperience({ product: p, summary, categoryLink }: { product: Product; summary: string; categoryLink?: string }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState("");
  const variant = p.variations?.find(v => String(v.wpId) === variantId);
  const stock = variant ? variant.stock?.status : p.stock?.status;
  const image = variant?.imageUrl || p.featuredImage?.url;
  const urls = [...new Set([image, p.featuredImage?.url, ...(p.gallery || []).map(g => g.url)].filter((url): url is string => !!url))];
  const configuration = variant ? Object.entries(variant.attributes).map(([key, val]) => `${key.replace(/-/g, " ")}: ${val || "Any"}`).join(", ") : "";
  const enquiry = `Hello MDT,\n\nI'd like a quotation for ${p.name}.\nModel / SKU: ${variant?.sku || p.sku || "Please confirm"}${configuration ? `\nConfiguration: ${configuration}` : ""}\nProduct: https://mdt.co.ke/product/${p.slug}/\n\nQuantity:\nCompany:\nAdditional requirements:\n`;
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(`Product enquiry: ${p.name}`)}&body=${encodeURIComponent(enquiry)}`;
  const addToQuote = () => add({ wpId: p.wpId, slug: p.slug, name: p.name, sku: variant?.sku || p.sku, image: p.featuredImage?.url, brand: p.attributes?.brand?.[0], configuration });
  return <div className="product-detail-grid">
    <ProductGallery key={image || p.slug} images={urls.map(url => ({ url, alt: p.name }))} productName={p.name} />
    <div className="product-detail-info">
      <div className="product-overline"><span className="eyebrow">{p.attributes?.brand?.join(" / ") || "THE MDT COLLECTION"}</span><span className={`availability ${stock === "instock" ? "available" : ""}`}><span />{stock === "instock" ? "In stock" : stock === "outofstock" ? "Currently unavailable" : "Confirm availability"}</span></div>
      <h1>{p.name}</h1>
      <p className="product-model">MODEL / SKU <span>{variant?.sku || p.sku || "Enquire for details"}</span></p>
      {summary && <div className="product-summary content-copy" dangerouslySetInnerHTML={{ __html: summary }} />}
      {p.variations && p.variations.length > 0 && <div className="configuration-picker">
        <label htmlFor="product-configuration">Choose a configuration <span>{p.variations.length} available</span></label>
        <select id="product-configuration" value={variantId} onChange={e => setVariantId(e.target.value)}>
          <option value="">Help me choose the right configuration</option>
          {p.variations.map(v => <option key={v.wpId} value={v.wpId}>{Object.values(v.attributes).map(val => val || "Any").join(" / ") || v.sku || `Configuration ${v.wpId}`}{v.stock?.status === "outofstock" ? " — unavailable" : ""}</option>)}
        </select>
      </div>}
      <div className="product-quote" aria-live="polite">
        <div className="quote-price"><strong>Let’s get you the right price.</strong><p>Tell us your quantity and requirements. We’ll prepare a quotation tailored to your business.</p></div>
        <button type="button" className="button button-red" onClick={addToQuote}><Plus size={18} /> Add to quote cart</button>
        <a href={mailto} className="button button-outline"><Mail size={17} /> Request a quotation</a>
        <a href={`${contact.whatsapp}?text=${encodeURIComponent(enquiry)}`} target="_blank" rel="noreferrer" className="button button-outline"><MessageCircle size={17} /> Discuss on WhatsApp</a>
        <span className="quote-note"><Mail size={13} /> You can also add items to your quote cart and send one request.</span>
      </div>
      <div className="product-reassurance"><ShieldCheck size={20} strokeWidth={1.5} /><div><strong>More than the box.</strong><p>Ask us about installation, configuration and ongoing support for your equipment.</p></div></div>
      <div className="product-quick-links"><a href={`tel:${contact.phoneIntl}`}><Phone size={14} /> {contact.phoneDisplay}</a>{categoryLink && <Link href={categoryLink}>Explore this category <ArrowUpRight size={14} /></Link>}</div>
      {variant && <p className="configuration-confirmation"><Check size={15} /> Your selected configuration is included in your enquiry.</p>}
    </div>
  </div>;
}
