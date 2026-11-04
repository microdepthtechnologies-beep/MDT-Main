"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useOptimistic, useRef, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import type { Category } from "@/lib/catalogue";
import { catalogueUrl, normaliseFilters, type CatalogueFacets, type CatalogueFilters, type FilterChanges } from "@/lib/catalogue-filters";

type BrowseData = {
  base: string; filters: CatalogueFilters; categories: Category[];
  facets: CatalogueFacets; locked?: string; total: number; pages: number;
};
type NavigationOptions = { base?: string; replace?: boolean; scroll?: boolean };
type BrowseContext = BrowseData & {
  pending: boolean;
  searchReset: number;
  update: (changes: FilterChanges | ((current: CatalogueFilters) => FilterChanges), options?: NavigationOptions) => void;
};
const Context = createContext<BrowseContext | null>(null);
export function useBrowse() {
  const value = useContext(Context);
  if (!value) throw new Error("Catalogue controls require CatalogueBrowser.");
  return value;
}
export function revealResults(focus = false) {
  if (focus) document.getElementById("catalogue-results-heading")?.focus({ preventScroll: true });
  document.getElementById("catalogue-tools")?.scrollIntoView({
    block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export function CatalogueBrowser({ children, ...data }: BrowseData & { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setOptimistic] = useOptimistic(data.filters);
  const [searchReset, setSearchReset] = useState(0);
  const latest = useRef(data.filters);
  const scrollAfter = useRef(false);
  useEffect(() => { latest.current = data.filters; }, [data.filters]);
  useEffect(() => {
    if (!pending && scrollAfter.current) { scrollAfter.current = false; revealResults(true); }
  }, [pending, data.filters]);

  const update: BrowseContext["update"] = (changes, options = {}) => {
    const current = latest.current;
    const patch = typeof changes === "function" ? changes(current) : changes;
    if (patch.q === "") setSearchReset(n => n + 1);
    const next = { ...current, page: 1, ...patch };
    const normalised = normaliseFilters(Object.fromEntries(Object.entries(next).map(([key, value]) =>
      [key, Array.isArray(value) ? value : typeof value === "boolean" ? (value ? "1" : "") : String(value)])));
    const destination = options.base || data.base;
    const href = catalogueUrl(destination, normalised, { page: normalised.page });
    if (destination === data.base && href === catalogueUrl(data.base, current, { page: current.page })) return;
    latest.current = normalised;
    scrollAfter.current = !!options.scroll;
    startTransition(() => {
      setOptimistic(normalised);
      router[options.replace ? "replace" : "push"](href, { scroll: false });
    });
  };
  return <Context.Provider value={{ ...data, filters, pending, update, searchReset }}>
    <div className="catalogue-browser" data-updating={pending || undefined}>{children}</div>
  </Context.Provider>;
}

export function BrowseLink({ changes = {}, to, scrollToResults, children, onClick, ...props }:
  Omit<ComponentProps<typeof Link>, "href"> & { changes?: FilterChanges; to?: string; scrollToResults?: boolean }) {
  const { base, filters, update } = useBrowse();
  return <Link {...props} href={catalogueUrl(to || base, filters, changes)} scroll={false} prefetch={false} onClick={e => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (props["aria-disabled"]) return;
    update(changes, { base: to, scroll: scrollToResults });
  }}>{children}</Link>;
}

export function CatalogueResults({ children }: { children: ReactNode }) {
  const { pending } = useBrowse();
  return <div id="catalogue-product-results" className="catalogue-product-results" aria-busy={pending} inert={pending} aria-label="Product results">{children}</div>;
}
