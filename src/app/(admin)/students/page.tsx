import Students from "@/views/Students";
import { listStudentsWithEnrollments } from "@/server/actions/studentsCrud";
import { listClasses } from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [studentsWithEnrollments, classesList] = await Promise.all([
    listStudentsWithEnrollments(),
    listClasses(),
  ]);

  return (
    <Students
      initialData={studentsWithEnrollments}
      availableClasses={classesList}
    />
  );
}
