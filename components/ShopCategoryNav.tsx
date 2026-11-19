"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AudioLines, ChevronDown, ChevronRight, KeyRound, Laptop, Network, Phone, Printer, Receipt, Server, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { shopDepartments } from "@/data/shop-departments";

export type SubcategoryLink = { label: string; href: string; current?: boolean; children: SubcategoryLink[] };
type DepartmentLink = { href: string; current: boolean; subcategories: SubcategoryLink[] };

const icons = {
  "audio-visual-solutions": AudioLines, "pcs-desktops": Laptop, "networking-infrastructure": Network,
  pos: Receipt, "power-solutions": Zap, "printers-and-scanners": Printer, "security-solutions": ShieldCheck,
  "servers-storage": Server, "smart-devices": Smartphone, "software-products": KeyRound, "telephone-infrastructure": Phone,
};

export type ShopCategoryNavigation = Record<string, DepartmentLink>;

export function ShopCategoryNav({ links }: { links: ShopCategoryNavigation }) {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const [openDepartment, setOpenDepartment] = useState<string | null>(null);
  const [preview, setPreview] = useState<SubcategoryLink | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [anchor, setAnchor] = useState({ top: 0, left: 12 });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 12 });

  // Clamp with the panel's real width — it grows when the flyout column opens.
  useEffect(() => {
    if (!openDepartment || !menuRef.current) return;
    const width = menuRef.current.offsetWidth;
    setMenuPosition({ top: anchor.top, left: Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12)) });
  }, [openDepartment, preview, anchor]);

  useEffect(() => {
    if (!openDepartment) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node) || menuRef.current?.contains(event.target as Node)) return;
      setOpenDepartment(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenDepartment(null);
      triggerRefs.current.get(openDepartment)?.focus();
    };
    // The page scrolling closes the menu, but scrolling inside the menu or
    // the (horizontally scrollable) nav strip itself must not.
    const closeOnScroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target && (menuRef.current?.contains(target) || navRef.current?.contains(target))) return;
      setOpenDepartment(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [openDepartment]);

  function toggleMenu(event: MouseEvent<HTMLButtonElement>, slug: string) {
    if (openDepartment === slug) {
      setOpenDepartment(null);
      return;
    }
    const bounds = (event.currentTarget.parentElement ?? event.currentTarget).getBoundingClientRect();
    setAnchor({ top: bounds.bottom + 8, left: bounds.left });
    setPreview(null);
    setExpandedSub(null);
    setOpenDepartment(slug);
  }

  const active = shopDepartments.find(department => department.slug === openDepartment);
  const activeLinks = openDepartment ? links[openDepartment] : undefined;
  const menu = active && activeLinks && typeof document !== "undefined" ? createPortal(
    <div
      className="shop-category-menu-panel"
      id={`shop-category-menu-${active.slug}`}
      ref={menuRef}
      role="group"
      aria-label={`${active.label} categories`}
      style={{ top: menuPosition.top, left: menuPosition.left }}
    >
      <div className="shop-category-menu-col">
        <Link className="shop-category-menu-all" href={activeLinks.href} onClick={() => setOpenDepartment(null)}>All {active.label}</Link>
        {activeLinks.subcategories.map(subcategory => <div className="shop-category-menu-item" key={subcategory.href}>
          <div className={`shop-category-menu-row${preview?.href === subcategory.href ? " is-preview" : ""}`}>
            <Link
              href={subcategory.href}
              aria-current={subcategory.current ? "page" : undefined}
              onClick={() => setOpenDepartment(null)}
              onMouseEnter={() => setPreview(subcategory.children.length ? subcategory : null)}
              onFocus={() => setPreview(subcategory.children.length ? subcategory : null)}
            >
              {subcategory.label}
              {subcategory.children.length > 0 && <ChevronRight className="flyout-hint" size={13} aria-hidden="true" />}
            </Link>
            {subcategory.children.length > 0 && <button
              type="button"
              className="shop-category-menu-expand"
              aria-label={`Show ${subcategory.label} subcategories`}
              aria-expanded={expandedSub === subcategory.href}
              onClick={() => setExpandedSub(expandedSub === subcategory.href ? null : subcategory.href)}
            ><ChevronDown size={14} aria-hidden="true" /></button>}
          </div>
          {subcategory.children.length > 0 && <div className="shop-category-menu-children" hidden={expandedSub !== subcategory.href}>
            {subcategory.children.map(grandchild =>
              <Link key={grandchild.href} href={grandchild.href} aria-current={grandchild.current ? "page" : undefined} onClick={() => setOpenDepartment(null)}>{grandchild.label}</Link>
            )}
          </div>}
        </div>)}
      </div>
      {preview && <div className="shop-category-menu-col shop-category-menu-flyout">
        <Link className="shop-category-menu-all" href={preview.href} onClick={() => setOpenDepartment(null)}>All {preview.label}</Link>
        {preview.children.map(grandchild =>
          <Link key={grandchild.href} href={grandchild.href} aria-current={grandchild.current ? "page" : undefined} onClick={() => setOpenDepartment(null)}>{grandchild.label}</Link>
        )}
      </div>}
    </div>,
    document.body,
  ) : null;

  return <>
    <nav ref={navRef} className="shop-category-nav" aria-label="Shop categories">
      <div className="site-width shop-category-nav-inner">
        <div className="shop-category-links">
          {shopDepartments.map(({ slug, label }) => {
            const Icon = icons[slug];
            const department = links[slug];
            if (!department) return null;
            const menuId = `shop-category-menu-${slug}`;
            return <div className="shop-category-item" key={slug}>
              <Link className="shop-category-link" href={department.href} aria-current={department.current ? "page" : undefined}>
                <Icon size={16} strokeWidth={1.7} />{label}
              </Link>
              <button
                type="button"
                className="shop-category-toggle"
                aria-label={`Browse ${label} subcategories`}
                aria-controls={menuId}
                aria-expanded={openDepartment === slug}
                ref={element => { if (element) triggerRefs.current.set(slug, element); else triggerRefs.current.delete(slug); }}
                onClick={event => toggleMenu(event, slug)}
              >
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            </div>;
          })}
        </div>
      </div>
    </nav>
    {menu}
  </>;
}
