"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { type Product } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { MediaImage } from "./MediaImage";
import { ProductQuickView } from "./ProductQuickView";

function buildConfig(p: Product) {
  return p.type === "variable" ? "Choose configuration on product page" : undefined;
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const brand = p.attributes?.brand?.[0];
  const specs = Object.entries(p.attributes || {}).filter(([key]) => key !== "brand").slice(0, 2).map(([, v]) => v.join(" / ")).join(" · ");
  const config = buildConfig(p);
  return (
    <article className="product-card">
      <div className={`product-card-visual product-tone-${p.wpId % 3}`}>
        <Link className="product-card-image" href={`/product/${p.slug}/`} tabIndex={-1} aria-hidden="true">
          <MediaImage src={p.featuredImage?.url || ""} alt="" fill sizes="(max-width: 540px) 45vw, (max-width: 1000px) 29vw, 25vw" className="object-contain" />
        </Link>
        {p.type === "variable" && <span className="product-badge">Choose your configuration</span>}
        <ProductQuickView product={{ wpId: p.wpId, name: p.name, slug: p.slug, sku: p.sku, featuredImage: p.featuredImage, attributes: p.attributes, stock: p.stock }} />
      </div>
      <div className="product-card-body">
        <span className="card-brand">{brand || p.categories?.[0]?.name || "MDT catalogue"}</span>
        <h3><Link href={`/product/${p.slug}/`}>{p.name}</Link></h3>
        <p className="card-specs">{specs || (p.sku ? `Model ${p.sku}` : "Speak to us about specifications")}</p>
        <div className="card-bottom"><div><strong>Price on request</strong><p className={`availability ${p.stock?.status === "instock" ? "available" : ""}`}><span />{p.stock?.status === "instock" ? "In stock" : p.stock?.status === "outofstock" ? "Currently unavailable" : "Confirm availability"}</p></div><button type="button" className="card-arrow add-to-quote" aria-label={`Add ${p.name} to quote cart`} onClick={() => add({ wpId: p.wpId, slug: p.slug, name: p.name, sku: p.sku, image: p.featuredImage?.url, brand, configuration: config })}><Plus size={20} /></button></div>
      </div>
    </article>
  );
}
