import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendPasswordSecurityEmail } from "@/lib/email";
import { isStrongPassword, passwordPolicyMessage } from "@/lib/password-policy";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Enter your current password and a valid new password." }, { status: 400 });
    }
    const { current, next } = body as Record<string, unknown>;
    if (typeof current !== "string" || !current || current.length > 200 || typeof next !== "string") {
      return NextResponse.json({ error: "Enter your current password and a new password." }, { status: 400 });
    }
    if (!isStrongPassword(next, { email: session.user.email, name: session.user.name || "" })) {
      return NextResponse.json({ error: passwordPolicyMessage }, { status: 400 });
    }
    if (next === current) return NextResponse.json({ error: "Choose a new password that’s different from your current one." }, { status: 400 });
    // Stops a hijacked session from brute-forcing the current password.
    if (!(await consumeRateLimit("password-change", session.user.email, 5, 900))) return tooManyRequests();
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
        $set: { passwordHash, passwordStrong: true, updatedAt: new Date() },
        $inc: { passwordVersion: 1 },
        $unset: { resetTokenHash: "", resetExpiresAt: "", resetRequestedAt: "" },
      },
    );
    if (!updated.modifiedCount) return NextResponse.json({ error: "Your password changed. Please sign in again." }, { status: 409 });
    try { await sendPasswordSecurityEmail(session.user.email, account.name || "", "changed"); }
    catch (mailError) { console.error("Password-change notice failed", mailError); }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Enter your current password and a valid new password." }, { status: 400 });
    }
    console.error("Password change failed", error);
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }
}
