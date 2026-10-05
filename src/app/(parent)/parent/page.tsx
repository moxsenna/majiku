import ParentPortal from "@/views/ParentPortal";
import { getMyTrialApplications } from "@/server/actions/trial";

export default async function Page() {
  const applications = await getMyTrialApplications();
  return <ParentPortal trialStatus={applications} />;
}
