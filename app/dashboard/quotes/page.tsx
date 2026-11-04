import type { Metadata } from "next";
import { getDashboardQuotes } from "@/lib/dashboard";
import { DashboardQuotes } from "@/components/DashboardQuotes";

export const metadata: Metadata = { title: "My quotes" };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const [quotes, search] = await Promise.all([getDashboardQuotes(), searchParams]);
  return <DashboardQuotes key={`${search.q || ""}:${search.status || ""}`} quotes={quotes} initialQuery={search.q} initialStatus={search.status} />;
}
