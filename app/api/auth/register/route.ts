import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Enter a valid name, email address and password." }, { status: 400 });
    }
    const { name, email, password } = body as Record<string, unknown>;
    if (
      typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120 ||
      typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json({ error: "Enter a valid name and email address, and use a password of 8–72 bytes." }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    const db = await getDb();
    const existing = await db.collection("accounts").findOne({ email: normalized });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db.collection("accounts").insertOne({
      email: normalized,
      name: name.trim(),
      role: "customer",
      passwordHash,
      provider: "credentials",
      emailVerified: null,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Enter a valid name, email address and password." }, { status: 400 });
    }
    console.error("Account registration failed", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
