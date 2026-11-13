"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { clearedRefinements, refinementCount } from "@/lib/catalogue-filters";
import { BrowseLink, revealResults, useBrowse } from "./CatalogueBrowser";

function BrandChoices() {
  const { filters, facets, update } = useBrowse();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const matches = facets.brands.filter(b => b.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const visible = expanded || query ? matches : matches.filter((b, i) => i < 7 || filters.brand.includes(b.name));
  return <>
    <p className="facet-hint">Choose one or more brands.</p>
    {(facets.brands.length > 5 || query) && <div className="facet-search"><Search size={15} /><label className="sr-only" htmlFor={id}>Find a brand</label><input id={id} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a brand…" autoComplete="off" />{query && <button type="button" aria-label="Clear brand search" onClick={() => setQuery("")}><X size={14} /></button>}</div>}
    <div className="facet-option-list brand-option-list">
      {visible.map(brand => <label className="brand-choice" key={brand.name}>
        <input type="checkbox" aria-label={brand.name} checked={filters.brand.includes(brand.name)} onChange={() => update(current => ({ brand: current.brand.includes(brand.name) ? current.brand.filter(b => b !== brand.name) : [...current.brand, brand.name] }))} />
        <span>{brand.name}</span><span className="facet-count" aria-hidden="true">{brand.count.toLocaleString()}</span>
      </label>)}
    </div>
    {!matches.length && <p className="facet-hint">{query ? "No brands match that name." : "No brands match your current filters. Try removing a filter."}</p>}
    {!query && matches.length > 7 && <button type="button" className="facet-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Show fewer brands" : `Show all ${matches.length} brands`}<ChevronDown size={13} /></button>}
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
    <details className="facet-group" open><summary><span>Brands {filters.brand.length > 0 && <b>{filters.brand.length}</b>}</span><ChevronDown size={15} /></summary><BrandChoices /></details>
    <details className="facet-group" open={!!(filters.min || filters.max)}><summary><span>{facets.price.priced || filters.min || filters.max ? <>Price range <small>KES</small></> : <>Pricing <small>On request</small></>}</span><ChevronDown size={15} /></summary><PriceRange key={`${filters.min}:${filters.max}`} /></details>
    <div className="stock-refinement"><label className="stock-switch"><span><strong>In stock only</strong><small>{facets.stock.available.toLocaleString()} available under these filters</small></span><input type="checkbox" role="switch" aria-label="In stock only" checked={filters.instock} onChange={e => update({ instock: e.target.checked })} /></label></div>
  </div>;
}

export function CatalogueFiltersPanel() {
  const { filters, searchReset } = useBrowse();
  return <aside className="catalogue-sidebar enhanced-sidebar" aria-label="Product filters">
    <div className="filter-title"><div><SlidersHorizontal size={16} /><h2>Refine your search</h2></div>{(refinementCount(filters) > 0 || filters.q) && <BrowseLink className="facet-reset" changes={clearedRefinements}>Reset filters</BrowseLink>}</div>
    <p className="filter-intro">Find the right fit. Results update as you choose.</p>
    <FilterSections key={searchReset} />
    <div className="filter-assistance"><span>Need a second opinion?</span><Link href="/#contact">Ask an MDT expert <ArrowUpRight size={14} /></Link></div>
  </aside>;
}

export function MobileFilters() {
  const { filters, pending, total, searchReset } = useBrowse();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  useEffect(() => {
    const media = matchMedia("(min-width: 951px)");
    const closeOnDesktop = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  const count = refinementCount(filters);
  return <>
    <button className="button mobile-filter-button" aria-label="Filters" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><SlidersHorizontal size={16} />Filters{count > 0 && <span className="filter-count">{count}</span>}</button>
    <dialog ref={dialog} className="filter-dialog enhanced-filter-dialog" aria-labelledby={title} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="filter-dialog-shell">
        <div className="filter-dialog-top"><div><span className="eyebrow">MAKE IT YOUR COLLECTION</span><h2 id={title}>Find your right fit<span>.</span></h2><p>Results update as you choose.</p></div><button className="icon-button" aria-label="Close filters" onClick={() => dialog.current?.close()}><X size={23} /></button></div>
        <div className="filter-dialog-scroll">
          {(count > 0 || filters.q) && <div className="mobile-refinement-summary"><span>{count} {count === 1 ? "filter" : "filters"} selected</span><BrowseLink changes={clearedRefinements} className="facet-reset">Reset filters</BrowseLink></div>}
          <FilterSections key={searchReset} />
        </div>
        <div className="filter-dialog-bottom"><p role="status">{pending ? "Finding your products…" : `${total.toLocaleString()} matching ${total === 1 ? "product" : "products"}`}</p><button className="button button-red" disabled={pending} onClick={() => { dialog.current?.close(); revealResults(true); }}>{pending ? <><LoaderCircle className="filter-spinner" size={17} /> Updating results</> : <>Show {total.toLocaleString()} {total === 1 ? "product" : "products"} <ArrowRight size={17} /></>}</button></div>
      </div>
    </dialog>
  </>;
}
