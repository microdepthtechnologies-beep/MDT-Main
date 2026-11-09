import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Db } from "mongodb";

export const resetRequestMessage = "If this email belongs to an account with a password, a reset link will arrive shortly. Check your inbox and spam folder.";
export const invalidResetMessage = "This reset link is invalid, expired or already used. Please request a new link.";
export const resetTokenIsValid = (token: unknown): token is string => typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export function resetPasswordIsValid(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && Buffer.byteLength(password, "utf8") <= 72;
}

/** Use a configured origin, never the incoming Host header, for recovery links. */
export function passwordResetUrl(token: string) {
  const configured = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!configured && process.env.NODE_ENV === "production") throw new Error("Missing account recovery origin");
  const origin = new URL(configured || "http://localhost:3000");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (origin.username || origin.password || (origin.protocol !== "https:" && !(local && origin.protocol === "http:"))) {
    throw new Error("Invalid account recovery origin");
  }
  const url = new URL("/auth/reset-password/", origin.origin);
  url.searchParams.set("token", token);
  return url.href;
}

export async function requestPasswordReset(
  db: Db,
  email: string,
  send: (email: string, url: string) => Promise<void>,
) {
  const now = new Date();
  // Shared, durable rate limit; unknown addresses follow the same path.
  const limits = db.collection<{ _id: string; count: number; expiresAt: Date }>("passwordResetLimits");
  await limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const window = Math.floor(now.getTime() / 3_600_000);
  const limit = await limits.findOneAndUpdate(
    { _id: `${digest(email)}:${window}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 3_600_000) } },
    { upsert: true, returnDocument: "after" },
  );
  if (!limit || limit.count > 5) return;

  const token = randomBytes(32).toString("hex");
  const url = passwordResetUrl(token);
  const tokenHash = digest(token);
  // One current link per account, at most one email per minute. No account creation.
  const account = await db.collection("accounts").findOneAndUpdate(
    {
      email,
      passwordHash: { $type: "string" },
      $or: [
        { resetRequestedAt: { $exists: false } },
        { resetRequestedAt: { $lte: new Date(now.getTime() - 60_000) } },
      ],
    },
    { $set: { resetTokenHash: tokenHash, resetExpiresAt: new Date(now.getTime() + 30 * 60_000), resetRequestedAt: now } },
    { projection: { _id: 1 } },
  );
  if (!account) return;
  try {
    await send(email, url);
  } catch {
    // Do not expose SMTP details or reveal whether the account exists.
    await db.collection("accounts").updateOne(
      { _id: account._id, resetTokenHash: tokenHash },
      { $unset: { resetTokenHash: "", resetExpiresAt: "", resetRequestedAt: "" } },
    );
    console.error("Password reset email delivery failed. Check SMTP configuration and connectivity.");
  }
}

export async function completePasswordReset(db: Db, token: string, password: string) {
  if (!resetTokenIsValid(token) || !resetPasswordIsValid(password)) return false;
  const accounts = db.collection("accounts");
  const filter = { resetTokenHash: digest(token), resetExpiresAt: { $gt: new Date() }, passwordHash: { $type: "string" } };
  const account = await accounts.findOne(filter, { projection: { _id: 1, passwordHash: 1 } });
  if (!account) return false;
  const passwordHash = await bcrypt.hash(password, 12);
  // Consume the token and change the password in the SAME atomic write.
  const result = await accounts.updateOne(
    { ...filter, _id: account._id, passwordHash: account.passwordHash, resetExpiresAt: { $gt: new Date() } },
    {
      $set: { passwordHash, updatedAt: new Date() },
      $inc: { passwordVersion: 1 },
      $unset: { resetTokenHash: "", resetExpiresAt: "" },
    },
  );
  return result.modifiedCount === 1;
}
