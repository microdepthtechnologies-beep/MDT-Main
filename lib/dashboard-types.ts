export type DashboardAccount = {
  name: string;
  email: string;
  company: string;
  phone: string;
  hasPassword: boolean;
  canSales?: boolean;
};

export const quoteStages = {
  submitted: { label: "Submitted", description: "Your request is recorded. Our team will review the products and your requirements." },
  reviewed: { label: "In review", description: "Our team is reviewing availability and preparing the details for your quotation." },
  quoted: { label: "Quoted", description: "Your quotation is ready. Review availability, prices and terms below, then accept or decline." },
  accepted: { label: "Accepted", description: "You accepted this quotation. Our team will arrange payment and delivery with you." },
  processing: { label: "In fulfilment", description: "Our team is preparing your products and coordinating delivery." },
  fulfilled: { label: "Fulfilled", description: "Your request has been fulfilled. Thank you for choosing MDT." },
  declined: { label: "Declined", description: "You declined this quotation. Contact us if your requirements change." },
  closed: { label: "Closed", description: "This request has been closed. Contact our team if you would like to revisit it." },
} as const;

export type QuoteStage = keyof typeof quoteStages;
export type DashboardQuote = {
  number: string;
  status: QuoteStage;
  createdAt: string;
  updatedAt: string;
  company: string;
  phone: string;
  message: string;
  items: { name: string; slug: string; sku: string; configuration: string; quantity: number }[];
  offer?: import("./quotation").IssuedQuotation;
  activity?: { at: string; label: string }[];
};

export function accountInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "M";
}

export function quoteDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi" });
}

export function quoteUnits(quote: DashboardQuote) {
  return quote.items.reduce((sum, item) => sum + item.quantity, 0);
}

export type ProfileResult = { ok: boolean; message: string };
