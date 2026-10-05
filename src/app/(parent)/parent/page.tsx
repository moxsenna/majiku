import ParentPortal from "@/views/ParentPortal";
import { getMyTrialApplications } from "@/server/actions/trial";
import { getReportsForParent } from "@/server/actions/dailyReports";

export default async function Page() {
  const [applications, reports] = await Promise.all([
    getMyTrialApplications(),
    getReportsForParent(),
  ]);
  return <ParentPortal trialStatus={applications} reports={reports} />;
}
