import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { PasswordRecoveryForm } from "@/components/PasswordRecoveryForm";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ForgotPasswordPage() {
  return <AccountShell recovery="request"><PasswordRecoveryForm mode="request" /></AccountShell>;
}
