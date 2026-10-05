import Tutors from "@/views/Tutors";
import { listTutorsWithAssignments } from "@/server/actions/tutorsCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const tutorsWithAssignments = await listTutorsWithAssignments();
  return <Tutors initialData={tutorsWithAssignments} />;
}
