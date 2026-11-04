import { getDashboardAccount, getDashboardQuotes } from "@/lib/dashboard";
import { DashboardOverview } from "@/components/DashboardOverview";

export default async function DashboardPage() {
  const [account, quotes] = await Promise.all([getDashboardAccount(), getDashboardQuotes()]);
  return <DashboardOverview account={account} quotes={quotes} />;
}
