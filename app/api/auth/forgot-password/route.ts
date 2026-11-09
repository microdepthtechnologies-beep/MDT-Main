import { getDb } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";
import { requestPasswordReset, resetRequestMessage } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  try {
    await requestPasswordReset(await getDb(), email, sendPasswordResetEmail);
    return Response.json({ message: resetRequestMessage }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Password recovery is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
