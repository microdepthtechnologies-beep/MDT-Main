import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/home-design-concept", destination: "/", permanent: true },
      { source: "/about-us", destination: "/about/", permanent: true },
      { source: "/about-design-concept", destination: "/about/", permanent: true },
      { source: "/software-and-licenses-design", destination: "/software-licenses/", permanent: true },
      { source: "/software-and-licenses", destination: "/software-licenses/", permanent: true },
      { source: "/services", destination: "/our-services/", permanent: true },
      { source: "/products", destination: "/shop/", permanent: true },
      { source: "/blog/page/:page(\\d+)", destination: "/blog/?page=:page", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
    ];
  },

  images: {
    // localPatterns omitted → allows all local paths (logo.png, /wp-content/uploads/*, etc.)
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 512],
    // Resize local originals for responsive cards, galleries and thumbnails.
    unoptimized: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
