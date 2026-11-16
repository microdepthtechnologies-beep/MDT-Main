"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight, FileText, Headphones, LayoutDashboard, Layers as LayersIcon, LoaderCircle, LogOut, Menu, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { contact } from "@/data/company";
import { accountInitials } from "@/lib/dashboard-types";

const navigation = [
  { href: "/dashboard/", label: "Overview", icon: LayoutDashboard, group: "YOUR WORKSPACE" },
  { href: "/dashboard/quotes/", label: "My quotes", icon: FileText },
  { href: "/dashboard/profile/", label: "Profile & contact", icon: UserRound, group: "ACCOUNT SETTINGS" },
  { href: "/dashboard/password/", label: "Sign-in & security", icon: ShieldCheck },
];

export function DashboardShell({ name, email, children, sales = false, canSales = false }: { name: string; email: string; children: ReactNode; sales?: boolean; canSales?: boolean }) {
  const links = sales ? [
    { href: "/sales/", label: "Request workspace", icon: LayoutDashboard, group: "SALES OPERATIONS" },
    { href: "/dashboard/", label: "My account", icon: UserRound },
    { href: "/dashboard/password/", label: "Sign-in & security", icon: ShieldCheck },
  ] : [...navigation, ...(canSales ? [{ href: "/sales/", label: "Sales workspace", icon: LayersIcon, group: "TEAM ACCESS" }] : [])];
  const pathname = usePathname().replace(/\/$/, "");
  const current = links.find(item => item.href.replace(/\/$/, "") === pathname);
  const drawer = useRef<HTMLDialogElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  async function leave() {
    setLeaving(true);
    setError("");
    try { await signOut({ redirectTo: "/auth/signin/" }); }
    catch { setError("Couldn’t sign out. Please try again."); setLeaving(false); }
  }
  const sidebar = (mobile = false) => <>
    <div className="workspace-brand"><Link href="/" aria-label="Micro Depth Technologies home"><Logo tone="light" /></Link>{mobile && <button className="workspace-icon" aria-label="Close account menu" onClick={() => drawer.current?.close()}><X size={22} /></button>}</div>
    <div className="workspace-label"><span /> {sales ? "MDT / SALES WORKSPACE" : "YOUR MDT ACCOUNT"}</div>
    <nav className="workspace-nav" aria-label={mobile ? "Mobile account navigation" : "Account navigation"}>
      {links.map(({ href, label, icon: Icon, group }) => <div key={href}>
        {group && <p>{group}</p>}
        <Link href={href} aria-current={pathname === href.replace(/\/$/, "") ? "page" : undefined} onClick={() => drawer.current?.close()}><Icon size={19} strokeWidth={1.6} />{label}<ChevronRight size={14} /></Link>
      </div>)}
    </nav>
    <div className="workspace-sidebar-bottom">
      <div className="workspace-help"><Headphones size={22} strokeWidth={1.5} /><strong>People, not just a platform.</strong><p>Our team is here to help with your next technology decision.</p><a href={`mailto:${contact.email}`}>Talk to MDT <ArrowUpRight size={15} /></a></div>
      <div className="workspace-member"><span className="workspace-avatar">{accountInitials(name)}</span><div><strong>{name}</strong><span>{email}</span></div></div>
      <button className="workspace-signout" onClick={leave} disabled={leaving}>{leaving ? <LoaderCircle size={17} className="filter-spinner" /> : <LogOut size={17} />} {leaving ? "Signing out…" : "Sign out"}</button>
      {error && <p className="workspace-signout-error" role="alert">{error}</p>}
    </div>
  </>;
  return <div className="workspace">
    <a href="#workspace-content" className="skip-link">Skip to dashboard content</a>
    <aside className="workspace-sidebar">{sidebar()}</aside>
    <dialog ref={drawer} className="workspace-drawer" aria-label="Account menu" onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }} onClick={event => { if (event.target === event.currentTarget) drawer.current?.close(); }}>{sidebar(true)}</dialog>
    <div className="workspace-body">
      <header className="workspace-topbar">
        <div className="workspace-breadcrumb"><button className="workspace-icon workspace-menu-toggle" aria-label="Open account menu" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()}><Menu size={23} /></button><span>{sales ? "Sales" : "My account"}</span><ChevronRight size={13} /><strong>{current?.label || (sales ? "Quotation" : "Overview")}</strong></div>
        <div className="workspace-top-actions"><Link href="/shop/" className="workspace-catalogue-link">Explore catalogue <ArrowUpRight size={15} /></Link><Link href="/quote/checkout/" className="workspace-cart-link"><ShoppingBag size={18} /><span>Quote cart</span></Link><ThemeToggle /><Link href="/dashboard/profile/" aria-label="Your profile" className="workspace-avatar workspace-top-avatar">{accountInitials(name)}</Link></div>
      </header>
      <main id="workspace-content" tabIndex={-1} className="workspace-content">{children}</main>
      <footer className="workspace-footer"><span>Micro Depth Technologies <span>/</span> Built around your business.</span><a href={`tel:${contact.phoneIntl}`}>Let’s talk <ArrowUpRight size={13} /></a></footer>
    </div>
  </div>;
}
