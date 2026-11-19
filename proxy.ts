import { auth } from "@/lib/auth";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Defence in depth against CSRF: state-changing API calls must come from this
// site. (Session cookies are SameSite=Lax, and Auth.js routes carry their own token.)
function sameOrigin(req: Request, host: string) {
  const origin = req.headers.get("origin");
  if (origin) {
    try { return new URL(origin).host === host; } catch { return false; }
  }
  const fetchSite = req.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  if (path.startsWith("/api/")) {
    if (MUTATING.has(req.method) && !sameOrigin(req, req.headers.get("x-forwarded-host") || nextUrl.host)) {
      return Response.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
    }
    return;
  }

  const isLoggedIn = !!req.auth;
  const isDashboard = path.startsWith("/dashboard") || path.startsWith("/sales");
  const isAuthPage = ["/auth/signin", "/auth/register"].includes(path.replace(/\/$/, ""));
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(path + nextUrl.search), nextUrl));
  }
  // Accounts still using a password that predates the strength policy must upgrade first.
  if (isDashboard && req.auth?.user?.passwordUpgradeRequired && !path.startsWith("/dashboard/password")) {
    return Response.redirect(new URL("/dashboard/password/", nextUrl));
  }
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});
// Auth.js's own endpoints (signin/callback/session/csrf…) are excluded: they carry their own CSRF token.
export const config = { matcher: ["/dashboard/:path*", "/auth/:path*", "/sales/:path*", "/api/((?!auth/(?:signin|signout|callback|session|csrf|providers|error|verify-request)).*)"] };
