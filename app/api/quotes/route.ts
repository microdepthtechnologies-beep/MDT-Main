import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendQuoteEmails, type QuoteEmailData } from "@/lib/email";

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
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your quote cart is empty." }, { status: 400 });
    }
    const db = await getDb();
    const account = await db.collection("accounts").findOne({ email: session.user.email });
    const number = quoteNumber();
    const record = {
      number,
      userId: session.user.id,
      accountId: account?._id,
      customerEmail: session.user.email,
      customerName: account?.name || session.user.name || session.user.email,
      company: company?.trim() || "",
      phone: phone?.trim() || "",
      message: message?.trim() || "",
      items: items.map((i: unknown) => ({
        name: String((i as Record<string, unknown>).name || ""),
        slug: String((i as Record<string, unknown>).slug || ""),
        sku: String((i as Record<string, unknown>).sku || ""),
        configuration: String((i as Record<string, unknown>).configuration || ""),
        quantity: Math.max(1, Number((i as Record<string, unknown>).quantity || 1)),
      })),
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("quoteRequests").insertOne(record);
    const emailData: QuoteEmailData = {
      quoteNumber: number,
      customerName: record.customerName,
      customerEmail: record.customerEmail,
      company: record.company,
      phone: record.phone,
      message: record.message,
      items: record.items,
    };
    await sendQuoteEmails(emailData);
    return NextResponse.json({ ok: true, number });
  } catch (e) {
    console.error("Quote submission failed", e);
    return NextResponse.json({ error: "Could not send your quote request. Please try again or contact us directly." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const quotes = await db.collection("quoteRequests")
    .find({ customerEmail: session.user.email })
    .sort({ createdAt: -1 })
    .project({ _id: 0 })
    .toArray();
  return NextResponse.json({ quotes });
}
