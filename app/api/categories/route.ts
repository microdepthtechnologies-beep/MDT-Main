import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const terms = await db.collection("terms")
    .find({ taxonomy: "product_cat" })
    .sort({ name: 1 })
    .toArray();
  return NextResponse.json(terms);
}
