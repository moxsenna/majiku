import TutorProgress from "@/views/TutorProgress";
import { getMyStudents } from "@/server/actions/dailyReports";
import { todayInWib } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function Page() {
  const students = await getMyStudents();
  return <TutorProgress students={students} today={todayInWib()} />;
}
