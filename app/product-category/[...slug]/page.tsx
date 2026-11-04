import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CataloguePage } from "@/components/CataloguePage";
import { categoryHref, getCategories } from "@/lib/catalogue";
import type { SearchValues } from "@/lib/catalogue-filters";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<SearchValues> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const all = await getCategories();
  const category = all.find(c => c.slug === slug.at(-1));
  if (!category) return {};
  return { title: category.seo?.title || category.name, description: category.seo?.metaDescription || `Explore ${category.name} at Micro Depth Technologies. Expert specification, supply and support.`, alternates: { canonical: categoryHref(category, all) } };
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, search, categories] = await Promise.all([params, searchParams, getCategories()]);
  const category = categories.find(c => c.slug === slug.at(-1));
  if (!category) notFound();
  // Short aliases remain accessible, but arbitrary ancestor paths must not create duplicate archives.
  if (slug.length > 1 && categoryHref(category, categories) !== `/product-category/${slug.join("/")}/`) notFound();
  return <CataloguePage search={search} category={category} />;
}
