// Best-effort client IP for rate limiting. Vercel and Nginx (configure
// `proxy_set_header X-Real-IP $remote_addr;`) set these headers; the left-most
// X-Forwarded-For entry is the original client.
export function clientIp(headers: Headers | undefined | null) {
  if (!headers) return "unknown";
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = headers.get("x-real-ip")?.trim() || forwarded || "";
  return /^[0-9a-f:.]{3,45}$/i.test(ip) ? ip : "unknown";
}
