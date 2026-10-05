import ParentPortal from "@/views/ParentPortal";
import { getMyTrialApplications } from "@/server/actions/trial";
import { getReportsForParent } from "@/server/actions/dailyReports";
import { getLatestAnnouncementsForParent } from "@/server/actions/announcements";

export default async function Page() {
  const [applications, reports, announcements] = await Promise.all([
    getMyTrialApplications(),
    getReportsForParent(),
    getLatestAnnouncementsForParent(),
  ]);
  return (
    <ParentPortal
      trialStatus={applications}
      reports={reports}
      announcements={announcements}
    />
  );
}
