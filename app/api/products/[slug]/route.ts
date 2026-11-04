import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const product = await db.collection("products").findOne({ slug });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
