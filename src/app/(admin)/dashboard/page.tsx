import Dashboard from "@/views/Dashboard";
import { getAdminDashboardOverview } from "@/server/actions/adminDashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getAdminDashboardOverview();
  return <Dashboard initialData={data} />;
}
