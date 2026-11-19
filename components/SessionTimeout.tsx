"use client";

import { useEffect, useRef, useState } from "react";
import { getSession, signOut, useSession } from "next-auth/react";

const IDLE_MS = 30 * 60 * 1000;   // must match SESSION_IDLE_SECONDS in lib/auth.ts
const WARN_MS = 2 * 60 * 1000;    // warn two minutes before signing out
const KEEPALIVE_MS = 4 * 60 * 1000;
const STORAGE_KEY = "mdt-last-activity";
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;

// Signs a user out after 30 minutes without interaction. Activity is shared
// between tabs, and active users silently refresh their session cookie.
export function SessionTimeout() {
  const { status } = useSession();
  const [warning, setWarning] = useState(false);
  const lastPing = useRef(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    const now = () => Date.now();
    const lastActivity = () => Number(localStorage.getItem(STORAGE_KEY)) || now();
    const markActive = () => {
      localStorage.setItem(STORAGE_KEY, String(now()));
      setWarning(false);
      if (now() - lastPing.current > KEEPALIVE_MS) {
        lastPing.current = now();
        void getSession(); // re-issues the session cookie with a fresh 30-minute expiry
      }
    };
    localStorage.setItem(STORAGE_KEY, String(now()));
    lastPing.current = now();
    const tick = window.setInterval(() => {
      const idle = now() - lastActivity();
      if (idle >= IDLE_MS) {
        window.clearInterval(tick);
        void signOut({ redirectTo: "/auth/signin/?reason=idle" });
      } else setWarning(idle >= IDLE_MS - WARN_MS);
    }, 15_000);
    let throttle = 0;
    const onActivity = () => { if (now() - throttle > 5_000) { throttle = now(); markActive(); } };
    EVENTS.forEach(event => window.addEventListener(event, onActivity, { passive: true }));
    return () => { window.clearInterval(tick); EVENTS.forEach(event => window.removeEventListener(event, onActivity)); };
  }, [status]);

  if (!warning || status !== "authenticated") return null;
  return <div className="session-expiry-notice" role="alertdialog" aria-live="assertive" aria-label="Session about to expire">
    <span>For your security, you’ll be signed out in about 2 minutes due to inactivity.</span>
    <button type="button" onClick={() => { localStorage.setItem(STORAGE_KEY, String(Date.now())); lastPing.current = Date.now(); void getSession(); setWarning(false); }}>Stay signed in</button>
  </div>;
}
