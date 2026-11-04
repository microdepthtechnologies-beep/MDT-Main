import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getDb } from "./mongodb";
import { quoteStages, type DashboardAccount, type DashboardQuote, type QuoteStage } from "./dashboard-types";

export const getDashboardAccount = cache(async (): Promise<DashboardAccount> => {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin/?callbackUrl=/dashboard/");
  const db = await getDb();
  const account = await db.collection("accounts").findOne(
    { email: session.user.email },
    { projection: { name: 1, company: 1, phone: 1, passwordHash: 1 } },
  );
  return {
    name: account?.name || session.user.name || "Your account",
    email: session.user.email,
    company: account?.company || "",
    phone: account?.phone || "",
    hasPassword: !!account?.passwordHash,
  };
});

export const getDashboardQuotes = cache(async (): Promise<DashboardQuote[]> => {
  const account = await getDashboardAccount();
  const db = await getDb();
  // An explicit customer-facing projection keeps internal pricing and sales notes out.
  const rows = await db.collection("quoteRequests").find({ customerEmail: account.email }, {
    projection: {
      _id: 0, number: 1, status: 1, createdAt: 1, updatedAt: 1,
      company: 1, phone: 1, message: 1,
      "items.name": 1, "items.slug": 1, "items.sku": 1, "items.configuration": 1, "items.quantity": 1,
    },
  }).sort({ createdAt: -1 }).toArray();
  const date = (value: unknown) => {
    const parsed = new Date(String(value || ""));
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  };
  return rows.map(row => ({
    number: String(row.number),
    status: Object.hasOwn(quoteStages, row.status) ? row.status as QuoteStage : "submitted",
    createdAt: date(row.createdAt), updatedAt: date(row.updatedAt || row.createdAt),
    company: String(row.company || ""), phone: String(row.phone || ""), message: String(row.message || ""),
    items: (Array.isArray(row.items) ? row.items : []).map(item => ({
      name: String(item.name || "Product"), slug: String(item.slug || ""),
      sku: String(item.sku || ""), configuration: String(item.configuration || ""),
      quantity: Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1,
    })),
  }));
});
