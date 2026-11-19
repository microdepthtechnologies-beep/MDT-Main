import { readFile, stat } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

// Serve local uploads with long-lived immutable caching.
// On production VPS, Nginx handles this path directly — this route is the dev/fallback layer.

const UPLOADS_ROOT = path.resolve(
  process.env.UPLOADS_PATH ||
  path.join(process.cwd(), "..", "..", "uploads", "uploads"),
);

// Public media only. Logs, exports, plugin data, archives and scripts from the
// legacy WordPress library must never be reachable, whatever the source folder holds.
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
};
const BLOCKED_DIRECTORIES = new Set([
  "wc-logs", "woocommerce_uploads", "sucuri", "wpforms", "wpcf7_uploads", "wc-imports",
  "woo-product-feed-pro", "wpseo-redirects", "yith_ywraq", "ultimatemember", "addify-rfq",
]);
const notFound = () => new Response("Not found", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Security: no traversal, hidden files, encoded separators or blocked plugin folders.
  if (
    !segments.length ||
    segments.some(s => !s || s.startsWith(".") || /[\\/\0:]/.test(s)) ||
    BLOCKED_DIRECTORIES.has(segments[0].toLowerCase())
  ) return notFound();

  const ext = path.extname(segments[segments.length - 1]).slice(1).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return notFound();

  // Uploads are runtime media, not server code. Keep the separate media library
  // out of Turbopack's dependency tracing; UPLOADS_PATH must exist at runtime.
  const filePath = path.resolve(/*turbopackIgnore: true*/ UPLOADS_ROOT, ...segments);
  const relative = path.relative(UPLOADS_ROOT, filePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return notFound();

  try {
    if (!(await stat(filePath)).isFile()) return notFound();
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        // Images are content-addressed (WP adds dimensions to filenames) — safe to cache long-term
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // SVGs can carry script; render them as inert images only.
        ...(ext === "svg" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
      },
    });
  } catch {
    return notFound();
  }
}
