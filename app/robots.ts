import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/my-account", "/dashboard/", "/quote/", "/wp-content/uploads/wc-logs/", "/wp-content/uploads/woocommerce_uploads/", "/wp-content/uploads/wpforms/"] },
    sitemap: "https://mdt.co.ke/sitemap.xml",
  };
}
