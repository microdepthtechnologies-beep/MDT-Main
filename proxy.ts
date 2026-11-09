import { auth } from "@/lib/auth";
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/sales");
  const isAuthPage = ["/auth/signin", "/auth/register"].includes(nextUrl.pathname.replace(/\/$/, ""));
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(nextUrl.pathname + nextUrl.search), nextUrl));
  }
  if (isAuthPage && isLoggedIn && nextUrl.pathname !== "/api/auth/signout") {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});
export const config = { matcher: ["/dashboard/:path*", "/auth/:path*", "/sales/:path*"] };
