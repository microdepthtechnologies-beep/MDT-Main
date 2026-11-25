"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="error-content" className="site-width catalogue-empty my-16"><p className="eyebrow">LET’S TRY THAT AGAIN</p><h1 className="text-3xl">We couldn’t load this page.</h1><p>Please try again in a moment. You can also contact our team directly for help with your requirements.</p><button onClick={reset} className="button button-red">Try again</button><Link href="/" className="text-link">Return to MDT</Link></main>;
}
