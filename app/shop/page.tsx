import type { Metadata } from "next";
import { CataloguePage } from "@/components/CataloguePage";
import type { SearchValues } from "@/lib/catalogue-filters";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Business Technology & ICT Products",
  description: "Explore computing, networking, printing, servers and more at Micro Depth Technologies. Expert advice, supply and support for your business.",
  alternates: { canonical: "/shop/" },
};
export default async function Shop({ searchParams }: { searchParams: Promise<SearchValues> }) {
  return <CataloguePage search={await searchParams} />;
}
