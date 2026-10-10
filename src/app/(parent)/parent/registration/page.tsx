import ParentRegistration from "@/views/ParentRegistration";
import { getAvailablePrograms } from "@/server/actions/trial";

export const dynamic = "force-dynamic";

export default async function Page() {
  const programs = await getAvailablePrograms();
  return <ParentRegistration initialPrograms={programs} />;
}
