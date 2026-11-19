// Single switch for offloading media to a CDN (S3 + CloudFront).
// Set MEDIA_BASE_URL (e.g. https://d1234abcd.cloudfront.net) and every
// /wp-content/uploads/… path is served from the CDN instead of this server.
// Leave it unset in development to keep serving local files.
const MEDIA_BASE = (process.env.MEDIA_BASE_URL || "").trim().replace(/\/+$/, "");

const WP_HOST = /^https?:\/\/(?:www\.)?mdt\.co\.ke(?=\/wp-content\/uploads\/)/;

export function mediaUrl(value?: string | null): string {
  if (!value) return "";
  const local = value.replace(WP_HOST, "");
  if (local.startsWith("/wp-content/uploads/")) return MEDIA_BASE ? `${MEDIA_BASE}${local}` : local;
  return value;
}

export const isUploadsPath = (value: string) => value.includes("/wp-content/uploads/");
