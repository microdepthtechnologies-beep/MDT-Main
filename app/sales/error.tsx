"use client";
export default function SalesError({ reset }: { reset: () => void }) {
  return <div className="workspace-empty"><h2>We couldn’t load your workspace.</h2><p>Please check your connection and try again.</p><button className="workspace-button workspace-button-dark" onClick={reset}>Try again</button></div>;
}
