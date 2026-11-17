"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { ProductExperience } from "./ProductExperience";

export function ProductQuickView({ slug, autoOpen = false, onClose }: { slug: string; autoOpen?: boolean; onClose?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    dialog.current?.showModal();
    async function load() {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(slug)}/`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? "This product is no longer available." : "Could not load product details. Please try again.");
        setProduct(await response.json());
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load product details. Please try again.");
      }
    }
    void load();
    return () => { controller.abort(); };
  }, [slug]);

  function close() {
    if (autoOpen) {
      const url = new URL(window.location.href);
      url.searchParams.delete("product");
      window.history.replaceState(window.history.state, "", url);
    }
    onClose?.();
  }

  return <dialog className="quick-view-dialog" ref={dialog} aria-label={product ? `Quick look: ${product.name}` : "Product quick look"} onClose={close} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
    <div className="dialog-heading"><span className="eyebrow">A CLOSER LOOK / MDT COLLECTION</span><button className="icon-button" aria-label="Close quick look" onClick={() => dialog.current?.close()}><X size={22} /></button></div>
    {error ? <p className="quick-view-status" role="alert">{error}</p> : !product ? <p className="quick-view-status" role="status">Loading product details…</p> : <>
      <ProductExperience product={product} summary={product.shortDescription || ""} />
      {product.description && <section className="quick-view-details"><h2>Product details</h2><div className="content-copy" dangerouslySetInnerHTML={{ __html: product.description }} /></section>}
      <section className="quick-view-details"><h2>Specifications</h2><dl className="specification-table">{Object.entries(product.attributes || {}).map(([key, values]) => <div key={key}><dt>{key.replace(/-/g, " ")}</dt><dd>{values.join(" / ")}</dd></div>)}{product.sku && <div><dt>Model / SKU</dt><dd>{product.sku}</dd></div>}</dl></section>
    </>}
  </dialog>;
}
