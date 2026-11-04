import { getDb } from "./mongodb";
import { categoryHref, cleanProduct, getCategories, type Product } from "./catalogue";

export async function getSoftwareProducts(selection: { categorySlugs: string[]; productIds: number[] }) {
  const [db, categories] = await Promise.all([getDb(), getCategories()]);
  const selected = categories.filter(category => selection.categorySlugs.includes(category.slug));
  const ids = new Set(selected.map(category => category.wpTermId));
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) if (ids.has(category.parentWpTermId) && !ids.has(category.wpTermId)) { ids.add(category.wpTermId); changed = true; }
  }
  const slugs = categories.filter(category => ids.has(category.wpTermId)).map(category => category.slug);
  const curated = selection.productIds.filter(id => Number.isSafeInteger(id) && id > 0);
  if (!slugs.length && !curated.length) return { products: [], catalogueHref: undefined };
  const products = await db.collection<Product>("products").find({
    status: "publish", $or: [{ "categories.slug": { $in: slugs } }, { wpId: { $in: curated } }],
  }, { projection: { price: 0, "variations.price": 0 } }).sort({ featured: -1, createdAt: -1 }).limit(4).toArray();
  return { products: products.map(cleanProduct), catalogueHref: selected[0] ? categoryHref(selected[0], categories) : undefined };
}
