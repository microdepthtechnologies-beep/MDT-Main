import { permanentRedirect } from "next/navigation";

export default async function LegacyProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/shop/?product=${encodeURIComponent(slug)}`);
}
export const dynamic = "force-dynamic";
