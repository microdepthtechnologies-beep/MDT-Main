import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { cleanProduct, type Product } from "@/lib/catalogue";
import { contentHtml } from "@/lib/content-html";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const product = await db.collection<Product>("products").findOne({ slug, status: "publish" });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const cleaned = cleanProduct(product);
  return NextResponse.json({ ...cleaned, description: contentHtml(cleaned.description), shortDescription: contentHtml(cleaned.shortDescription) });
}
