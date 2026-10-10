import Students from "@/views/Students";
import {
  listStudentsWithEnrollments,
  getLinkableParents,
} from "@/server/actions/studentsCrud";
import { listClasses } from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [studentsWithEnrollments, classesList, parentsList] = await Promise.all([
    listStudentsWithEnrollments(),
    listClasses(),
    getLinkableParents(),
  ]);

  return (
    <Students
      initialData={studentsWithEnrollments}
      availableClasses={classesList}
      linkableParents={parentsList}
    />
  );
}
