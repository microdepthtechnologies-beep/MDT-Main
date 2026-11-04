"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Eye, EyeOff, Info, KeyRound, LoaderCircle, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { accountInitials, type DashboardAccount, type ProfileResult } from "@/lib/dashboard-types";
import { contact } from "@/data/company";
import { DashboardHeading } from "./DashboardUI";

export function DashboardProfile({ account, saveAction }: { account: DashboardAccount; saveAction: (form: FormData) => Promise<ProfileResult> }) {
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [pending, setPending] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setResult(null);
    try { setResult(await saveAction(form)); }
    catch { setResult({ ok: false, message: "We couldn’t connect. Your changes haven’t been saved. Please try again." }); }
    finally { setPending(false); }
  }
  return <>
    <DashboardHeading eyebrow="THE DETAILS THAT MATTER" title="Profile & contact" description="Keep your account details current so we know who we’re working with." />
    <div className="workspace-settings-grid">
      <section className="workspace-panel">
        <div className="workspace-panel-heading"><div><h2>Personal information</h2><p>A few details for a more personal connection.</p></div><UserRound size={21} strokeWidth={1.4} /></div>
        <div className="workspace-profile-identity"><span className="workspace-avatar">{accountInitials(account.name)}</span><div><strong>{account.name}</strong><span>MDT customer account</span></div></div>
        <form className="workspace-form" onSubmit={save} aria-busy={pending} onChange={() => setResult(null)}>
          <label htmlFor="profile-name">Full name <span className="workspace-required">Required</span><input id="profile-name" name="name" defaultValue={account.name} autoComplete="name" minLength={2} maxLength={120} required /></label>
          <label htmlFor="profile-email">Email address<div className="workspace-locked-input"><input id="profile-email" value={account.email} type="email" readOnly aria-describedby="profile-email-help" /><LockKeyhole size={15} /></div><small id="profile-email-help">Your sign-in email. Contact our team if you need to change it.</small></label>
          <div className="workspace-form-divider"><span>BUSINESS & CONTACT</span><span>Optional</span></div>
          <div className="workspace-form-pair"><label htmlFor="profile-company">Company<input id="profile-company" name="company" defaultValue={account.company} autoComplete="organization" placeholder="Your company name" maxLength={160} /></label><label htmlFor="profile-phone">Phone number<input id="profile-phone" name="phone" type="tel" defaultValue={account.phone} autoComplete="tel" placeholder="e.g. +254 7XX XXX XXX" maxLength={40} /></label></div>
          {result && <p className={`workspace-feedback ${result.ok ? "workspace-feedback-success" : "workspace-feedback-error"}`} role={result.ok ? "status" : "alert"}>{result.ok ? <Check size={17} /> : <Info size={17} />}{result.message}</p>}
          <div className="workspace-form-footer"><span>Your details are only visible in your account.</span><button type="submit" className="workspace-button workspace-button-red" disabled={pending}>{pending ? <LoaderCircle className="filter-spinner" size={17} /> : <Save size={17} />}{pending ? "Saving…" : "Save changes"}</button></div>
        </form>
      </section>
      <aside className="workspace-settings-aside">
        <section className="workspace-panel workspace-tip"><span className="workspace-small-icon"><Mail size={22} strokeWidth={1.5} /></span><h2>A direct line to you.</h2><p>We use your account email for your quote requests and replies from our team.</p><p>Details submitted with an existing request stay with that request, even when you update your profile.</p><a href={`mailto:${contact.email}`} className="workspace-text-link">Need to update a request? <ArrowUpRight size={15} /></a></section>
        <div className="workspace-small-note"><ShieldCheck size={20} strokeWidth={1.5} /><p>Keep your information accurate and your account password private.</p></div>
      </aside>
    </div>
  </>;
}

function PasswordField({ name, label, autoComplete, hint }: { name: string; label: string; autoComplete: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="workspace-password-field"><label htmlFor={`security-${name}`}>{label}</label><div><input id={`security-${name}`} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={name === "current" ? 1 : 8} aria-describedby={hint ? `security-${name}-hint` : undefined} /><button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{hint && <small id={`security-${name}-hint`}>{hint}</small>}</div>;
}

export function DashboardSecurity({ hasPassword }: { hasPassword: boolean }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ProfileResult | null>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setResult(null);
    if (form.get("next") !== form.get("confirm")) {
      setResult({ ok: false, message: "Your new passwords don’t match. Please check both fields." });
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/auth/password/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: form.get("current"), next: form.get("next") }),
      });
      const data = await response.json();
      setResult({ ok: response.ok, message: response.ok ? "Your password has been updated." : data.error || "Couldn’t update your password. Please try again." });
      if (response.ok) element.reset();
    } catch { setResult({ ok: false, message: "We couldn’t connect. Your password hasn’t changed. Please try again." }); }
    finally { setPending(false); }
  }
  return <>
    <DashboardHeading eyebrow="A LITTLE PEACE OF MIND" title="Sign-in & security" description="Take care of your account, so you can focus on what’s next." />
    <div className="workspace-settings-grid">
      <section className="workspace-panel">
        <div className="workspace-panel-heading"><div><h2>{hasPassword ? "Change your password" : "Your sign-in method"}</h2><p>{hasPassword ? "A strong password helps keep your account private." : "Your account uses Google to sign in."}</p></div><KeyRound size={22} strokeWidth={1.4} /></div>
        {hasPassword ? <form className="workspace-form" onSubmit={save} aria-busy={pending} onChange={() => setResult(null)}>
          <div className="workspace-security-intro"><ShieldCheck size={20} /><p>Enter your current password to confirm it’s you, then choose a new one.</p></div>
          <PasswordField name="current" label="Current password" autoComplete="current-password" />
          <PasswordField name="next" label="New password" autoComplete="new-password" hint="Use at least 8 characters. A longer, unique password is even better." />
          <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
          {result && <p className={`workspace-feedback ${result.ok ? "workspace-feedback-success" : "workspace-feedback-error"}`} role={result.ok ? "status" : "alert"}>{result.ok ? <Check size={17} /> : <Info size={17} />}{result.message}</p>}
          <div className="workspace-form-footer"><span>Never share your password with anyone.</span><button type="submit" className="workspace-button workspace-button-red" disabled={pending}>{pending ? <LoaderCircle size={17} className="filter-spinner" /> : <LockKeyhole size={17} />}{pending ? "Updating…" : "Update password"}</button></div>
        </form> : <div className="workspace-google-security"><span className="workspace-small-icon"><ShieldCheck size={30} strokeWidth={1.3} /></span><h3>Connected with Google.</h3><p>You don’t have a separate MDT password. Manage your password and sign-in protection in your Google account.</p><a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="workspace-button workspace-button-dark">Google security settings <ArrowUpRight size={16} /></a></div>}
      </section>
      <aside className="workspace-settings-aside"><section className="workspace-panel workspace-tip"><span className="workspace-small-icon"><LockKeyhole size={22} strokeWidth={1.5} /></span><h2>Small habits.<br />Better security.</h2><ul className="workspace-security-tips"><li><Check size={15} /> Use a password you don’t use elsewhere.</li><li><Check size={15} /> A password manager can help you remember it.</li><li><Check size={15} /> Sign out when using a shared device.</li></ul></section><div className="workspace-small-note"><Info size={20} strokeWidth={1.5} /><p>Something doesn’t look right? <a href={`mailto:${contact.email}`}>Contact our team.</a></p></div></aside>
    </div>
  </>;
}
