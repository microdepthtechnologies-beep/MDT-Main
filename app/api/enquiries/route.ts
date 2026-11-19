import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendEnquiryEmails } from "@/lib/email";
import { cleanText } from "@/lib/accounts";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

const multiline = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please complete the form and try again." }, { status: 400 });
  }
  // Honeypot — real visitors never fill this in.
  if (cleanText(body.website, 100)) {
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }
  // Single-line fields lose CR/LF so they can't inject email headers.
  const enquiry = {
    name: cleanText(body.name, 120),
    company: cleanText(body.company, 200),
    email: cleanText(body.email, 254).toLowerCase(),
    interest: cleanText(body.interest, 160),
    message: multiline(body.message, 4000),
  };
  if (
    enquiry.name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) ||
    !enquiry.interest ||
    enquiry.message.length < 10
  ) {
    return NextResponse.json({ error: "Please check the highlighted fields and try again." }, { status: 400 });
  }
  try {
    // Prevents the form being used to flood the sales inbox or to send
    // confirmation emails to people who never contacted MDT.
    const [perSource, perAddress] = await Promise.all([
      consumeRateLimit("enquiry-ip", clientIp(req.headers), 5, 3600),
      consumeRateLimit("enquiry-email", enquiry.email, 3, 86400),
    ]);
    if (!perSource || !perAddress) return tooManyRequests("You’ve sent several enquiries recently. Please wait a while, or email sales@mdt.co.ke directly.");
    const db = await getDb();
    await db.collection("enquiries").insertOne({ ...enquiry, createdAt: new Date() });
    await sendEnquiryEmails(enquiry);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Enquiry submission failed", error);
    return NextResponse.json(
      { error: "We couldn't send your enquiry right now. Please email sales@mdt.co.ke or call 0748 489 784." },
      { status: 503 },
    );
  }
}
