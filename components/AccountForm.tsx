"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

function GoogleMark() {
  return <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" /><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z" /><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z" /></svg>;
}

export function AccountForm({ mode, callbackUrl = "/dashboard/", initialError = "", registered = false }: {
  mode: "signin" | "register"; callbackUrl?: string; initialError?: string; registered?: boolean;
}) {
  const register = mode === "register";
  const router = useRouter();
  const destination = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") && !callbackUrl.includes("\\") ? callbackUrl : "/dashboard/";
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState(initialError);
  const [created, setCreated] = useState(false);
  const switchUrl = `/auth/${register ? "signin" : "register"}/?callbackUrl=${encodeURIComponent(destination)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending("email");
    setError("");
    try {
      if (register) {
        const response = await fetch("/api/auth/register/", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }),
        });
        const data = await response.json();
        if (!response.ok) { setError(data.error || "We couldn’t create your account. Please try again."); return; }
        setCreated(true);
        router.push(`${switchUrl}&registered=1`);
      } else {
        const result = await signIn("credentials", {
          email: form.get("email"), password: form.get("password"), redirect: false, redirectTo: destination,
        });
        if (result?.error || !result?.ok) { setError("We couldn’t sign you in. Check your email and password and try again."); return; }
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError("We couldn’t connect. Please check your connection and try again.");
    } finally {
      setPending(null);
    }
  }

  async function google() {
    setPending("google");
    setError("");
    try { await signIn("google", { redirectTo: destination }); }
    catch { setError("Google sign-in is unavailable right now. Please try again or use email."); setPending(null); }
  }

  return <>
    {(registered || created) && <p className="account-notice" role="status"><CheckCircle2 size={18} /> Your account is ready. Sign in to continue.</p>}
    <button className="account-google" type="button" onClick={google} disabled={!!pending || created}>
      {pending === "google" ? <LoaderCircle className="filter-spinner" size={19} /> : <GoogleMark />} Continue with Google
    </button>
    <div className="account-divider"><span>or {register ? "create an account" : "sign in"} with email</span></div>
    <form className="account-form" onSubmit={submit} aria-busy={pending === "email"}>
      {register && <label htmlFor="account-name">Full name<input id="account-name" name="name" autoComplete="name" placeholder="Your full name" required minLength={2} maxLength={120} /></label>}
      <label htmlFor="account-email">Email address<input id="account-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
      <div className="account-password-field">
        <label htmlFor="account-password">Password</label>
        <div className="account-password-input">
          <input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "Create a password" : "Enter your password"} required minLength={register ? 8 : undefined} aria-describedby={register ? "account-password-hint" : undefined} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        {register && <p id="account-password-hint" className="account-field-hint">Use at least 8 characters.</p>}
      </div>
      {error && <p className="account-error" role="alert">{error}</p>}
      <button type="submit" className="account-submit" disabled={!!pending || created}>{pending === "email" ? <>{register ? "Creating your account…" : "Signing you in…"}<LoaderCircle className="filter-spinner" size={18} /></> : <>{register ? "Create your account" : "Sign in"}<ArrowRight size={18} /></>}</button>
    </form>
    <p className="account-switch">{register ? "Already part of MDT?" : "New to MDT?"} <Link href={switchUrl}>{register ? "Sign in" : "Create an account"} <ArrowUpRight size={13} /></Link></p>
    <p className="account-private"><LockKeyhole size={14} /> Your account. Your requests. All in one place.</p>
  </>;
}
