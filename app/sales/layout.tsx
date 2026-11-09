import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { quoteActor, QuoteError } from "@/lib/quote-access";
import { DashboardShell } from "@/components/DashboardShell";
import { QuoteLiveUpdates } from "@/components/QuoteLiveUpdates";
import "../dashboard/dashboard.css";
import "./sales.css";

export const metadata: Metadata = { title: "Sales workspace", robots: { index: false, follow: false }, referrer: "same-origin" };
export const dynamic = "force-dynamic";
export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  let actor;
  try { actor = await quoteActor(true); }
  catch (error) {
    if (error instanceof QuoteError && error.status === 401) redirect("/auth/signin/?callbackUrl=/sales/");
    if (error instanceof QuoteError && error.status === 403) return <main className="site-width sales-access"><p className="eyebrow">MDT / TEAM ACCESS</p><h1>This workspace is for your sales team.</h1><p>Your account needs sales or administrator access. Contact your site administrator to get set up.</p><Link href="/dashboard/" className="button button-red">Back to my account</Link></main>;
    throw error;
  }
  return <DashboardShell name={actor.name} email={actor.email} sales><QuoteLiveUpdates />{children}</DashboardShell>;
}
