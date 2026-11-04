import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { existsSync } from "fs";

// Serve local uploads with long-lived immutable caching.
// On production VPS, Nginx handles this path directly — this route is the dev/fallback layer.

const UPLOADS_ROOT =
  process.env.UPLOADS_PATH ||
  path.join(process.cwd(), "..", "..", "uploads", "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  ico: "image/x-icon",
  pdf: "application/pdf",
  zip: "application/zip",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Security: block path traversal
  const joined = segments.join("/");
  if (joined.includes("..") || path.isAbsolute(joined)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Uploads are runtime media, not server code. Keep the separate media library
  // out of Turbopack's dependency tracing; UPLOADS_PATH must exist at runtime.
  const filePath = path.join(/*turbopackIgnore: true*/ UPLOADS_ROOT, ...segments);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";

  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        // Images are content-addressed (WP adds dimensions to filenames) — safe to cache long-term
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Error reading file", { status: 500 });
  }
}
