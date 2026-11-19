import { createHash } from "node:crypto";
import { getDb } from "./mongodb";

// Fixed-window limiter backed by MongoDB so limits hold across serverless
// instances and VPS restarts. Keys are hashed: no raw emails or IPs at rest.
let indexReady: Promise<unknown> | undefined;
async function collection() {
  const db = await getDb();
  const col = db.collection<{ _id: string; count: number; expiresAt: Date }>("rateLimits");
  indexReady ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(error => { indexReady = undefined; throw error; });
  await indexReady;
  return col;
}
const keyFor = (scope: string, subject: string, windowSeconds: number) => {
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  return `${scope}:${createHash("sha256").update(subject.toLowerCase()).digest("hex").slice(0, 32)}:${window}`;
};

/** Records one attempt and reports whether the caller is still within the limit. */
export async function consumeRateLimit(scope: string, subject: string, limit: number, windowSeconds: number) {
  const col = await collection();
  const _id = keyFor(scope, subject, windowSeconds);
  const doc = await col.findOneAndUpdate(
    { _id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + windowSeconds * 1000) } },
    { upsert: true, returnDocument: "after" },
  );
  return (doc?.count ?? 1) <= limit;
}

/** Checks a limit without recording an attempt (e.g. only failed logins count). */
export async function isRateLimited(scope: string, subject: string, limit: number, windowSeconds: number) {
  const col = await collection();
  const doc = await col.findOne({ _id: keyFor(scope, subject, windowSeconds) });
  return (doc?.count ?? 0) >= limit;
}

export async function clearRateLimit(scope: string, subject: string, windowSeconds: number) {
  const col = await collection();
  await col.deleteOne({ _id: keyFor(scope, subject, windowSeconds) });
}

export const tooManyRequests = (message = "Too many attempts. Please wait a few minutes and try again.") =>
  Response.json({ error: message }, { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } });
