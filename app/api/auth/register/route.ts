import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { sendWelcomeEmail } from "@/lib/email";
import { cleanText, ensureAccountIndexes, isDuplicateKey } from "@/lib/accounts";
import { isStrongPassword, passwordPolicyMessage } from "@/lib/password-policy";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Enter a valid name, email address and password." }, { status: 400 });
    }
    const { name: rawName, email, password } = body as Record<string, unknown>;
    const name = cleanText(rawName, 120);
    if (
      typeof rawName !== "string" || name.length < 2 ||
      typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json({ error: "Enter your full name and a valid email address." }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    if (!isStrongPassword(password, { email: normalized, name })) {
      return NextResponse.json({ error: passwordPolicyMessage }, { status: 400 });
    }
    // Throttle sign-up abuse (account spam, welcome-email bombing).
    if (!(await consumeRateLimit("register-ip", clientIp(req.headers), 5, 3600))) {
      return tooManyRequests("Too many accounts were created from this connection. Please try again in an hour.");
    }
    const db = await getDb();
    await ensureAccountIndexes(db);
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      await db.collection("accounts").insertOne({
        email: normalized,
        name,
        role: "customer",
        passwordHash,
        passwordStrong: true,
        passwordVersion: 0,
        provider: "credentials",
        emailVerified: null,
        createdAt: new Date(),
      });
    } catch (error) {
      if (isDuplicateKey(error)) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
      throw error;
    }
    try { await sendWelcomeEmail(normalized, name); }
    catch (mailError) { console.error("Welcome email failed", mailError); }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Enter a valid name, email address and password." }, { status: 400 });
    }
    console.error("Account registration failed", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
