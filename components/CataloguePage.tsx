import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryChain, categoryHref, getCatalogue, getDepartmentProducts, type Category } from "@/lib/catalogue";
import { catalogueUrl, refinementCount, type SearchValues } from "@/lib/catalogue-filters";
import { shopDepartments } from "@/data/shop-departments";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ProductCard } from "./ProductCard";
import { CatalogueBrowser, CatalogueResults } from "./CatalogueBrowser";
import { CatalogueEmpty, CataloguePagination, CatalogueTools } from "./CatalogueToolbar";
import { ShopCategoryNav, type ShopCategoryNavigation } from "./ShopCategoryNav";
import { ProductQuickView } from "./ProductQuickView";

export async function CataloguePage({ search, category }: { search: SearchValues; category?: Category }) {
  const data = await getCatalogue(search, category);
  const { categories, products, total, pages, filters, facets } = data;
  const base = category ? categoryHref(category, categories) : "/shop/";
  const controls = { base, filters, categories, facets, total, pages, locked: category?.slug };
  const categoryLink = (item: Category) => catalogueUrl(categoryHref(item, categories), filters, { category: "" });
  const selectedCategory = category || categories.find(c => c.slug === filters.category);
  const selectedChain = selectedCategory ? categoryChain(selectedCategory, categories) : [];
  const departmentLinks: ShopCategoryNavigation = Object.fromEntries(shopDepartments.flatMap(({ slug }) => {
    const item = categories.find(c => c.parentWpTermId === 0 && c.slug === slug);
    if (!item) return [];
    // Two visible levels: the department's children open the first dropdown level,
    // their children fill the flyout. Deeper terms live in the Category filter.
    const kidsOf = (parent: Category) => categories
      .filter(candidate => candidate.parentWpTermId === parent.wpTermId && candidate.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    const link = (candidate: Category, children: ShopCategoryNavigation[string]["subcategories"] = []) => ({
      label: candidate.name,
      href: categoryLink(candidate),
      current: selectedChain.some(current => current.wpTermId === candidate.wpTermId),
      children,
    });
    const subcategories = kidsOf(item).map(child => link(child, kidsOf(child).map(grandchild => link(grandchild))));
    return [[slug, {
      href: categoryLink(item),
      current: selectedChain.some(current => current.wpTermId === item.wpTermId),
      subcategories,
    }]];
  }));
  const featuredDepartments = !category && !filters.q && refinementCount(filters) === 0 && !filters.browse && filters.page === 1
    ? shopDepartments.flatMap(department => {
      const item = categories.find(c => c.parentWpTermId === 0 && c.slug === department.slug);
      return item ? [{ ...department, category: item }] : [];
    }) : null;
  const departmentProducts = featuredDepartments ? await getDepartmentProducts(featuredDepartments.map(item => item.category), categories) : [];
  return <>
    <SiteHeader />
    <ShopCategoryNav links={departmentLinks} />
    <main>
      <section className={`site-width catalogue-section${category ? "" : " storefront-catalogue"}`} id="catalogue">
        <h1 className="sr-only" id="catalogue-results-heading" tabIndex={-1}>{filters.q ? "Search results" : category ? `Explore ${category.name.toLowerCase()}` : "Browse products"}</h1>
        <CatalogueBrowser {...controls}>
        <div className="catalogue-layout">
          <div className="catalogue-results">
            <CatalogueTools hideSearch={!category && !filters.category} featured={!!featuredDepartments} />
            <CatalogueResults>
              {featuredDepartments ? featuredDepartments.map((department, index) => <section className="department-products" key={department.slug} aria-labelledby={`department-${department.slug}`}>
                <div className="section-caption"><h2 id={`department-${department.slug}`}>{department.label}</h2><Link href={categoryLink(department.category)} className="text-link">View all <span className="sr-only">{department.label}</span><ArrowRight size={16} /></Link></div>
                {departmentProducts[index].length ? <div className="product-grid">{departmentProducts[index].map(p => <ProductCard p={p} key={p.wpId} />)}</div> : <p>No products are currently available in this category.</p>}
              </section>) : <>
                {products.length ? <div className="product-grid">{products.map(p => <ProductCard p={p} key={p.wpId} />)}</div> : <CatalogueEmpty />}
                <CataloguePagination />
              </>}
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
