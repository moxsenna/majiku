import DailyReports from "@/views/DailyReports";
import {
  listDailyReports,
  getStudentOptions,
} from "@/server/actions/dailyReports";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = resolvedParams.date || today;

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
