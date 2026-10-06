import ParentBilling from "@/views/ParentBilling";
import { getMyInvoices } from "@/server/actions/payments";
import { isPaymentsEnabled } from "@/server/paycore";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [invoices, paymentsEnabled] = await Promise.all([
    getMyInvoices(),
    Promise.resolve(isPaymentsEnabled()),
  ]);

  return <ParentBilling invoices={invoices} paymentsEnabled={paymentsEnabled} />;
}
