import { SoftwarePage } from "@/components/SoftwarePage";
import { getSiteContent } from "@/lib/site-content";
import { getSoftwareProducts } from "@/lib/software-products";
import { pageMetadata } from "@/lib/site-seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("software");
  return pageMetadata(c.seo.title, c.seo.description, "/software-licenses/", c.hero.image);
}
export default async function Page() {
  const content = await getSiteContent("software");
  return <SoftwarePage content={content} {...await getSoftwareProducts(content.products)} />;
}
