import type { Metadata } from "next";
import { getDashboardAccount } from "@/lib/dashboard";
import { DashboardProfile } from "@/components/DashboardSettings";
import { saveProfile } from "./actions";

export const metadata: Metadata = { title: "Profile & contact" };

export default async function ProfilePage() {
  const account = await getDashboardAccount();
  return <DashboardProfile account={account} saveAction={saveProfile} />;
}
