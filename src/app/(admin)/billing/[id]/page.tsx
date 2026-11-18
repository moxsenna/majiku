import { notFound } from "next/navigation";
import TagihanDetail from "@/views/keuangan/TagihanDetail";
import { getTagihanDetail } from "@/server/actions/keuangan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail tagihan" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getTagihanDetail(id).catch(() => null);
  if (!detail) notFound();
  return <TagihanDetail initialData={detail} id={id} />;
}
