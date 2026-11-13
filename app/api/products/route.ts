import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const db = await getDb();
  const filter: Record<string, unknown> = { status: "publish" };
  const literal = (value: string) => value.slice(0, 160).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (sp.get("category")) filter["categories.slug"] = sp.get("category")!.slice(0, 160);
  if (sp.get("tag")) filter["tags.slug"] = sp.get("tag")!.slice(0, 160);
  if (sp.get("brand")) filter["attributes.brand"] = new RegExp(`^${literal(sp.get("brand")!)}$`, "i");
  if (sp.get("search")) filter.name = new RegExp(literal(sp.get("search")!), "i");
  if (sp.get("featured") === "1") filter.featured = true;

  const pageParam = sp.get("page");
  const limitParam = sp.get("limit");
  const pageValue = pageParam === null ? 1 : Number(pageParam);
  const limitValue = limitParam === null ? 24 : Number(limitParam);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(100000, pageValue) : 1;
  const limit = Number.isSafeInteger(limitValue) && limitValue > 0 ? Math.min(100, limitValue) : 24;
  const col = db.collection("products");
  const [items, total] = await Promise.all([
    col.find(filter, { projection: { description: 0 } })
       .sort({ menuOrder: 1, name: 1 })
       .skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}
