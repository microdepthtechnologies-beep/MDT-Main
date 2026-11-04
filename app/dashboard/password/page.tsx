import type { Metadata } from "next";
import { getDashboardAccount } from "@/lib/dashboard";
import { DashboardSecurity } from "@/components/DashboardSettings";

export const metadata: Metadata = { title: "Sign-in & security" };

export default async function PasswordPage() {
  const account = await getDashboardAccount();
  return <DashboardSecurity hasPassword={account.hasPassword} />;
}
