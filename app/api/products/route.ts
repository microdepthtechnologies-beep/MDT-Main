import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const db = await getDb();
  const filter: Record<string, unknown> = { status: "publish" };
  if (sp.get("category")) filter["categories.slug"] = sp.get("category");
  if (sp.get("tag")) filter["tags.slug"] = sp.get("tag");
  if (sp.get("brand")) filter["attributes.brand"] = new RegExp(`^${sp.get("brand")}$`, "i");
  if (sp.get("search")) filter.name = new RegExp(sp.get("search")!, "i");
  if (sp.get("featured") === "1") filter.featured = true;

  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(100, Number(sp.get("limit")) || 24);
  const col = db.collection("products");
  const [items, total] = await Promise.all([
    col.find(filter, { projection: { description: 0 } })
       .sort({ menuOrder: 1, name: 1 })
       .skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}
