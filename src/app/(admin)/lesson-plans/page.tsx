import LessonPlans from "@/views/LessonPlans";
import { listLessonPlans, getClassOptions } from "@/server/actions/lessonPlans";
import { todayInWib } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [plans, classOptions] = await Promise.all([
    listLessonPlans(),
    getClassOptions(),
  ]);
  return <LessonPlans plans={plans} classOptions={classOptions} today={todayInWib()} />;
}
