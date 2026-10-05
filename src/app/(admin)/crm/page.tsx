import CRM from "@/views/CRM";
import { getTrialPipeline, getSchedulingOptions } from "@/server/actions/trial";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [pipeline, schedulingOptions] = await Promise.all([
    getTrialPipeline(),
    getSchedulingOptions(),
  ]);

  return <CRM pipeline={pipeline} schedulingOptions={schedulingOptions} />;
}
