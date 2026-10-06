import Schedule from "@/views/Schedule";
import { listSchedules } from "@/server/actions/schedules";
import { listClasses } from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [schedules, classesList] = await Promise.all([
    listSchedules(),
    listClasses(),
  ]);
  return (
    <Schedule
      schedules={schedules}
      classOptions={classesList.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
