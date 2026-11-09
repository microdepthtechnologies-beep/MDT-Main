import { quoteActor, quoteApiError, QuoteError } from "@/lib/quote-access";
import { getDb } from "@/lib/mongodb";
import { salesQuote, updateSalesQuote } from "@/lib/sales-quotes";

export const runtime = "nodejs";
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  try {
    await quoteActor(true);
    const { number } = await params;
    const doc = await (await getDb()).collection("quoteRequests").findOne({ number });
    if (!doc) throw new QuoteError("Request not found.", 404);
    return Response.json({ quote: salesQuote(doc) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return quoteApiError(error); }
}
export async function POST(req: Request, { params }: { params: Promise<{ number: string }> }) {
  try {
    const actor = await quoteActor(true);
    const { number } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new QuoteError("Invalid request.");
    return Response.json(await updateSalesQuote(number, actor, body), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return quoteApiError(error); }
}
