import { notFound } from "next/navigation";
import { quoteActor, QuoteError } from "@/lib/quote-access";
import { getDb } from "@/lib/mongodb";
import { salesQuote } from "@/lib/sales-quotes";
import { SalesQuoteEditor } from "@/components/SalesQuoteEditor";

export default async function SalesQuotePage({ params }: { params: Promise<{ number: string }> }) {
  try { await quoteActor(true); } catch (error) { if (error instanceof QuoteError) return null; throw error; }
  const { number } = await params;
  const doc = await (await getDb()).collection("quoteRequests").findOne({ number });
  if (!doc) notFound();
  return <SalesQuoteEditor quote={salesQuote(doc)} />;
}
