"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section className="workspace-panel workspace-empty"><RefreshCw size={30} strokeWidth={1.4} /><h2>Let’s try that again.</h2><p>We couldn’t load your account details. Please try again in a moment.</p><button className="workspace-button workspace-button-red" onClick={reset}>Try again</button><Link href="/shop/" className="workspace-text-link">Back to the catalogue</Link></section>;
}
