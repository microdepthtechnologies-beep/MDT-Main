"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AudioLines, ChevronDown, KeyRound, Laptop, Network, Phone, Printer, Receipt, Server, ShieldCheck, Smartphone, Zap } from "lucide-react";

type SubcategoryLink = { label: string; href: string };
type DepartmentLink = { href: string; current: boolean; subcategories: SubcategoryLink[] };

const departments = [
  { slug: "audio-visual-solutions", label: "Audio-Visual", icon: AudioLines },
  { slug: "pcs-desktops", label: "Laptops & Desktops", icon: Laptop },
  { slug: "networking-infrastructure", label: "Networking", icon: Network },
  { slug: "pos", label: "Point of Sale", icon: Receipt },
  { slug: "power-solutions", label: "Power solutions", icon: Zap },
  { slug: "printers-and-scanners", label: "Printers & Scanners", icon: Printer },
  { slug: "security-solutions", label: "Security solutions", icon: ShieldCheck },
  { slug: "servers-storage", label: "Servers & Storage", icon: Server },
  { slug: "smart-devices", label: "Smart devices", icon: Smartphone },
  { slug: "software-products", label: "Software & licenses", icon: KeyRound },
  { slug: "telephone-infrastructure", label: "Telephony", icon: Phone },
];

export type ShopCategoryNavigation = Record<string, DepartmentLink>;

export function ShopCategoryNav({ links }: { links: ShopCategoryNavigation }) {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const [openDepartment, setOpenDepartment] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 12 });

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
    const closeOnScroll = () => setOpenDepartment(null);
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
    const bounds = event.currentTarget.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    setMenuPosition({
      top: bounds.bottom + 8,
      left: Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)),
    });
    setOpenDepartment(slug);
  }

  const active = departments.find(department => department.slug === openDepartment);
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
      <Link className="shop-category-menu-all" href={activeLinks.href}>All {active.label}</Link>
      {activeLinks.subcategories.map(subcategory =>
        <Link key={subcategory.href} href={subcategory.href}>{subcategory.label}</Link>
      )}
    </div>,
    document.body,
  ) : null;

  return <>
    <nav ref={navRef} className="shop-category-nav" aria-label="Shop categories">
      <div className="site-width shop-category-nav-inner">
        <span>Shop by</span>
        <div className="shop-category-links">
          {departments.map(({ slug, label, icon: Icon }) => {
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
