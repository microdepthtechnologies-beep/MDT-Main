import Link from "next/link";
import { ArrowDown, ArrowUpRight, AudioLines, Headphones, Laptop, Network, Printer, Search, Server, ShieldCheck, Zap } from "lucide-react";
import { categoryChain, categoryHref, getCatalogue, getProduct, type Category } from "@/lib/catalogue";
import { catalogueUrl, type SearchValues } from "@/lib/catalogue-filters";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ProductCard } from "./ProductCard";
import { MediaImage } from "./MediaImage";
import { CatalogueBrowser, CatalogueResults } from "./CatalogueBrowser";
import { CatalogueFiltersPanel } from "./CatalogueFilters";
import { CatalogueEmpty, CataloguePagination, CatalogueTools } from "./CatalogueToolbar";

const departments = [
  { slug: "pcs-desktops", label: "Computing", icon: Laptop },
  { slug: "networking-infrastructure", label: "Networking", icon: Network },
  { slug: "printers-and-scanners", label: "Print & scan", icon: Printer },
  { slug: "servers-storage", label: "Servers & storage", icon: Server },
  { slug: "audio-visual-solutions", label: "Audio & visual", icon: AudioLines },
  { slug: "power-solutions", label: "Power solutions", icon: Zap },
];

export async function CataloguePage({ search, category }: { search: SearchValues; category?: Category }) {
  const [data, spotlight] = await Promise.all([
    getCatalogue(search, category),
    category ? Promise.resolve(null) : getProduct("lenovo-thinkpad-e14-gen-7-21t90030ue"),
  ]);
  const { categories, products, total, pages, filters, facets } = data;
  const base = category ? categoryHref(category, categories) : "/shop/";
  const controls = { base, filters, categories, facets, total, pages, locked: category?.slug };
  const categoryLink = (item: Category) => catalogueUrl(categoryHref(item, categories), filters, { category: "" });
  const children = category ? categories.filter(c => c.parentWpTermId === category.wpTermId && c.count > 0) : [];
  return <>
    <SiteHeader />
    {!category && <nav className="shop-category-nav" aria-label="Shop categories">
      <div className="site-width shop-category-nav-inner">
        <span>Shop by</span>
        <div>{departments.map(({ slug, label, icon: Icon }) => {
          const item = categories.find(c => c.slug === slug);
          return item ? <Link key={slug} href={categoryLink(item)}><Icon size={16} strokeWidth={1.7} />{label}</Link> : null;
        })}</div>
      </div>
    </nav>}
    <main>
      <section className={`catalogue-hero shop-stage ${category ? "category-hero" : ""}`}>
        <div className="site-width">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>{category ? <><Link href={catalogueUrl("/shop/", filters, { category: "" })}>Products</Link>{categoryChain(category, categories).map(c => <span className="breadcrumb-part" key={c.slug}>/<Link href={categoryLink(c)} aria-current={c.slug === category.slug ? "page" : undefined}>{c.name}</Link></span>)}</> : <span aria-current="page">Products</span>}</nav>
          <div className="catalogue-hero-grid">
            <div className="catalogue-hero-copy">
              <p className="eyebrow"><span className="red-dash" /> {category ? "THE MDT PRODUCT COLLECTION" : "SHOP / BUSINESS TECHNOLOGY"}</p>
              <h1>{category ? category.name : <>Shop technology<br /><span>for your business.</span></>}</h1>
              <p className="hero-description">{category ? category.description || `Explore ${category.name.toLowerCase()} for your business. Get the right specification, with advice and support from the MDT team.` : "Find the right laptops, networking, printing and business essentials. Browse products, check availability and build your quote list."}</p>
              <div className="hero-links">
                {!category && <form className="shop-search" action="/shop/" role="search">
                  <Search size={19} aria-hidden="true" />
                  <label className="sr-only" htmlFor="shop-search">Search products, brands, or models</label>
                  <input id="shop-search" name="q" type="search" defaultValue={filters.q} maxLength={160} placeholder="Search products, brands, or models" />
                  <button className="button button-red" type="submit">Search</button>
                </form>}
                <a className="button button-red" href="#catalogue">{category ? "Shop this category" : "Shop all products"} <ArrowDown size={16} /></a>
                {category && <Link className="text-link" href="/#contact">Need buying advice? <ArrowUpRight size={16} /></Link>}
              </div>
            </div>
            {!category && spotlight?.featuredImage && <Link href={`/product/${spotlight.slug}/`} className="hero-product">
              <span className="hero-product-kicker"><span className="status-dot" /> FEATURED PRODUCT / BUSINESS COMPUTING</span>
              <div className="hero-product-image"><MediaImage src={spotlight.featuredImage.url} alt={spotlight.name} fill preload sizes="(max-width: 700px) 85vw, 45vw" className="object-contain" /></div>
              <div className="hero-product-label"><div><span>PRICE ON REQUEST · SHOP NOW</span><strong>{spotlight.name}</strong></div><span className="hero-product-arrow"><ArrowUpRight size={24} /></span></div>
            </Link>}
            {category && <div className="category-hero-note"><span className="eyebrow">FROM SPECIFICATION TO SUPPORT</span><p>The equipment is<br />just the beginning.</p><Link href="/#contact">Let’s discuss your project <ArrowUpRight size={18} /></Link></div>}
          </div>
        </div>
      </section>
      <div className="catalogue-assurances"><div className="site-width"><span><ShieldCheck /> Genuine technology</span><span><Headphones /> Expert product advice</span><span><Network /> Supply, setup & support</span><span className="assurance-location">Your technology partner in Nairobi <ArrowUpRight size={15} /></span></div></div>
      <section className={`site-width catalogue-section${category ? "" : " storefront-catalogue"}`} id="catalogue">
        <div className="catalogue-heading"><div><p className="eyebrow">{category ? "THE COLLECTION" : "BROWSE THE MDT STORE"}</p><h2 id="catalogue-results-heading" tabIndex={-1}>{filters.q ? "Search results" : category ? `Explore ${category.name.toLowerCase()}` : "Shop all products"}<span className="heading-dot">.</span></h2></div><span className="catalogue-total">{total.toLocaleString()} products to explore</span></div>
        {children.length > 0 && <div className="subcategory-links">{children.map(c => <Link key={c.slug} href={categoryLink(c)}>{c.name}<ArrowUpRight size={14} /></Link>)}</div>}
        <CatalogueBrowser {...controls}>
        <div className="catalogue-layout">
          <CatalogueFiltersPanel />
          <div className="catalogue-results">
            <CatalogueTools />
            <CatalogueResults>
              {products.length ? <div className={`product-grid ${filters.view === "list" ? "product-list" : ""}`}>{products.map(p => <ProductCard p={p} key={p.wpId} />)}</div> : <CatalogueEmpty />}
              <CataloguePagination />
            </CatalogueResults>
          </div>
        </div>
        </CatalogueBrowser>
      </section>
      <section className="site-width procurement-section"><div className="procurement-mark" aria-hidden="true"><Network size={48} strokeWidth={1} /></div><div><p className="eyebrow">MORE THAN A PRODUCT SUPPLIER</p><h2>One device. A whole office.<br />We see the bigger picture.</h2><p>Bring us your requirements. We’ll help with specification, sourcing, installation and the support that follows.</p></div><Link className="button button-dark" href="/#contact">Discuss your project <ArrowUpRight size={18} /></Link></section>
    </main>
    <SiteFooter />
  </>;
}
