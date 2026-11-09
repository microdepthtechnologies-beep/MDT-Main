"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function QuoteLiveUpdates() {
  const router = useRouter();
  const [live, setLive] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 350);
    };
    const events = new EventSource("/api/quote-events/");
    events.addEventListener("ready", () => { setLive(true); refresh(); });
    events.addEventListener("changed", refresh);
    events.addEventListener("revoked", () => { events.close(); setLive(false); router.refresh(); });
    events.onerror = () => setLive(false);
    // Reconcile missed events after reconnect and on hosts which buffer SSE.
    const reconcile = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 15000);
    window.addEventListener("focus", refresh);
    return () => { events.close(); clearTimeout(timer); clearInterval(reconcile); window.removeEventListener("focus", refresh); };
  }, [router]);
  return <span className="quote-live"><span className={live ? "is-live" : ""} />{live ? "Live updates" : "Syncing updates"}</span>;
}
