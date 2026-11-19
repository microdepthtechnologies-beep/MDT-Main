// Only same-site relative paths are accepted as post-login destinations.
// Blocks "//evil.com", "/\evil.com" and control-character tricks such as "/\t/evil.com"
// that browsers normalise into protocol-relative URLs (open redirect).
export function safeCallbackPath(value: unknown, fallback = "/dashboard/") {
  if (typeof value !== "string" || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://placeholder.invalid");
    return url.origin === "https://placeholder.invalid" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
