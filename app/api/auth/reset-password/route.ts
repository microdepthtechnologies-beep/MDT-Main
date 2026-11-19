import { getDb } from "@/lib/mongodb";
import { sendPasswordSecurityEmail } from "@/lib/email";
import { completePasswordReset, invalidResetMessage, resetPasswordIsValid, resetTokenIsValid } from "@/lib/password-reset";
import { passwordPolicyMessage } from "@/lib/password-policy";
import { consumeRateLimit, tooManyRequests } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!resetTokenIsValid(body?.token)) {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }
  if (!resetPasswordIsValid(body?.password)) {
    return Response.json({ error: passwordPolicyMessage }, { status: 400 });
  }
  try {
    if (!(await consumeRateLimit("reset-ip", clientIp(req.headers), 10, 900))) return tooManyRequests();
    const updated = await completePasswordReset(await getDb(), body.token, body.password);
    if (!updated) return Response.json({ error: invalidResetMessage }, { status: 400 });
    try { await sendPasswordSecurityEmail(updated.email, updated.name, "reset"); }
    catch (mailError) { console.error("Password-reset notice failed", mailError); }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "We couldn’t reset your password. Please try again shortly." }, { status: 503 });
  }
}
