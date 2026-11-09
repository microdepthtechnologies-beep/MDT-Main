import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendQuoteEmails, type QuoteEmailData } from "@/lib/email";
import { getDashboardQuotes } from "@/lib/dashboard";
import { quoteActor, quoteApiError } from "@/lib/quote-access";

function quoteNumber() {
  return "MDT-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 899 + 100);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to request a quote." }, { status: 401 });
    }
    const body = await req.json();
    const { items, company, phone, message } = body;
    if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
      return NextResponse.json({ error: "Your quote cart is empty." }, { status: 400 });
    }
    const db = await getDb();
    const account = await db.collection("accounts").findOne({ email: session.user.email });
    if (!account) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const requestKey = typeof body.requestKey === "string" && /^[a-f0-9-]{36}$/i.test(body.requestKey) ? body.requestKey : undefined;
    if (requestKey) {
      await db.collection("quoteRequests").createIndex({ userId: 1, requestKey: 1 }, { unique: true, partialFilterExpression: { requestKey: { $type: "string" } } });
      const existing = await db.collection("quoteRequests").findOne({ userId: session.user.id, requestKey });
      if (existing) return NextResponse.json({ ok: true, number: existing.number, emailPending: existing.requestEmailStatus !== "sent" });
    }
    if (items.some(i => !i || typeof i !== "object" || typeof i.name !== "string" || !i.name.trim() || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10000)) {
      return NextResponse.json({ error: "Check the products and quantities in your request." }, { status: 400 });
    }
    const number = quoteNumber();
    const record = {
      number,
      ...(requestKey ? { requestKey } : {}),
      requestEmailStatus: "pending",
      userId: session.user.id,
      accountId: account?._id,
      customerEmail: session.user.email,
      customerName: account?.name || session.user.name || session.user.email,
      company: typeof company === "string" ? company.trim().slice(0, 200) : "",
      phone: typeof phone === "string" ? phone.trim().slice(0, 50) : "",
      message: typeof message === "string" ? message.trim().slice(0, 4000) : "",
      items: items.map((i: unknown) => ({
        name: String((i as Record<string, unknown>).name || "").slice(0, 300),
        slug: String((i as Record<string, unknown>).slug || "").slice(0, 300),
        sku: String((i as Record<string, unknown>).sku || "").slice(0, 100),
        configuration: String((i as Record<string, unknown>).configuration || "").slice(0, 1000),
        quantity: Math.max(1, Number((i as Record<string, unknown>).quantity || 1)),
      })),
      status: "submitted",
      revision: 0,
      activity: [{ at: new Date(), label: "Request submitted", by: account.name || session.user.email }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try { await db.collection("quoteRequests").insertOne(record); }
    catch (error) {
      if (requestKey && typeof error === "object" && error && "code" in error && error.code === 11000) {
        const existing = await db.collection("quoteRequests").findOne({ userId: session.user.id, requestKey });
        if (existing) return NextResponse.json({ ok: true, number: existing.number, emailPending: existing.requestEmailStatus !== "sent" });
      }
      throw error;
    }
    const emailData: QuoteEmailData = {
      quoteNumber: number,
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      company: record.company,
      phone: record.phone,
      message: record.message,
      items: record.items,
    };
    let emailPending = false;
    try { await sendQuoteEmails(emailData); } catch { emailPending = true; }
    await db.collection("quoteRequests").updateOne({ number }, { $set: { requestEmailStatus: emailPending ? "failed" : "sent" } });
    return NextResponse.json({ ok: true, number, emailPending });
  } catch (e) {
    console.error("Quote submission failed", e);
    return NextResponse.json({ error: "Could not send your quote request. Please try again or contact us directly." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await quoteActor();
    return NextResponse.json({ quotes: await getDashboardQuotes() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return quoteApiError(error); }
}
