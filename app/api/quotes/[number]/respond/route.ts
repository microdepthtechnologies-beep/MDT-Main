import { quoteActor, quoteApiError, QuoteError } from "@/lib/quote-access";
import { respondToQuote } from "@/lib/sales-quotes";

export async function POST(req: Request, { params }: { params: Promise<{ number: string }> }) {
  try {
    const actor = await quoteActor();
    const { number } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") throw new QuoteError("Invalid response.");
    await respondToQuote(number, actor, body);
    return Response.json({ ok: true });
  } catch (error) { return quoteApiError(error); }
}
