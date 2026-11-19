"use client";

import { Check, Circle } from "lucide-react";
import { passwordChecks } from "@/lib/password-policy";

const LEVELS = ["Too weak", "Weak", "Weak", "Fair", "Good", "Almost there"];

export function PasswordStrength({ password, email, name, id }: { password: string; email?: string; name?: string; id?: string }) {
  const checks = passwordChecks(password, { email, name });
  const met = checks.filter(check => check.met).length;
  const complete = met === checks.length;
  const percent = Math.round((met / checks.length) * 100);
  return <div className={`password-strength${complete ? " is-strong" : ""}`} id={id} aria-live="polite">
    <div className="password-strength-bar" aria-hidden="true"><span style={{ width: `${percent}%` }} data-level={complete ? "strong" : met >= 4 ? "good" : met >= 2 ? "fair" : "weak"} /></div>
    <p className="password-strength-label">{password ? (complete ? "Strong password" : LEVELS[met]) : "Your password must include:"}</p>
    <ul>
      {checks.map(check => <li key={check.id} className={check.met ? "met" : undefined}>
        {check.met ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : <Circle size={12} aria-hidden="true" />}
        <span>{check.label}</span><span className="sr-only">{check.met ? " — done" : " — required"}</span>
      </li>)}
    </ul>
  </div>;
}
