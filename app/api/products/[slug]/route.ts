import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { cleanProduct, type Product } from "@/lib/catalogue";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const product = await db.collection<Product>("products").findOne({ slug, status: "publish" });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cleanProduct(product));
}
