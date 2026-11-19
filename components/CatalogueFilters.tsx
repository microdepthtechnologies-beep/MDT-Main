"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Layers, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { clearedRefinements, refinementCount } from "@/lib/catalogue-filters";
import type { Category } from "@/lib/catalogue";
import { BrowseLink, revealResults, useBrowse } from "./CatalogueBrowser";

function CategoryChoices() {
  const { categories, facets, filters, locked } = useBrowse();
  const [query, setQuery] = useState("");
  const id = useId();
  const bySlug = new Map(categories.map(c => [c.slug, c]));
  const chainOf = (cat: Category) => {
    const chain: Category[] = [];
    const seen = new Set<number>();
    let current: Category | undefined = cat;
    while (current && !seen.has(current.wpTermId)) {
      seen.add(current.wpTermId); chain.unshift(current);
      current = categories.find(c => c.wpTermId === current?.parentWpTermId);
    }
    return chain;
  };
  const hrefOf = (cat: Category) => `/product-category/${chainOf(cat).map(c => c.slug).join("/")}/`;
  const count = (slug: string) => facets.categories[slug] ?? 0;
  // The nav covers the first three levels; the filter carries the rest, and
  // after any category is chosen it drills into that branch's deeper levels.
  const node = (filters.category && bySlug.get(filters.category)) || (locked && bySlug.get(locked)) || undefined;
  const options = (node
    ? categories.filter(c => c.parentWpTermId === node.wpTermId)
    : categories.filter(c => chainOf(c).length > 3)
  ).filter(c => count(c.slug) > 0).sort((a, b) => a.name.localeCompare(b.name));
  const term = query.trim().toLocaleLowerCase();
  const shown = term ? options.filter(c => c.name.toLocaleLowerCase().includes(term)) : options;
  const trail = node ? chainOf(node) : [];
  return <div className="category-navigator">
    {node ? <>
      <div className="filter-category-trail" aria-label="Category path">
        <span><BrowseLink to="/shop/" changes={{ category: "" }}>All hardware</BrowseLink></span>
        {trail.map((step, index) => <span key={step.slug}><ChevronRight size={11} aria-hidden="true" /><BrowseLink to={hrefOf(step)} changes={{ category: "" }} aria-current={index === trail.length - 1 ? "page" : undefined}>{step.name}</BrowseLink></span>)}
      </div>
      <div className="category-current"><Layers size={14} /><span>{node.name}</span><span>{count(node.slug).toLocaleString()} products</span></div>
    </> : <p className="facet-hint">Categories deeper than the menu live here — pick one to focus the results.</p>}
    {options.length > 6 && <div className="facet-search"><Search size={15} /><label className="sr-only" htmlFor={id}>Find a category</label><input id={id} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a category…" autoComplete="off" />{query && <button type="button" aria-label="Clear category search" onClick={() => setQuery("")}><X size={14} /></button>}</div>}
    {shown.length > 0 && <div className="facet-option-list category-option-list">
      {shown.map(c => <BrowseLink key={c.slug} className="category-choice" to={hrefOf(c)} changes={{ category: "" }}>
        <span><strong>{c.name}</strong>{!node && <small>{chainOf(c).slice(1, -1).map(parent => parent.name).join(" / ")}</small>}</span>
        <span className="facet-count" aria-hidden="true">{count(c.slug).toLocaleString()}</span>
      </BrowseLink>)}
    </div>}
    {!shown.length && <p className="facet-hint">{term ? "No categories match that name." : node ? "You’re browsing the deepest category here." : "No categories match your current filters."}</p>}
  </div>;
}

function BrandChoices() {
  const { filters, facets, update } = useBrowse();
  const [query, setQuery] = useState("");
  const id = useId();
  const term = query.trim().toLocaleLowerCase();
  const matches = term ? facets.brands.filter(b => b.name.toLocaleLowerCase().includes(term)) : [];
  const selected = facets.brands.filter(b => filters.brand.includes(b.name));
  const chosen = filters.brand.filter(name => !selected.some(b => b.name === name)).map(name => ({ name, count: 0 }));
  const list = term ? matches : [...selected, ...chosen];
  const toggle = (name: string) => update(current => ({ brand: current.brand.includes(name) ? current.brand.filter(b => b !== name) : [...current.brand, name] }));
  return <>
    {facets.brands.length > 0 && <p className="facet-hint">{facets.brands.length.toLocaleString()} {facets.brands.length === 1 ? "brand" : "brands"} available — search and select.</p>}
    <div className="facet-search"><Search size={15} /><label className="sr-only" htmlFor={id}>Find a brand</label><input id={id} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a brand…" autoComplete="off" />{query && <button type="button" aria-label="Clear brand search" onClick={() => setQuery("")}><X size={14} /></button>}</div>
    {list.length > 0 && <div className="facet-option-list brand-option-list">
      {list.map(brand => <label className="brand-choice" key={brand.name}>
        <input type="checkbox" aria-label={brand.name} checked={filters.brand.includes(brand.name)} onChange={() => toggle(brand.name)} />
        <span>{brand.name}</span><span className="facet-count" aria-hidden="true">{brand.count.toLocaleString()}</span>
      </label>)}
    </div>}
    {term && !matches.length && <p className="facet-hint">No brands match that name.</p>}
    {!facets.brands.length && <p className="facet-hint">No brands match your current filters. Try removing a filter.</p>}
  </>;
}

function PriceRange() {
  const { filters, facets, update } = useBrowse();
  const [min, setMin] = useState(filters.min);
  const [max, setMax] = useState(filters.max);
  const [error, setError] = useState("");
  const id = useId();
  const presets = [
    ["Up to 25k", "", "25000"], ["25k – 50k", "25000", "50000"],
    ["50k – 100k", "50000", "100000"], ["100k+", "100000", ""],
  ];
  if (!facets.price.priced && !filters.min && !filters.max) return <div className="quotation-pricing">
    <p>These products are priced by quotation. Tell us your quantity and requirements for a price tailored to your business.</p>
    <Link href="/#contact">Request pricing <ArrowUpRight size={14} /></Link>
  </div>;
  return <form className="price-refinement" onSubmit={e => {
    e.preventDefault();
    if (min && max && Number(min) > Number(max)) { setError("Minimum price must be less than or equal to maximum price."); return; }
    setError("");
    update({ min, max });
  }}>
    <div className="price-inputs">
      <label htmlFor={`${id}-min`}><span>Minimum (KES)</span><input id={`${id}-min`} type="number" inputMode="decimal" min="0" step="any" placeholder="0" value={min} onChange={e => { setMin(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} /></label>
      <span>–</span>
      <label htmlFor={`${id}-max`}><span>Maximum (KES)</span><input id={`${id}-max`} type="number" inputMode="decimal" min="0" step="any" placeholder="Any" value={max} onChange={e => { setMax(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} /></label>
    </div>
    {error && <p id={`${id}-error`} className="facet-error" role="alert">{error}</p>}
    <button className="price-apply" type="submit">Set price range <ArrowRight size={14} /></button>
    <div className="price-presets" aria-label="Quick price ranges">{presets.map(([label, low, high]) =>
      <BrowseLink key={label} changes={{ min: low, max: high }} aria-current={filters.min === low && filters.max === high ? "true" : undefined}>{label}</BrowseLink>)}</div>
    <p className="facet-hint">{facets.price.priced.toLocaleString()} of {facets.price.total.toLocaleString()} products have listed prices. Price filters exclude items quoted on request.</p>
    {(filters.min || filters.max) && <BrowseLink className="facet-more" changes={{ min: "", max: "" }}>Include all prices <X size={12} /></BrowseLink>}
  </form>;
}

function FilterSections() {
  const { filters, facets, update } = useBrowse();
  return <div className="filter-sections">
    <details className="facet-group" open><summary><span>Category {filters.category && <b>1</b>}</span><ChevronDown size={15} /></summary><CategoryChoices /></details>
    <details className="facet-group" open><summary><span>Brands {filters.brand.length > 0 && <b>{filters.brand.length}</b>}</span><ChevronDown size={15} /></summary><BrandChoices /></details>
    <details className="facet-group" open={!!(filters.min || filters.max)}><summary><span>{facets.price.priced || filters.min || filters.max ? <>Price range <small>KES</small></> : <>Pricing <small>On request</small></>}</span><ChevronDown size={15} /></summary><PriceRange key={`${filters.min}:${filters.max}`} /></details>
    <div className="stock-refinement"><label className="stock-switch"><span><strong>In stock only</strong><small>{facets.stock.available.toLocaleString()} available under these filters</small></span><input type="checkbox" role="switch" aria-label="In stock only" checked={filters.instock} onChange={e => update({ instock: e.target.checked })} /></label></div>
  </div>;
}

export function CatalogueFilters() {
  const { filters, pending, total, searchReset } = useBrowse();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const count = refinementCount(filters);
  return <>
    <button className="button mobile-filter-button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><SlidersHorizontal size={16} />Refine your search{count > 0 && <span className="filter-count">{count}</span>}</button>
    <dialog ref={dialog} className="filter-dialog enhanced-filter-dialog" aria-labelledby={title} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="filter-dialog-shell">
        <div className="filter-dialog-top"><div><h2 id={title}>Refine your search</h2><p>Results update as you choose.</p></div><button className="icon-button" aria-label="Close filters" onClick={() => dialog.current?.close()}><X size={23} /></button></div>
        <div className="filter-dialog-scroll">
          {(count > 0 || filters.q) && <div className="mobile-refinement-summary"><span>{count} {count === 1 ? "filter" : "filters"} selected</span><BrowseLink changes={clearedRefinements} className="facet-reset">Reset filters</BrowseLink></div>}
          <FilterSections key={searchReset} />
        </div>
        <div className="filter-dialog-bottom"><p role="status">{pending ? "Finding your products…" : `${total.toLocaleString()} matching ${total === 1 ? "product" : "products"}`}</p><button className="button button-red" disabled={pending} onClick={() => { dialog.current?.close(); revealResults(true); }}>{pending ? <><LoaderCircle className="filter-spinner" size={17} /> Updating results</> : <>Show {total.toLocaleString()} {total === 1 ? "product" : "products"} <ArrowRight size={17} /></>}</button></div>
      </div>
    </dialog>
  </>;
}
