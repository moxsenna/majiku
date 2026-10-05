import Birthdays from "@/views/Birthdays";
import { getUpcomingBirthdays } from "@/server/actions/birthdays";

export const dynamic = "force-dynamic";

export default async function Page() {
  const entries = await getUpcomingBirthdays();
  return <Birthdays entries={entries} />;
}
