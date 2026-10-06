import { notFound } from "next/navigation";
import ParentInvoiceDetail from "@/views/ParentInvoiceDetail";
import { getMyInvoiceById } from "@/server/actions/payments";
import { isPaymentsEnabled } from "@/server/paycore";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, paymentsEnabled] = await Promise.all([
    getMyInvoiceById(id),
    Promise.resolve(isPaymentsEnabled()),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <ParentInvoiceDetail
      invoice={invoice}
      paymentsEnabled={paymentsEnabled}
    />
  );
}
