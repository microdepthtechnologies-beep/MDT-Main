import type { Db } from "mongodb";

// One account per email, enforced by the database (not just a read-then-write
// check), so simultaneous sign-ups can't create duplicate or shadow accounts.
let ready: Promise<unknown> | undefined;
export function ensureAccountIndexes(db: Db) {
  ready ??= db.collection("accounts").createIndex({ email: 1 }, { unique: true, name: "email_unique" })
    .catch(error => { ready = undefined; throw error; });
  return ready;
}

/** Strips control characters (incl. CR/LF used for email header injection) and collapses whitespace. */
export const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

export const isDuplicateKey = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
