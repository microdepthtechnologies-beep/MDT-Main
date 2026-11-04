"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Grid2X2, List, LoaderCircle, Search, X } from "lucide-react";
import { clearedRefinements, sortOptions, type FilterChanges } from "@/lib/catalogue-filters";
import { BrowseLink, useBrowse } from "./CatalogueBrowser";
import { MobileFilters } from "./CatalogueFilters";

function CatalogueSearch() {
  const { base, filters, update, searchReset } = useBrowse();
  const [draft, setDraft] = useState({ source: filters.q, value: filters.q, reset: searchReset });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const composing = useRef(false);
  const replace = useRef(false);
  const id = useId();
  const value = draft.source === filters.q && draft.reset === searchReset ? draft.value : filters.q;
  function cancel() { clearTimeout(timer.current); }
  useEffect(() => {
    const cancelOnHistory = () => { cancel(); replace.current = false; setDraft({ source: "\0", value: "", reset: -1 }); };
    window.addEventListener("popstate", cancelOnHistory);
    return () => { cancel(); window.removeEventListener("popstate", cancelOnHistory); };
  }, []);
  useEffect(() => () => cancel(), [filters.q, searchReset]);
  function submit(query: string) {
    cancel();
    update({ q: query }, { replace: replace.current });
    replace.current = true;
  }
  function type(query: string) {
    setDraft({ source: filters.q, value: query, reset: searchReset });
    cancel();
    if (!composing.current) timer.current = setTimeout(() => submit(query), 400);
  }
  return <form className="catalogue-search enhanced-search" role="search" action={base} onSubmit={e => { e.preventDefault(); if (!composing.current) submit(value); }}>
    <Search size={19} /><label className="sr-only" htmlFor={id}>Search the collection</label>
    <input id={id} name="q" type="search" value={value} maxLength={160} placeholder="Product, brand or model number…" autoComplete="off" aria-controls="catalogue-product-results"
      onFocus={() => { replace.current = false; }} onChange={e => type(e.target.value)}
      onCompositionStart={() => { composing.current = true; cancel(); }}
      onCompositionEnd={e => { composing.current = false; type(e.currentTarget.value); }} />
    {value && <button type="button" className="clear-query" aria-label="Clear product search" onClick={() => submit("")}><X size={17} /></button>}
    <button className="search-submit" type="submit" aria-label="Search catalogue"><ArrowRight size={19} /></button>
  </form>;
}

function ActiveFilters() {
  const { filters, categories } = useBrowse();
  const chips: { key: string; label: string; changes: FilterChanges }[] = [
    ...(filters.q ? [{ key: "q", label: `Search: ${filters.q}`, changes: { q: "" } }] : []),
    ...(filters.category ? [{ key: "category", label: categories.find(c => c.slug === filters.category)?.name || filters.category, changes: { category: "" } }] : []),
    ...filters.brand.map(brand => ({ key: `brand-${brand}`, label: brand, changes: { brand: filters.brand.filter(b => b !== brand) } })),
    ...(filters.instock ? [{ key: "instock", label: "In stock", changes: { instock: false } }] : []),
    ...(filters.min ? [{ key: "min", label: `From KES ${Number(filters.min).toLocaleString()}`, changes: { min: "" } }] : []),
    ...(filters.max ? [{ key: "max", label: `Up to KES ${Number(filters.max).toLocaleString()}`, changes: { max: "" } }] : []),
  ];
  if (!chips.length) return null;
  return <div className="active-filters enhanced-active-filters" aria-label="Active filters">{chips.map(chip =>
    <BrowseLink key={chip.key} changes={chip.changes} aria-label={`Remove ${chip.label} filter`}>{chip.label}<X size={13} /></BrowseLink>
  )}<BrowseLink className="clear-filters" changes={clearedRefinements}>Clear all</BrowseLink></div>;
}

export function CatalogueTools() {
  const { filters, total, pending, update } = useBrowse();
  const id = useId();
  return <div className="catalogue-browse-tools" id="catalogue-tools">
    <CatalogueSearch />
    <div className="catalogue-toolbar">
      <p className="results-count" role="status" aria-live="polite" aria-atomic="true">{pending ? <><LoaderCircle className="filter-spinner" size={14} />Updating products…</> : total ? <>Showing <strong>{(filters.page - 1) * 24 + 1}–{Math.min(filters.page * 24, total)}</strong> of {total.toLocaleString()}</> : "No matching products"}</p>
      <MobileFilters />
      <div className="catalogue-sort"><label htmlFor={id}>Sort by</label><div><select id={id} value={filters.sort} onChange={e => update({ sort: e.target.value })}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={14} /></div></div>
      <div className="catalogue-view" aria-label="Product layout"><BrowseLink changes={{ view: "grid", page: filters.page }} aria-label="Grid view" aria-current={filters.view === "grid" ? "true" : undefined}><Grid2X2 size={16} /></BrowseLink><BrowseLink changes={{ view: "list", page: filters.page }} aria-label="List view" aria-current={filters.view === "list" ? "true" : undefined}><List size={18} /></BrowseLink></div>
    </div>
    <ActiveFilters />
    <div className="filter-progress" aria-hidden="true" />
  </div>;
}

export function CatalogueEmpty() {
  const { filters, locked } = useBrowse();
  return <div className="catalogue-empty"><Search size={32} strokeWidth={1} /><h3>Let’s try another search.</h3><p>{filters.q ? `We couldn’t find a match for “${filters.q}” with these filters.` : "No products match this combination."} Remove a filter above, try a broader category, or let our team help you source it.</p><BrowseLink className="button button-dark" changes={clearedRefinements}>Clear filters <X size={15} /></BrowseLink>{locked && <BrowseLink className="text-link" to="/shop/" changes={clearedRefinements}>Browse the full catalogue <ArrowRight size={15} /></BrowseLink>}<Link className="text-link" href="/#contact">Speak to the team <ArrowUpRight size={15} /></Link></div>;
}

export function CataloguePagination() {
  const { filters, pages } = useBrowse();
  const page = Math.min(filters.page, pages);
  if (pages <= 1) return null;
  const numbers = [...new Set([1, ...Array.from({ length: 5 }, (_, i) => page - 2 + i).filter(n => n > 1 && n < pages), pages])].sort((a, b) => a - b);
  return <nav className="catalogue-pagination" aria-label="Product pagination">
    <BrowseLink aria-label="Previous page" aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} changes={{ page: Math.max(1, page - 1) }} scrollToResults><ArrowLeft size={16} /></BrowseLink>
    <div>{numbers.map((n, i) => <span key={n}>{i > 0 && n - numbers[i - 1] > 1 && <span className="page-gap">…</span>}<BrowseLink aria-label={`Page ${n}`} aria-current={page === n ? "page" : undefined} changes={{ page: n }} scrollToResults>{n}</BrowseLink></span>)}</div>
    <BrowseLink aria-label="Next page" aria-disabled={page === pages} tabIndex={page === pages ? -1 : undefined} changes={{ page: Math.min(pages, page + 1) }} scrollToResults><ArrowRight size={16} /></BrowseLink>
  </nav>;
}
