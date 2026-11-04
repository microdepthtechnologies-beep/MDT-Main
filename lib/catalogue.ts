import { cache } from "react";
import { decode } from "he";
import type { Filter, Sort } from "mongodb";
import { getDb } from "./mongodb";
import { normaliseFilters, type CatalogueFacets, type SearchValues } from "./catalogue-filters";

export type Category = {
  wpTermId: number; parentWpTermId: number; name: string; slug: string; count: number;
  description?: string; seo?: { title?: string; metaDescription?: string };
};
export type ProductImage = { url: string; alt?: string; wpId?: number };
export type Variation = {
  wpId: number; sku?: string; attributes: Record<string, string>;
  price?: { current?: number | null }; stock?: { status?: string }; imageUrl?: string;
};
export type Product = {
  wpId: number; name: string; slug: string; sku?: string; status: string; type?: string;
  description?: string; shortDescription?: string; createdAt?: string;
  featuredImage?: ProductImage; gallery?: ProductImage[];
  price?: { current?: number | null; regular?: number | null; sale?: number | null };
  stock?: { status?: string }; categories?: { id: number; name: string; slug: string }[];
  attributes?: Record<string, string[]>; variations?: Variation[];
  seo?: { title?: string; metaDescription?: string; canonical?: string; noindex?: boolean };
};

export const text = (value?: string) => decode((value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
export const mediaUrl = (value?: string) => value?.replace(/^https?:\/\/(?:www\.)?mdt\.co\.ke(?=\/wp-content\/uploads\/)/, "") || "";
export const money = (value?: number | null) => value == null ? null : `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

export function cleanProduct(doc: Product): Product {
  // Select public fields explicitly: never pass MongoDB ObjectIds to the browser.
  return {
    wpId: doc.wpId, name: text(doc.name), slug: doc.slug, sku: doc.sku, status: doc.status,
    type: doc.type, stock: doc.stock, createdAt: doc.createdAt,
    description: doc.description, shortDescription: doc.shortDescription, seo: doc.seo,
    categories: doc.categories?.map(c => ({ ...c, name: text(c.name) })),
    attributes: Object.fromEntries(Object.entries(doc.attributes || {}).map(([key, values]) => [key, values.map(text)])),
    featuredImage: doc.featuredImage?.url ? { url: mediaUrl(doc.featuredImage.url), alt: text(doc.featuredImage.alt) || text(doc.name) } : undefined,
    gallery: doc.gallery?.filter(g => g.url).map(g => ({ url: mediaUrl(g.url), alt: text(g.alt) || text(doc.name) })),
    variations: doc.variations?.map(v => ({
      wpId: v.wpId, sku: v.sku, attributes: v.attributes,
      stock: v.stock, imageUrl: mediaUrl(v.imageUrl),
    })),
  };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const db = await getDb();
  const rows = await db.collection<Category>("terms").find({ taxonomy: "product_cat" } as Filter<Category>, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
  return rows.map(c => ({ ...c, name: text(c.name), description: text(c.description) }));
});

export function categoryChain(category: Category, all: Category[]) {
  const chain: Category[] = [];
  const seen = new Set<number>();
  let current: Category | undefined = category;
  while (current && !seen.has(current.wpTermId)) {
    seen.add(current.wpTermId); chain.unshift(current);
    current = all.find(c => c.wpTermId === current?.parentWpTermId);
  }
  return chain;
}
export function categoryHref(category: Category, all: Category[]) {
  return `/product-category/${categoryChain(category, all).map(c => c.slug).join("/")}/`;
}
function descendants(category: Category, all: Category[]) {
  const ids = new Set([category.wpTermId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of all) if (ids.has(c.parentWpTermId) && !ids.has(c.wpTermId)) { ids.add(c.wpTermId); changed = true; }
  }
  return all.filter(c => ids.has(c.wpTermId)).map(c => c.slug);
}
export const getProduct = cache(async (slug: string) => {
  const db = await getDb();
  const doc = await db.collection<Product>("products").findOne({ slug, status: "publish" });
  return doc ? cleanProduct(doc) : null;
});

export async function getCatalogue(raw: SearchValues, lockedCategory?: Category) {
  const filters = normaliseFilters(raw);
  const [db, categories] = await Promise.all([getDb(), getCategories()]);
  const scope = lockedCategory ? descendants(lockedCategory, categories) : undefined;
  // Category archives can be narrowed to descendants, never to unrelated branches.
  if (scope && filters.category && !scope.includes(filters.category)) filters.category = "";
  const selectedCategory = categories.find(c => c.slug === filters.category) || lockedCategory;
  const filter: Filter<Product> = { status: "publish" };
  if (selectedCategory) filter["categories.slug"] = { $in: descendants(selectedCategory, categories) };
  else if (filters.category) filter["categories.slug"] = filters.category;
  if (filters.q) {
    const literal = filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: { $regex: literal, $options: "i" } }, { sku: { $regex: literal, $options: "i" } }, { "attributes.brand": { $regex: literal, $options: "i" } }];
  }
  if (filters.brand.length) filter["attributes.brand"] = { $in: filters.brand };
  if (filters.instock) filter["stock.status"] = "instock";
  if (filters.min || filters.max) {
    filter["price.current"] = {
      $ne: null, ...(filters.min ? { $gte: Number(filters.min) } : {}),
      ...(filters.max ? { $lte: Number(filters.max) } : {}),
    };
  }
  const sort: Record<string, Sort> = {
    recommended: { "featured": -1, "featuredImage.url": -1, wpId: -1 },
    name: { name: 1, wpId: 1 }, newest: { createdAt: -1, wpId: -1 },
    "price-asc": { "price.current": 1, name: 1, wpId: 1 },
    "price-desc": { "price.current": -1, name: 1, wpId: 1 },
  };
  const col = db.collection<Product>("products");
  const omit = (key: string) => Object.fromEntries(Object.entries(filter).filter(([field]) => field !== key));
  type FacetRows = {
    brands: { _id: string; count: number }[];
    categories: { _id: string; ids: number[] }[];
    categoryTotal: { count: number }[];
    stock: CatalogueFacets["stock"][];
    price: CatalogueFacets["price"][];
  };
  const [total, facetRows] = await Promise.all([
    col.countDocuments(filter),
    col.aggregate<FacetRows>([
      { $match: { status: "publish", ...(scope ? { "categories.slug": { $in: scope } } : {}) } },
      { $facet: {
        brands: [
          { $match: omit("attributes.brand") }, { $unwind: "$attributes.brand" },
          { $match: { "attributes.brand": { $type: "string", $ne: "" } } },
          { $group: { _id: "$attributes.brand", count: { $sum: 1 } } }, { $sort: { _id: 1 } },
        ],
        categories: [
          { $match: omit("categories.slug") }, { $unwind: "$categories" },
          { $group: { _id: "$categories.slug", ids: { $addToSet: "$wpId" } } },
        ],
        categoryTotal: [{ $match: omit("categories.slug") }, { $count: "count" }],
        stock: [
          { $match: omit("stock.status") },
          { $group: { _id: null, total: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ["$stock.status", "instock"] }, 1, 0] } } } },
          { $project: { _id: 0 } },
        ],
        price: [
          { $match: omit("price.current") },
          { $group: { _id: null, total: { $sum: 1 },
            priced: { $sum: { $cond: [{ $isNumber: "$price.current" }, 1, 0] } },
            min: { $min: { $cond: [{ $isNumber: "$price.current" }, "$price.current", null] } },
            max: { $max: { $cond: [{ $isNumber: "$price.current" }, "$price.current", null] } },
          } },
          { $project: { _id: 0 } },
        ],
      } },
    ]).toArray(),
  ]);
  const facet = facetRows[0];
  const categoryIds = new Map<string, Set<number>>();
  for (const row of facet.categories) {
    const category = categories.find(c => c.slug === row._id);
    if (!category) continue;
    for (const ancestor of categoryChain(category, categories)) {
      const ids = categoryIds.get(ancestor.slug) || new Set<number>();
      row.ids.forEach(id => ids.add(id));
      categoryIds.set(ancestor.slug, ids);
    }
  }
  const brandCounts = new Map(facet.brands.map(b => [b._id, b.count]));
  filters.brand.forEach(brand => { if (!brandCounts.has(brand)) brandCounts.set(brand, 0); });
  const facets: CatalogueFacets = {
    categories: Object.fromEntries([...categoryIds].map(([slug, ids]) => [slug, ids.size])),
    categoryTotal: facet.categoryTotal[0]?.count || 0,
    brands: [...brandCounts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b)).map(([name, count]) => ({ name, count })),
    stock: facet.stock[0] || { available: 0, total: 0 },
    price: facet.price[0] || { min: null, max: null, priced: 0, total: 0 },
  };
  const pages = Math.max(1, Math.ceil(total / 24));
  const page = Math.min(filters.page, pages);
  const rows = filters.sort.startsWith("price-")
    ? await col.aggregate<Product>([
      { $match: filter },
      { $addFields: { _priceMissing: { $cond: [{ $eq: [{ $ifNull: ["$price.current", null] }, null] }, 1, 0] } } },
      { $sort: { _priceMissing: 1, "price.current": filters.sort === "price-asc" ? 1 : -1, wpId: 1 } },
      { $skip: (page - 1) * 24 }, { $limit: 24 },
      { $project: { description: 0, shortDescription: 0 } },
    ]).toArray()
    : await col.find(filter, { projection: { description: 0, shortDescription: 0 } })
      .sort(sort[filters.sort]).skip((page - 1) * 24).limit(24).toArray();
  return {
    products: rows.map(cleanProduct), total, pages, page, categories,
    facets, selectedCategory, filters: { ...filters, page },
  };
}
