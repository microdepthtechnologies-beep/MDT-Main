export type SearchValues = Record<string, string | string[] | undefined>;
export const sortOptions = [
  ["recommended", "Recommended"], ["newest", "Newest arrivals"], ["name", "Name: A–Z"],
  ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"],
] as const;
export function normaliseFilters(raw: SearchValues) {
  const single = (key: string) => typeof raw[key] === "string" ? (raw[key] as string).trim().slice(0, 160) : "";
  const price = (key: string) => {
    const value = single(key);
    return value && Number.isFinite(Number(value)) && Number(value) >= 0 ? String(Number(value)) : "";
  };
  let min = price("min"), max = price("max");
  if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
  return {
    q: single("q"), category: single("category"),
    brand: [...new Set((Array.isArray(raw.brand) ? raw.brand : [raw.brand || ""])
      .map(value => value.trim().slice(0, 160)).filter(Boolean))].slice(0, 20).sort(),
    min, max,
    instock: single("instock") === "1",
    view: single("view") === "list" ? "list" : "grid",
    sort: sortOptions.some(([value]) => value === single("sort")) ? single("sort") : "recommended",
    page: Math.max(1, Math.min(100000, Math.floor(Number(single("page"))) || 1)),
  };
}
export type CatalogueFilters = ReturnType<typeof normaliseFilters>;
export type FilterChanges = Partial<CatalogueFilters>;
export type CatalogueFacets = {
  brands: { name: string; count: number }[];
  categories: Record<string, number>;
  categoryTotal: number;
  stock: { available: number; total: number };
  price: { min: number | null; max: number | null; priced: number; total: number };
};
export const clearedRefinements: FilterChanges = { q: "", category: "", brand: [], min: "", max: "", instock: false };
export function refinementCount(filters: CatalogueFilters) {
  return Number(!!filters.category) + filters.brand.length + Number(filters.instock) + Number(!!(filters.min || filters.max));
}
export function catalogueUrl(base: string, filters: CatalogueFilters, changes: FilterChanges = {}) {
  const values = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of [...new Set(value)].sort()) params.append(key, item);
      continue;
    }
    if (value === "" || value === false || (key === "page" && value === 1) || (key === "sort" && value === "recommended") || (key === "view" && value === "grid")) continue;
    params.set(key, value === true ? "1" : String(value));
  }
  return `${base}${params.size ? `?${params}` : ""}`;
}
