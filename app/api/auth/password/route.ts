import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const { current, next } = await req.json();
    if (!current || !next || next.length < 8) {
      return NextResponse.json({ error: "Invalid input. New password must be at least 8 characters." }, { status: 400 });
    }
    const db = await getDb();
    const account = await db.collection("accounts").findOne({ email: session.user.email });
    if (!account?.passwordHash) {
      return NextResponse.json({ error: "Password change is not available for accounts created via Google." }, { status: 400 });
    }
    const valid = await bcrypt.compare(current, account.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    const passwordHash = await bcrypt.hash(next, 12);
    await db.collection("accounts").updateOne({ email: session.user.email }, { $set: { passwordHash, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }
}
