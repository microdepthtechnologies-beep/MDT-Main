import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountShell } from "@/components/AccountShell";
import { AccountForm } from "@/components/AccountForm";

export const metadata: Metadata = { title: "Sign in to your account", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string; registered?: string; reason?: string }> }) {
  const session = await auth();
  if (session) redirect("/dashboard/");
  const { callbackUrl, error, registered, reason } = await searchParams;
  const notice = reason === "idle" ? "You were signed out after 30 minutes of inactivity. Sign in again to continue."
    : reason === "expired" ? "Your session has ended. For your security, please sign in again."
    : reason === "password-changed" ? "Your password was updated and all sessions were signed out. Sign in with your new password." : "";
  return <AccountShell><AccountForm mode="signin" callbackUrl={callbackUrl} registered={registered === "1"} notice={notice} initialError={error ? "We couldn’t sign you in. Please try again or use another sign-in method." : ""} /></AccountShell>;
}
