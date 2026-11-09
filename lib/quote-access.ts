import { ObjectId } from "mongodb";
import { auth } from "./auth";
import { getDb } from "./mongodb";

export class QuoteError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function quoteActor(sales = false) {
  const session = await auth();
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) throw new QuoteError("Please sign in to continue.", 401);
  const db = await getDb();
  const account = await db.collection("accounts").findOne({ _id: new ObjectId(session.user.id) }, { projection: { name: 1, email: 1, role: 1, passwordVersion: 1 } });
  if (!account) throw new QuoteError("Please sign in again.", 401);
  const staff = account.role === "sales" || account.role === "admin";
  if (sales && !staff) throw new QuoteError("This workspace is reserved for the sales team.", 403);
  return { id: account._id.toString(), email: String(account.email), name: String(account.name || account.email), staff, passwordVersion: account.passwordVersion || 0 };
}
export type QuoteActor = Awaited<ReturnType<typeof quoteActor>>;
export const ownerFilter = (actor: QuoteActor) => ({ $or: [{ userId: actor.id }, { userId: { $exists: false }, customerEmail: actor.email }] });
export function quoteApiError(error: unknown) {
  return Response.json({ error: error instanceof QuoteError ? error.message : "We couldn’t complete this action. Please try again." }, { status: error instanceof QuoteError ? error.status : 500 });
}
