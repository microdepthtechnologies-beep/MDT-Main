import { categoryChain, categoryHref, getCatalogue, type Category } from "@/lib/catalogue";
import { catalogueUrl, type SearchValues } from "@/lib/catalogue-filters";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ProductCard } from "./ProductCard";
import { CatalogueBrowser, CatalogueResults } from "./CatalogueBrowser";
import { CatalogueEmpty, CataloguePagination, CatalogueTools } from "./CatalogueToolbar";
import { ShopCategoryNav, type ShopCategoryNavigation } from "./ShopCategoryNav";
import { ProductQuickView } from "./ProductQuickView";

const departments = [
  { slug: "audio-visual-solutions" },
  { slug: "pcs-desktops" },
  { slug: "networking-infrastructure" },
  { slug: "pos" },
  { slug: "power-solutions" },
  { slug: "printers-and-scanners" },
  { slug: "security-solutions" },
  { slug: "servers-storage" },
  { slug: "smart-devices" },
  { slug: "software-products" },
  { slug: "telephone-infrastructure" },
];

export async function CataloguePage({ search, category }: { search: SearchValues; category?: Category }) {
  const data = await getCatalogue(search, category);
  const { categories, products, total, pages, filters, facets } = data;
  const base = category ? categoryHref(category, categories) : "/shop/";
  const controls = { base, filters, categories, facets, total, pages, locked: category?.slug };
  const categoryLink = (item: Category) => catalogueUrl(categoryHref(item, categories), filters, { category: "" });
  const categoryPaths = categories.map(item => ({ item, chain: categoryChain(item, categories) }));
  const selectedCategory = category || categories.find(c => c.slug === filters.category);
  const selectedChain = selectedCategory ? categoryChain(selectedCategory, categories) : [];
  const departmentLinks: ShopCategoryNavigation = Object.fromEntries(departments.flatMap(({ slug }) => {
    const item = categories.find(c => c.parentWpTermId === 0 && c.slug === slug);
    if (!item) return [];
    const subcategories = categoryPaths
      .filter(({ item: candidate, chain }) => candidate.count > 0 && candidate.wpTermId !== item.wpTermId && chain.some(parent => parent.wpTermId === item.wpTermId))
      .map(({ item: candidate, chain }) => ({ label: chain.slice(1).map(parent => parent.name).join(" / "), href: categoryLink(candidate) }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [[slug, {
      href: categoryLink(item),
      current: selectedChain.some(current => current.wpTermId === item.wpTermId),
      subcategories,
    }]];
  }));
  return <>
    <SiteHeader />
    <ShopCategoryNav links={departmentLinks} />
    <main>
      <section className={`site-width catalogue-section${category ? "" : " storefront-catalogue"}`} id="catalogue">
        <h1 className="sr-only" id="catalogue-results-heading" tabIndex={-1}>{filters.q ? "Search results" : category ? `Explore ${category.name.toLowerCase()}` : "Browse products"}</h1>
        <CatalogueBrowser {...controls}>
        <div className="catalogue-layout">
          <div className="catalogue-results">
            <CatalogueTools hideSearch={!category && !filters.category} />
            <CatalogueResults>
              {products.length ? <div className={`product-grid ${filters.view === "list" ? "product-list" : ""}`}>{products.map(p => <ProductCard p={p} key={p.wpId} />)}</div> : <CatalogueEmpty />}
              <CataloguePagination />
            </CatalogueResults>
          </div>
        </div>
        </CatalogueBrowser>
        {typeof search.product === "string" && search.product && <ProductQuickView key={search.product} slug={search.product} autoOpen />}
      </section>
    </main>
    <SiteFooter />
  </>;
}
