import type { Metadata } from "next";
import { getDashboardAccount } from "@/lib/dashboard";
import { DashboardShell } from "@/components/DashboardShell";
import "./dashboard.css";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await getDashboardAccount();
  return <DashboardShell name={account.name} email={account.email}>{children}</DashboardShell>;
}
