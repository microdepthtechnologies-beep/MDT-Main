import Link from "next/link";
import { ArrowDown, ArrowUpRight, AudioLines, Headphones, Laptop, Network, Printer, Server, ShieldCheck, Zap } from "lucide-react";
import { categoryChain, categoryHref, getCatalogue, getProduct, type Category } from "@/lib/catalogue";
import { catalogueUrl, refinementCount, type SearchValues } from "@/lib/catalogue-filters";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ProductCard } from "./ProductCard";
import { MediaImage } from "./MediaImage";
import { CatalogueBrowser, CatalogueResults } from "./CatalogueBrowser";
import { CatalogueFiltersPanel } from "./CatalogueFilters";
import { CatalogueEmpty, CataloguePagination, CatalogueTools } from "./CatalogueToolbar";
import { Reveal } from "./Reveal";
import { editorialMedia } from "@/data/editorial-media";
import { Fragment } from "react";

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
  const hasFilters = !!filters.q || refinementCount(filters) > 0;
  return <>
    <SiteHeader />
    <main>
      <section className={`catalogue-hero shop-stage ${category ? "category-hero" : ""}`}>
        <div className="site-width">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>{category ? <><Link href={catalogueUrl("/shop/", filters, { category: "" })}>Products</Link>{categoryChain(category, categories).map(c => <span className="breadcrumb-part" key={c.slug}>/<Link href={categoryLink(c)} aria-current={c.slug === category.slug ? "page" : undefined}>{c.name}</Link></span>)}</> : <span aria-current="page">Products</span>}</nav>
          <div className="catalogue-hero-grid">
            <div className="catalogue-hero-copy">
              <p className="eyebrow"><span className="red-dash" /> THE MDT PRODUCT COLLECTION</p>
              <h1>{category ? category.name : <>Your next move.<br /><span>Better equipped.</span></>}</h1>
              <p className="hero-description">{category ? category.description || `Explore ${category.name.toLowerCase()} for your business. Get the right specification, with advice and support from the MDT team.` : "Equip your people. Connect your business. Discover technology selected for the way you work — backed by people who understand it."}</p>
              <div className="hero-links"><a className="button button-red" href="#catalogue">Explore {category ? "products" : "the collection"} <ArrowDown size={16} /></a><Link className="text-link" href="/#solutions">Explore our services <ArrowUpRight size={16} /></Link></div>
            </div>
            {!category && spotlight?.featuredImage && <Link href={`/product/${spotlight.slug}/`} className="hero-product">
              <span className="hero-product-kicker"><span className="status-dot" /> IN FOCUS / BUSINESS COMPUTING</span>
              <div className="hero-product-image"><MediaImage src={spotlight.featuredImage.url} alt={spotlight.name} fill preload sizes="(max-width: 700px) 85vw, 45vw" className="object-contain" /></div>
              <div className="hero-product-label"><div><span>TAKE YOUR WORK FURTHER</span><strong>{spotlight.name}</strong></div><span className="hero-product-arrow"><ArrowUpRight size={24} /></span></div>
            </Link>}
            {category && <div className="category-hero-note"><span className="eyebrow">FROM SPECIFICATION TO SUPPORT</span><p>The equipment is<br />just the beginning.</p><Link href="/#contact">Let’s discuss your project <ArrowUpRight size={18} /></Link></div>}
          </div>
        </div>
      </section>
      <div className="catalogue-assurances"><div className="site-width"><span><ShieldCheck /> Genuine technology</span><span><Headphones /> Expert product advice</span><span><Network /> Supply, setup & support</span><span className="assurance-location">Your technology partner in Nairobi <ArrowUpRight size={15} /></span></div></div>
      {!category && <section className="site-width department-section" aria-label="Shop by category"><div className="section-caption"><h2>Find your starting point</h2><a href="#catalogue">All categories <ArrowDown size={14} /></a></div><div className="department-grid">{departments.map(({ slug, label, icon: Icon }) => { const c = categories.find(c => c.slug === slug); return c ? <Link key={slug} href={categoryLink(c)}><Icon size={27} strokeWidth={1.4} /><span>{label}</span><ArrowUpRight size={15} /></Link> : null; })}</div></section>}
      {!category && <Reveal className="site-width collection-stories">
        <Link href="/product-category/pcs-desktops/" className="collection-story work-story"><MediaImage src={editorialMedia.workspace} alt="Technology for a productive workspace" fill sizes="(max-width:700px) 90vw, 55vw" className="object-cover" /><div><span className="eyebrow">01 / THE EVERYDAY, ELEVATED</span><h2>Make room<br />for better work.</h2><span>Explore computing <ArrowUpRight size={18} /></span></div></Link>
        <Link href="/product-category/networking-infrastructure/" className="collection-story network-story"><MediaImage src={editorialMedia.network} alt="Connected network equipment" fill sizes="(max-width:700px) 90vw, 35vw" className="object-cover" /><div><span className="eyebrow">02 / BUILT TO CONNECT</span><h2>Big ambitions.<br />Solid foundations.</h2><span>Explore networking <ArrowUpRight size={18} /></span></div></Link>
      </Reveal>}
      <section className="site-width catalogue-section" id="catalogue">
        <div className="catalogue-heading"><div><p className="eyebrow">{category ? "THE COLLECTION" : "SPECIFIED FOR YOUR BUSINESS"}</p><h2 id="catalogue-results-heading" tabIndex={-1}>{filters.q ? "Search results" : category ? `Explore ${category.name.toLowerCase()}` : "Explore our products"}<span className="heading-dot">.</span></h2></div><span className="catalogue-total">{total.toLocaleString()} products to explore</span></div>
        {children.length > 0 && <div className="subcategory-links">{children.map(c => <Link key={c.slug} href={categoryLink(c)}>{c.name}<ArrowUpRight size={14} /></Link>)}</div>}
        <CatalogueBrowser {...controls}>
        <div className="catalogue-layout">
          <CatalogueFiltersPanel />
          <div className="catalogue-results">
            <CatalogueTools />
            <CatalogueResults>
              {products.length ? <div className={`product-grid ${filters.view === "list" ? "product-list" : ""}`}>{products.map((p, i) => <Fragment key={p.wpId}><ProductCard p={p} />{i === 5 && products.length > 8 && !hasFilters && !category && filters.page === 1 && filters.sort === "recommended" && <aside className="collection-interlude"><span className="interlude-icon" aria-hidden="true"><Network size={44} strokeWidth={1} /></span><div><span className="eyebrow">PRODUCTS + PEOPLE</span><h3>The right kit.<br />The right people behind it.</h3><p>Building a workspace? Let’s put the whole picture together.</p></div><Link href="/#contact" className="interlude-link">Plan it with MDT <ArrowUpRight size={20} /></Link></aside>}</Fragment>)}</div> : <CatalogueEmpty />}
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
