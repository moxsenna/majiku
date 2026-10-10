import Tutors from "@/views/Tutors";
import { listTutorsWithAssignments, listLinkableUsers } from "@/server/actions/tutorsCrud";
import { listClasses } from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [tutorsWithAssignments, linkableUsers, classesList] = await Promise.all([
    listTutorsWithAssignments(),
    listLinkableUsers(),
    listClasses(),
  ]);
  return (
    <Tutors
      initialData={tutorsWithAssignments}
      linkableUsers={linkableUsers}
      availableClasses={classesList}
    />
  );
}
