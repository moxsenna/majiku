import TutorDashboard from "@/views/TutorDashboard";
import { getTutorDashboardOverview } from "@/server/actions/tutorDashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getTutorDashboardOverview();
  return <TutorDashboard initialData={data} />;
}
