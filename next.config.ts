import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// No third-party scripts, frames or API calls are used, so the policy can stay tight.
// 'unsafe-inline' is required for Next.js's inline bootstrap and the theme script.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // HTTPS only for two years. includeSubDomains is omitted on purpose until every
  // *.mdt.co.ke service (webmail, cPanel, etc.) is confirmed to serve HTTPS.
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Signed-in pages and API responses must never be stored by shared caches.
      { source: "/(dashboard|sales|auth|api)/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Legacy SVG uploads may contain script; render them as inert images.
      { source: "/wp-content/:path*.svg", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }] },
    ];
  },
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
      { source: "/request-quote", destination: "/quote/checkout/", permanent: true },
      { source: "/request-a-quote", destination: "/quote/checkout/", permanent: true },
      { source: "/blog/page/:page(\\d+)", destination: "/blog/?page=:page", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
    ];
  },

  images: {
    // localPatterns omitted → allows all local paths (logo.png, /wp-content/uploads/*, etc.)
    // MEDIA_BASE_URL (S3/CloudFront) is whitelisted so next/image can optimise CDN media.
    remotePatterns: process.env.MEDIA_BASE_URL
      ? [{ protocol: "https", hostname: new URL(process.env.MEDIA_BASE_URL).hostname }]
      : [],
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
