import { ServicesPage } from "@/components/ServicesPage";
import { getSiteContent } from "@/lib/site-content";
import { pageMetadata } from "@/lib/site-seo";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("services");
  return pageMetadata(c.seo.title, c.seo.description, "/our-services/", c.hero.image);
}
export default async function Page() { return <ServicesPage content={await getSiteContent("services")} />; }
