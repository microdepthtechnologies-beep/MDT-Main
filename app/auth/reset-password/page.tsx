import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { PasswordRecoveryForm } from "@/components/PasswordRecoveryForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <AccountShell recovery="reset"><PasswordRecoveryForm mode="reset" token={typeof token === "string" ? token : ""} /></AccountShell>;
}
