import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function AuthErrorPage() {
  return <>
    <SiteHeader />
    <main className="site-width auth-page">
      <h1>Could not sign you in.</h1>
      <p>Please try again or contact support if the issue continues.</p>
      <Link href="/auth/signin" className="button button-red">Back to sign in</Link>
    </main>
    <SiteFooter />
  </>;
}
