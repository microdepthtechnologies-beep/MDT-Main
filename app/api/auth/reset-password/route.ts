import { getDb } from "@/lib/mongodb";
import { completePasswordReset, invalidResetMessage, resetPasswordIsValid, resetTokenIsValid } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!resetTokenIsValid(body?.token)) {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }
  if (!resetPasswordIsValid(body?.password)) {
    return Response.json({ error: "Use at least 8 characters and no more than 72 bytes for your password." }, { status: 400 });
  }
  try {
    const updated = await completePasswordReset(await getDb(), body.token, body.password);
    if (!updated) return Response.json({ error: invalidResetMessage }, { status: 400 });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "We couldn’t reset your password. Please try again shortly." }, { status: 503 });
  }
}
