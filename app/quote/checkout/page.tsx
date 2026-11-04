import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuoteCheckoutClient } from "@/components/QuoteCheckoutClient";

export default async function QuoteCheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/quote/checkout/");
  return <>
    <SiteHeader />
    <main className="site-width quote-checkout-page">
      <p className="eyebrow">YOUR QUOTE CART</p>
      <h1>Review your quote request<span>.</span></h1>
      <QuoteCheckoutClient user={session.user} />
    </main>
    <SiteFooter />
  </>;
}
