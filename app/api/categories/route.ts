import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const terms = await db.collection("terms")
    .find({ taxonomy: "product_cat" }, { projection: { _id: 0, wpTermId: 1, name: 1, slug: 1, description: 1, parentWpTermId: 1, count: 1 } })
    .sort({ name: 1 })
    .toArray();
  return NextResponse.json(terms);
}
