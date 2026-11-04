import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountShell } from "@/components/AccountShell";
import { AccountForm } from "@/components/AccountForm";

export const metadata: Metadata = { title: "Sign in to your account", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string; registered?: string }> }) {
  const session = await auth();
  if (session) redirect("/dashboard/");
  const { callbackUrl, error, registered } = await searchParams;
  return <AccountShell><AccountForm mode="signin" callbackUrl={callbackUrl} registered={registered === "1"} initialError={error ? "We couldn’t sign you in. Please try again or use another sign-in method." : ""} /></AccountShell>;
}
