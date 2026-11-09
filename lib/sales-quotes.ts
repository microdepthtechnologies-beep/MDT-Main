import { randomUUID } from "node:crypto";
import type { Document } from "mongodb";
import { getDb } from "./mongodb";
import { QuoteError, ownerFilter, type QuoteActor } from "./quote-access";
import { validateQuotation, quotationTotals, offerExpired, type IssuedQuotation, type SalesQuote } from "./quotation";
import { sendIssuedQuotation } from "./email";

type StoredQuote = Omit<SalesQuote, "createdAt" | "updatedAt" | "activity" | "revision"> & {
  createdAt: Date; updatedAt: Date; revision?: number; userId?: string;
  activity?: { at: Date; label: string; by: string }[];
};
const date = (value: unknown) => value instanceof Date ? value.toISOString() : String(value || "");
export function salesQuote(doc: Document): SalesQuote {
  return {
    number: doc.number, customerName: doc.customerName, customerEmail: doc.customerEmail,
    company: doc.company || "", phone: doc.phone || "", message: doc.message || "",
    items: doc.items, status: doc.status, revision: doc.revision || 0,
    createdAt: date(doc.createdAt), updatedAt: date(doc.updatedAt), draft: doc.draft, offer: doc.offer,
    assignedTo: doc.assignedTo || "", internalNote: doc.internalNote || "",
    delivery: doc.delivery, activity: (doc.activity || []).map((entry: Document) => ({ at: date(entry.at), label: entry.label, by: entry.by })),
    canRecoverEmail: doc.delivery?.state === "sending" && Date.parse(doc.delivery.at) < Date.now() - 120000,
  };
}
export async function listSalesQuotes() {
  const db = await getDb();
  return (await db.collection("quoteRequests").find({}).sort({ createdAt: -1 }).toArray()).map(salesQuote);
}
const revisionFilter = (revision: number) => revision === 0 ? { $or: [{ revision: 0 }, { revision: { $exists: false } }] } : { revision };
export async function updateSalesQuote(number: string, actor: QuoteActor, body: Record<string, unknown>) {
  if (!actor.staff) throw new QuoteError("Sales access required.", 403);
  const db = await getDb();
  const quotes = db.collection<StoredQuote>("quoteRequests");
  const doc = await quotes.findOne({ number });
  if (!doc) throw new QuoteError("Request not found.", 404);
  if (!Number.isInteger(body.revision) || body.revision !== (doc.revision || 0)) throw new QuoteError("This request changed. Reload the latest version before saving.", 409);
  const revision = body.revision as number;
  const now = new Date();
  const event = (label: string) => ({ at: now, label, by: actor.name });
  const filter = { _id: doc._id, ...revisionFilter(revision) };
  const action = body.action;
  if (doc.delivery?.state === "sending" && action !== "recover-email") throw new QuoteError("An email is being sent. Wait for delivery status before making changes.", 409);
  let set: Document = {};
  let label = "";
  let sendOffer: IssuedQuotation | undefined;
  if (action === "save" || action === "send") {
    if (!["submitted", "reviewed", "quoted"].includes(doc.status)) throw new QuoteError("This request can no longer be repriced.", 409);
    let draft;
    try { draft = validateQuotation(body.draft, doc.items, action === "send"); }
    catch (error) { throw new QuoteError(error instanceof Error ? error.message : "Invalid quotation."); }
    if (typeof body.internalNote !== "string" || body.internalNote.length > 4000) throw new QuoteError("Internal notes must be no longer than 4,000 characters.");
    set = { draft, internalNote: body.internalNote.trim(), assignedTo: doc.assignedTo || actor.email, status: doc.status === "submitted" ? "reviewed" : doc.status };
    label = "Quotation draft saved";
    if (action === "send") {
      sendOffer = { ...draft, ...quotationTotals(draft), id: randomUUID(), issuedAt: now.toISOString() };
      set = { ...set, offer: sendOffer, status: "quoted", delivery: { state: "sending", at: now.toISOString() } };
      label = "Quotation issued";
    }
  } else if (action === "recover-email") {
    if (doc.delivery?.state !== "sending" || Date.parse(doc.delivery.at) > now.getTime() - 120000) throw new QuoteError("Email delivery is still in progress.", 409);
    set = { delivery: { state: "failed", at: now.toISOString() } };
    label = "Interrupted email released — check delivery before retrying";
  } else if (action === "retry-email") {
    if (!doc.offer || doc.delivery?.state !== "failed") throw new QuoteError("Only a failed quotation email can be retried.", 409);
    sendOffer = doc.offer;
    set = { delivery: { state: "sending", at: now.toISOString() } };
    label = "Quotation email retried";
  } else if (action === "claim") {
    if (doc.assignedTo && doc.assignedTo !== actor.email) throw new QuoteError("This request is assigned to another colleague.", 409);
    set = { assignedTo: actor.email, status: doc.status === "submitted" ? "reviewed" : doc.status };
    label = "Request assigned";
  } else if (action === "status") {
    const allowed: Record<string, string[]> = { submitted: ["reviewed", "closed"], reviewed: ["closed"], quoted: ["closed"], accepted: ["processing", "closed"], processing: ["fulfilled", "closed"], declined: ["closed"] };
    if (typeof body.status !== "string" || !allowed[doc.status]?.includes(body.status)) throw new QuoteError("That status change is not available.", 409);
    set = { status: body.status };
    label = `Request ${body.status}`;
  } else throw new QuoteError("Unknown action.");

  const result = await quotes.updateOne(filter, {
    $set: { ...set, updatedAt: now }, $inc: { revision: 1 },
    $push: { activity: { $each: [event(label)], $slice: -200 } },
  });
  if (!result.modifiedCount) throw new QuoteError("A colleague updated this request. Reload and try again.", 409);
  let emailFailed = false;
  if (sendOffer) {
    try { await sendIssuedQuotation(salesQuote({ ...doc, ...set }), sendOffer); }
    catch { emailFailed = true; }
    await quotes.updateOne({ _id: doc._id, "offer.id": sendOffer.id }, {
      $set: { delivery: { state: emailFailed ? "failed" : "sent", at: new Date().toISOString() }, updatedAt: new Date() },
      $inc: { revision: 1 },
      $push: { activity: { $each: [event(emailFailed ? "Quotation email failed — retry required" : "Quotation email sent")], $slice: -200 } },
    });
  }
  return { quote: salesQuote((await quotes.findOne({ _id: doc._id }))!), emailFailed };
}

export async function respondToQuote(number: string, actor: QuoteActor, body: Record<string, unknown>) {
  if (!["accepted", "declined"].includes(String(body.action)) || typeof body.offerId !== "string") throw new QuoteError("Choose accept or decline.");
  const db = await getDb();
  const quotes = db.collection<StoredQuote>("quoteRequests");
  const doc = await quotes.findOne({ number, ...ownerFilter(actor) });
  if (!doc) throw new QuoteError("Request not found.", 404);
  if (doc.status !== "quoted" || !doc.offer || doc.offer.id !== body.offerId) throw new QuoteError("This quotation changed or has already been answered. Refresh to see its current status.", 409);
  if (offerExpired(doc.offer)) throw new QuoteError("This quotation has expired. Contact the sales team for an updated quotation.", 409);
  if (body.action === "accepted" && !doc.offer.lines.some((line: { quantity: number }) => line.quantity > 0)) throw new QuoteError("There are no available products to accept.");
  const now = new Date();
  const result = await quotes.updateOne({ _id: doc._id, status: "quoted", "offer.id": body.offerId }, {
    $set: { status: String(body.action), updatedAt: now }, $inc: { revision: 1 },
    $push: { activity: { $each: [{ at: now, label: `Quotation ${body.action}`, by: actor.name }], $slice: -200 } },
  });
  if (!result.modifiedCount) throw new QuoteError("This request changed. Please refresh.", 409);
}
