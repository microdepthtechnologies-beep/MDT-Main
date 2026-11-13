import { SoftwarePage } from "@/components/SoftwarePage";
import { getSiteContent } from "@/lib/site-content";
import { getSoftwarePageData } from "@/lib/software-clients";
import { pageMetadata } from "@/lib/site-seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("software");
  return pageMetadata(c.seo.title, c.seo.description, "/software-licenses/", c.hero.image);
}
export default async function Page() {
  const [content, { categories, clientsByCategory }] = await Promise.all([
    getSiteContent("software"),
    getSoftwarePageData(),
  ]);
  return <SoftwarePage content={content} categories={categories} clientsByCategory={clientsByCategory} />;
}
