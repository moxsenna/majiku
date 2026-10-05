import Classes from "@/views/Classes";
import { listClasses } from "@/server/actions/classesCrud";

export const dynamic = "force-dynamic";

export default async function Page() {
  const classesList = await listClasses();
  return <Classes initialClasses={classesList} />;
}
