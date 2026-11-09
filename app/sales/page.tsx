import { quoteActor, QuoteError } from "@/lib/quote-access";
import { listSalesQuotes } from "@/lib/sales-quotes";
import { SalesWorkspace } from "@/components/SalesWorkspace";

export default async function SalesPage() {
  let actor;
  try {
    actor = await quoteActor(true);
  } catch (error) {
    if (error instanceof QuoteError) return null;
    throw error;
  }
  return <SalesWorkspace quotes={await listSalesQuotes()} email={actor.email} />;
}
