import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid input. Password must be at least 8 characters." }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
