export function appUrl(path: string) {
  const origin = new URL(process.env.APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || (process.env.NODE_ENV === "production" ? "https://mdt.co.ke" : "http://localhost:3000"));
  if (!["https:", "http:"].includes(origin.protocol) || origin.username || origin.password) throw new Error("Invalid application URL");
  return new URL(path, origin.origin).href;
}
