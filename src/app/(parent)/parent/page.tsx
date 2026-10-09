import ParentPortal from "@/views/ParentPortal";
import { getMyTrialApplications } from "@/server/actions/trial";
import { getReportsForParent } from "@/server/actions/dailyReports";
import { getLatestAnnouncementsForParent } from "@/server/actions/announcements";
import { getMyChildren } from "@/server/actions/parentChildren";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [children, applications, reports, announcements] = await Promise.all([
    getMyChildren(),
    getMyTrialApplications(),
    getReportsForParent(),
    getLatestAnnouncementsForParent(),
  ]);
  return (
    <ParentPortal
      childrenList={children}
      trialStatus={applications}
      reports={reports}
      announcements={announcements}
    />
  );
}
