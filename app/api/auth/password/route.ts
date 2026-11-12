import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Enter your current password and a valid new password." }, { status: 400 });
    }
    const { current, next } = body as Record<string, unknown>;
    if (
      typeof current !== "string" || !current ||
      typeof next !== "string" || next.length < 8 || Buffer.byteLength(next, "utf8") > 72
    ) {
      return NextResponse.json({ error: "Use a new password of 8–72 bytes and enter your current password." }, { status: 400 });
    }
    const db = await getDb();
    const account = await db.collection("accounts").findOne({ email: session.user.email });
    if (!account?.passwordHash) {
      return NextResponse.json({ error: "Password change is not available for accounts created via Google." }, { status: 400 });
    }
    const valid = await bcrypt.compare(current, account.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    const passwordHash = await bcrypt.hash(next, 12);
    const updated = await db.collection("accounts").updateOne(
      { _id: account._id, passwordHash: account.passwordHash },
      {
        $set: { passwordHash, updatedAt: new Date() },
        $inc: { passwordVersion: 1 },
        $unset: { resetTokenHash: "", resetExpiresAt: "", resetRequestedAt: "" },
      },
    );
    if (!updated.modifiedCount) return NextResponse.json({ error: "Your password changed. Please sign in again." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Enter your current password and a valid new password." }, { status: 400 });
    }
    console.error("Password change failed", error);
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }
}
