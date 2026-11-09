export const availabilityLabels = { available: "Available", backorder: "On order", unavailable: "Unavailable" } as const;
export type Availability = keyof typeof availabilityLabels;
export type RequestItem = { name: string; slug: string; sku: string; configuration: string; quantity: number };
export type QuotationLine = { availability: Availability; quantity: number; unitPrice: number; note: string };
export type Quotation = {
  lines: QuotationLine[]; currency: "KES"; taxRate: number; deliveryFee: number;
  validUntil: string; leadTime: string; terms: string; note: string;
};
export type IssuedQuotation = Quotation & { id: string; issuedAt: string; subtotal: number; tax: number; total: number };
export type QuoteActivity = { at: string; label: string; by: string };
export type SalesQuote = {
  number: string; customerName: string; customerEmail: string; company: string; phone: string; message: string;
  items: RequestItem[]; status: string; revision: number; createdAt: string; updatedAt: string;
  draft?: Quotation; offer?: IssuedQuotation; internalNote: string; assignedTo: string;
  activity: QuoteActivity[]; delivery?: { state: "sending" | "sent" | "failed"; at: string };
  canRecoverEmail?: boolean;
};

export function money(minor: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(minor / 100);
}
export function quotationTotals(quote: Quotation) {
  const subtotal = quote.lines.reduce((sum, line) => sum + (line.availability === "unavailable" ? 0 : line.quantity * line.unitPrice), 0);
  const tax = Math.round((subtotal + quote.deliveryFee) * quote.taxRate / 100);
  return { subtotal, tax, total: subtotal + quote.deliveryFee + tax };
}
export function blankQuotation(items: RequestItem[]): Quotation {
  return {
    lines: items.map(item => ({ availability: "available", quantity: item.quantity, unitPrice: 0, note: "" })),
    currency: "KES", taxRate: 0, deliveryFee: 0, validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    leadTime: "", terms: "", note: "",
  };
}
export function offerExpired(offer: Pick<Quotation, "validUntil">, now = Date.now()) {
  return new Date(`${offer.validUntil}T23:59:59+03:00`).getTime() < now;
}
export function validateQuotation(input: unknown, items: RequestItem[], sending = false): Quotation {
  if (!input || typeof input !== "object") throw new Error("Enter the quotation details.");
  const q = input as Record<string, unknown>;
  const text = (v: unknown, max: number) => {
    if (typeof v !== "string" || v.length > max) throw new Error(`Text must be no longer than ${max} characters.`);
    return v.trim();
  };
  const integer = (v: unknown, max: number) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0 && v <= max;
  if (!Array.isArray(q.lines) || q.lines.length !== items.length) throw new Error("Every requested product needs an availability decision.");
  const lines = q.lines.map((raw: unknown, index) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid product details.");
    const line = raw as QuotationLine;
    if (!Object.hasOwn(availabilityLabels, line.availability)) throw new Error("Select availability for each product.");
    if (!integer(line.quantity, items[index].quantity) || !integer(line.unitPrice, 1_000_000_000)) throw new Error("Check product quantities and prices.");
    if (line.availability !== "unavailable" && (line.quantity < 1 || (sending && line.unitPrice < 1))) throw new Error("Available and on-order products need a quantity and price before sending.");
    if (sending && line.availability === "backorder" && !String(q.leadTime || "").trim()) throw new Error("Include an expected lead time for products on order.");
    return { availability: line.availability, quantity: line.availability === "unavailable" ? 0 : line.quantity, unitPrice: line.availability === "unavailable" ? 0 : line.unitPrice, note: text(line.note, 500) };
  });
  if (q.currency !== "KES" || !integer(q.deliveryFee, 100_000_000) || typeof q.taxRate !== "number" || !Number.isFinite(q.taxRate) || q.taxRate < 0 || q.taxRate > 100) throw new Error("Check currency, delivery charge and tax rate.");
  const validUntil = text(q.validUntil, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil) || new Date(validUntil).toISOString().slice(0, 10) !== validUntil) throw new Error("Enter a valid quotation expiry date.");
  if (sending && offerExpired({ validUntil })) throw new Error("Choose an expiry date that has not passed.");
  const quotation: Quotation = { lines, currency: "KES", deliveryFee: q.deliveryFee as number, taxRate: q.taxRate, validUntil, leadTime: text(q.leadTime, 500), terms: text(q.terms, 2000), note: text(q.note, 2000) };
  if (!Number.isSafeInteger(quotationTotals(quotation).total)) throw new Error("The quotation total is too large.");
  return quotation;
}
