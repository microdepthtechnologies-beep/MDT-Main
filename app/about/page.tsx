import { AboutPage } from "@/components/AboutPage";
import { getSiteContent } from "@/lib/site-content";
import { pageMetadata, organisationSchema } from "@/lib/site-seo";
import { StructuredData } from "@/components/StructuredData";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await getSiteContent("about");
  return pageMetadata(c.seo.title, c.seo.description, "/about/", c.hero.image);
}
export default async function Page() {
  return <><StructuredData value={organisationSchema} /><AboutPage content={await getSiteContent("about")} /></>;
}
