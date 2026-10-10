import Classes from "@/views/Classes";
import {
  listClassesWithTutor,
  listTutorOptions,
} from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [classesList, tutorOptions] = await Promise.all([
    listClassesWithTutor(),
    listTutorOptions(),
  ]);

  return (
    <Classes
      initialClasses={classesList}
      availableTutors={tutorOptions}
    />
  );
}
