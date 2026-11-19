import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Legacy plugin folders are no longer served at all, so they aren't advertised here.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/my-account", "/dashboard/", "/sales/", "/quote/", "/auth/"] },
    sitemap: "https://mdt.co.ke/sitemap.xml",
  };
}
