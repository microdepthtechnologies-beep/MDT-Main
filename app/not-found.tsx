import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
export default function NotFound() {
  return <><SiteHeader /><main className="site-width catalogue-empty my-16"><p className="eyebrow">404 / PAGE NOT FOUND</p><h1 className="text-4xl tracking-tight">Let’s point you in the right direction.</h1><p>This page isn’t available. Explore our product collection or ask us to help find what you need.</p><Link className="button button-red" href="/shop/">Explore products <ArrowUpRight size={18} /></Link><Link className="text-link" href="/"><ArrowLeft size={16} /> Back to MDT</Link></main><SiteFooter /></>;
}
