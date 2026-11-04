import type { Metadata } from "next";
import { contact } from "@/data/company";
import { editorialMedia } from "@/data/editorial-media";

export const siteOrigin = "https://mdt.co.ke";
export function pageMetadata(title: string, description: string, path: string, image = editorialMedia.hero): Metadata {
  return {
    title: { absolute: title }, description,
    alternates: { canonical: `${siteOrigin}${path}` },
    openGraph: { title, description, url: `${siteOrigin}${path}`, siteName: "Micro Depth Technologies", locale: "en_KE", type: "website", images: [{ url: `${siteOrigin}${image}` }] },
    twitter: { card: "summary_large_image", title, description, images: [`${siteOrigin}${image}`] },
  };
}

export const organisationSchema = {
  "@context": "https://schema.org", "@type": "Organization", "@id": `${siteOrigin}/#organization`,
  name: "Micro Depth Technologies Limited", alternateName: "MDT", url: siteOrigin,
  logo: `${siteOrigin}/wp-content/uploads/2024/09/MDT-Logo-Red-1680px-613px.webp`,
  email: contact.email, telephone: contact.phoneIntl, sameAs: [contact.linkedin],
  address: { "@type": "PostalAddress", streetAddress: `${contact.address}, ${contact.addressLine2}`, addressLocality: "Nairobi", addressCountry: "KE" },
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${siteOrigin}${item.path}` })) };
}
