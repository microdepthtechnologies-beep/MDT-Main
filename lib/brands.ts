import { getDb } from "./mongodb";

export interface Brand {
  wpId: number;
  title: string;
  slug: string;
  imageUrl: string | null;
}

export interface Testimonial {
  wpId: number;
  /** Service category name, e.g. "Network Infrastructure" */
  title: string;
  content: string;
  imageUrl: string | null;
}

/**
 * wpIds of clients categorised as "Our Brands" (term 738) or "partners" (term 125).
 * Derived from wpur_term_relationships — maintained here to avoid a join query.
 */
const BRAND_WP_IDS = [
  48, 54, 55, 56, 57, 442, 456, 458, 460, 462, 464, 469, 470,
  2649, 2653, 2654, 2732, 2737, 2756, 2770,
  5699, 5701, 5702, 5704, 5706, 5713, 5714, 5715, 5716, 5717,
];

export async function getBrands(): Promise<Brand[]> {
  const db = await getDb();
  const docs = await db
    .collection("clients")
    .find({ wpId: { $in: BRAND_WP_IDS }, status: "publish" })
    .project({ wpId: 1, title: 1, slug: 1, featuredImage: 1, menuOrder: 1 })
    .sort({ menuOrder: 1, title: 1 })
    .toArray();

  // Deduplicate by normalised title (Cisco has two entries in the source data)
  const seen = new Set<string>();
  return docs
    .filter((doc) => {
      const key = doc.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((doc) => ({
      wpId: Number(doc.wpId),
      title: String(doc.title),
      slug: String(doc.slug),
      imageUrl: doc.featuredImage?.url ?? null,
    }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const db = await getDb();
  const docs = await db
    .collection("testimonials")
    .find({ status: "publish" })
    .project({ wpId: 1, title: 1, content: 1, featuredImage: 1 })
    .sort({ wpId: -1 })
    .toArray();

  return docs.map((doc) => ({
    wpId: Number(doc.wpId),
    title: String(doc.title),
    content: String(doc.content),
    imageUrl: doc.featuredImage?.url ?? null,
  }));
}
