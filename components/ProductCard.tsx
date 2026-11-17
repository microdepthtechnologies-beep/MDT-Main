"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { type Product } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { MediaImage } from "./MediaImage";
import { ProductQuickView } from "./ProductQuickView";

function buildConfig(p: Product) {
  return p.type === "variable" ? "Help me choose the right configuration" : undefined;
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const brand = p.attributes?.brand?.[0];
  const specs = Object.entries(p.attributes || {}).filter(([key]) => key !== "brand").slice(0, 2).map(([, v]) => v.join(" / ")).join(" · ");
  const config = buildConfig(p);
  return (
    <article className="product-card">
      <div className={`product-card-visual product-tone-${p.wpId % 3}`}>
        <button type="button" className="product-card-image" aria-label={`View ${p.name}`} onClick={() => setQuickViewOpen(true)}>
          <MediaImage src={p.featuredImage?.url || ""} alt="" fill sizes="(max-width: 700px) 45vw, (max-width: 950px) 22vw, (max-width: 1180px) 18vw, 20vw" className="object-contain" />
        </button>
        {p.type === "variable" && <span className="product-badge">Choose your configuration</span>}
        <button className="quick-look" aria-label={`Quick look at ${p.name}`} onClick={() => setQuickViewOpen(true)}><Plus size={17} /><span>Quick look</span></button>
      </div>
      <div className="product-card-body">
        <span className="card-brand">{brand || p.categories?.[0]?.name || "MDT catalogue"}</span>
        <h3><button type="button" onClick={() => setQuickViewOpen(true)}>{p.name}</button></h3>
        <p className="card-specs">{specs || (p.sku ? `Model ${p.sku}` : "Speak to us about specifications")}</p>
        <div className="card-bottom"><div><strong>Price on request</strong><p className={`availability ${p.stock?.status === "instock" ? "available" : ""}`}><span />{p.stock?.status === "instock" ? "In stock" : p.stock?.status === "outofstock" ? "Currently unavailable" : "Confirm availability"}</p></div><button type="button" className="card-arrow add-to-quote" aria-label={`Add ${p.name} to quote cart`} onClick={() => add({ wpId: p.wpId, slug: p.slug, name: p.name, sku: p.sku, image: p.featuredImage?.url, brand, configuration: config })}><Plus size={20} /></button></div>
      </div>
      {quickViewOpen && <ProductQuickView slug={p.slug} onClose={() => setQuickViewOpen(false)} />}
    </article>
  );
}
