import Tutors from "@/views/Tutors";
import { listTutorsWithAssignments, listLinkableUsers } from "@/server/actions/tutorsCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [tutorsWithAssignments, linkableUsers] = await Promise.all([
    listTutorsWithAssignments(),
    listLinkableUsers(),
  ]);
  return <Tutors initialData={tutorsWithAssignments} linkableUsers={linkableUsers} />;
}
