"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, Menu, Phone, Search, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { contact } from "@/data/company";
import { QuoteCartButton } from "./QuoteCart";

const links = [
  ["Home", "/"], ["About us", "/about/"], ["Products", "/shop/"],
  ["Software & Licenses", "/software-licenses/"], ["Our services", "/our-services/"], ["Blog", "/blog/"],
];
export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const productsActive = /^\/(shop|product|product-category)(\/|$)/.test(pathname);
  const activeLink = (href: string) => href === "/shop/" ? productsActive : href === "/blog/" ? /^\/(?:blog|category|\d{4})(?:\/|$)/.test(pathname) : href === "/" ? pathname === "/" : pathname === href.slice(0, -1) || pathname.startsWith(href);
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="utility-bar"><div className="site-width">
        <span>MICRO DEPTH TECHNOLOGIES <span className="utility-divider">/</span> Nairobi, Kenya</span>
        <a href={`tel:${contact.phoneIntl}`}><Phone size={12} /> Let’s talk technology <span>{contact.phoneDisplay}</span></a>
      </div></div>
      <header className="site-header">
        <div className="site-width header-inner">
          <Link href="/" aria-label="Micro Depth Technologies home"><Logo /></Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, href]) => <Link className={activeLink(href) ? "active" : ""} aria-current={activeLink(href) ? "page" : undefined} href={href} key={href}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label={searchOpen ? "Close search" : "Search products"} aria-expanded={searchOpen} aria-controls="header-search" onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
            <QuoteCartButton />
            <Link className="icon-button account-button" href="/dashboard" aria-label="My account"><User size={20} /></Link>
            <Link className="button button-dark header-contact" href="/quote/checkout/">Request a quote <ArrowUpRight size={16} /></Link>
            <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => drawer.current?.showModal()}><Menu size={24} /></button>
          </div>
        </div>
        {searchOpen && <form id="header-search" className="site-width header-search" action="/shop/" role="search">
          <Search size={20} /><label className="sr-only" htmlFor="global-search">Search products</label>
          <input id="global-search" autoFocus name="q" placeholder="Search products, brands or a model number…" type="search" required />
          <button className="button button-red" type="submit">Search</button>
        </form>}
      </header>
      <dialog ref={drawer} className="mobile-nav-dialog" aria-label="Site navigation" onClick={e => { if (e.target === e.currentTarget) drawer.current?.close(); }}>
        <div className="dialog-heading"><Logo /><button className="icon-button" aria-label="Close navigation" onClick={() => drawer.current?.close()}><X /></button></div>
        <nav aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} aria-current={activeLink(href) ? "page" : undefined} onClick={() => drawer.current?.close()}>{label}<ArrowUpRight size={20} /></Link>)}</nav>
        <div className="mobile-account-links"><Link href="/dashboard/" onClick={() => drawer.current?.close()}>My account</Link><Link href="/quote/checkout/" onClick={() => drawer.current?.close()}>Your quote cart</Link></div>
        <Link className="button button-red" href="/contact/" onClick={() => drawer.current?.close()}>Talk to an expert <ArrowUpRight size={18} /></Link>
        <a className="mobile-nav-phone" href={`tel:${contact.phoneIntl}`}><Phone size={17} /> {contact.phoneDisplay}</a>
      </dialog>
    </>
  );
}
