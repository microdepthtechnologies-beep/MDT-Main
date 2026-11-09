"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

export function PasswordRecoveryForm({ mode, token = "" }: { mode: "request" | "reset"; token?: string }) {
  const reset = mode === "reset";
  const validToken = /^[a-f0-9]{64}$/.test(token);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    setError("");
    if (reset && password !== data.get("confirm")) { setError("Your passwords don’t match. Please enter the same password twice."); return; }
    if (reset && new TextEncoder().encode(password).length > 72) { setError("Please use a password no longer than 72 bytes (fewer characters when using symbols or emoji)."); return; }
    setPending(true);
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { token, password } : { email: data.get("email") }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "We couldn’t complete your request. Please try again."); return; }
      form.reset();
      setDone(true);
      if (reset) window.history.replaceState(null, "", "/auth/reset-password/");
    } catch {
      setError("We couldn’t connect. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return <>
    {done ? <div className="recovery-success" role="status">
      <span className="recovery-symbol">{reset ? <CheckCircle2 size={25} /> : <Mail size={25} />}</span>
      <h2>{reset ? "You’re ready to return." : "Check your inbox."}</h2>
      <p>{reset ? "Your password has been updated and previous sessions have been signed out. Sign in with your new password to continue." : "If this email belongs to an account with a password, a reset link will arrive shortly. Check your inbox and spam folder."}</p>
      {!reset && <p className="account-field-hint">The link works once and expires in 30 minutes. Allow a few minutes for delivery before trying again.</p>}
    </div> : reset && !validToken ? <p role="alert" className="account-error">This reset link is incomplete or invalid. Please request a new link below.</p> : <form className="account-form" onSubmit={submit} aria-busy={pending}>
      {!reset ? <label htmlFor="recovery-email">Email address<input id="recovery-email" type="email" name="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} disabled={pending} /></label> : <>
        <div className="account-password-field">
          <label htmlFor="recovery-password">New password</label>
          <div className="account-password-input">
            <input id="recovery-password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} placeholder="Create a new password" aria-describedby="recovery-hint" disabled={pending} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide passwords" : "Show passwords"} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <p id="recovery-hint" className="account-field-hint">At least 8 characters. A longer, unique passphrase is best.</p>
        </div>
        <label htmlFor="recovery-confirm">Confirm new password<input id="recovery-confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" placeholder="Enter it once more" required minLength={8} maxLength={72} disabled={pending} /></label>
      </>}
      {error && <p className="account-error" role="alert">{error}</p>}
      <button className="account-submit" type="submit" disabled={pending}>{pending ? <>{reset ? "Updating your password…" : "Requesting your link…"}<LoaderCircle size={18} className="filter-spinner" /></> : <>{reset ? "Save new password" : "Send reset link"}<ArrowRight size={18} /></>}</button>
    </form>}
    {!reset && <p className="recovery-google-note">Joined with Google? Continue with Google on the sign-in page. Your Google password is managed by Google.</p>}
    {reset && !done && <p className="account-switch"><Link href="/auth/forgot-password/">Request a new reset link <ArrowRight size={14} /></Link></p>}
    {!reset && done && <button className="recovery-retry" type="button" onClick={() => { setDone(false); setError(""); }}>Try again or use another email</button>}
    <p className="account-switch"><Link href="/auth/signin/"><ArrowLeft size={14} /> Back to sign in</Link></p>
    <p className="account-private"><LockKeyhole size={14} /> A secure way back to your MDT account.</p>
  </>;
}
