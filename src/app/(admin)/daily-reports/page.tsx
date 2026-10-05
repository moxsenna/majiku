import DailyReports from "@/views/DailyReports";
import {
  listDailyReports,
  getStudentOptions,
} from "@/server/actions/dailyReports";
import { todayInWib, isValidDateString } from "@/lib/datetime";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const today = todayInWib();
  const rawDate = resolvedParams.date?.trim();
  const selectedDate = rawDate && isValidDateString(rawDate) ? rawDate : today;

  const [reports, studentOptions] = await Promise.all([
    listDailyReports(selectedDate),
    getStudentOptions(),
  ]);

  return (
    <DailyReports
      initialReports={reports}
      studentOptions={studentOptions}
      selectedDate={selectedDate}
    />
  );
}
