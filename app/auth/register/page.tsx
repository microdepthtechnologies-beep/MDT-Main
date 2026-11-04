import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AccountForm } from "@/components/AccountForm";

export const metadata: Metadata = { title: "Create your MDT account", robots: { index: false, follow: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <AccountShell register><AccountForm mode="register" callbackUrl={callbackUrl} /></AccountShell>;
}
