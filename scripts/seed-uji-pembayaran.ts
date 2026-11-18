/**
 * Tambahan seed uji K7 Pembayaran masuk: payment_orders untuk tenant uji (tk-uji-bunayo).
 * HANYA untuk database uji Neon (host ep-late-dawn-*). Idempoten (external_order_id tetap).
 * - Separuh tagihan Lunas bulan berjalan diberi order "paid" (= dibayar online lewat PayCore).
 * - Satu tagihan belum Lunas diberi order "pending" (= Menunggu gateway).
 *
 * Pakai:
 *   export $(grep -v '^#' .env.test.local | xargs -d '\n') && npx tsx scripts/seed-uji-pembayaran.ts
 */
import { and, eq, ne, sql } from "drizzle-orm";

const UJI_HOST = "ep-late-dawn-a1vqqh2c";
if (!process.env.NEON_DATABASE_URL?.includes(UJI_HOST)) {
  console.error(`Ditolak: NEON_DATABASE_URL bukan DB uji (${UJI_HOST}).`);
  process.exit(1);
}

async function main() {
  const { db } = await import("../src/db");
  const s = await import("../src/db/schema");

  const [tenant] = await db.select().from(s.tenants).where(eq(s.tenants.slug, "tk-uji-bunayo"));
  if (!tenant) throw new Error("Tenant uji belum ada; jalankan seed-uji-redesign.ts dulu.");

  const bulanIni = sql`to_char((${s.invoices.paidAt} AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM') = to_char((now() AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM')`;
  const lunas = await db
    .select({ id: s.invoices.id, nomor: s.invoices.invoiceNumber, total: s.invoices.total, paidAt: s.invoices.paidAt, parent: s.students.parentUserId })
    .from(s.invoices)
    .innerJoin(s.students, eq(s.students.id, s.invoices.studentId))
    .where(and(eq(s.students.tenantId, tenant.id), eq(s.invoices.status, "paid"), bulanIni))
    .orderBy(s.invoices.invoiceNumber);
  const belum = await db
    .select({ id: s.invoices.id, nomor: s.invoices.invoiceNumber, total: s.invoices.total, parent: s.students.parentUserId })
    .from(s.invoices)
    .innerJoin(s.students, eq(s.students.id, s.invoices.studentId))
    .where(and(eq(s.students.tenantId, tenant.id), ne(s.invoices.status, "paid")))
    .orderBy(s.invoices.invoiceNumber)
    .limit(1);

  const rows = [
    ...lunas
      .filter((_, i) => i % 2 === 0)
      .map((r) => ({
        id: `uji-po-${r.nomor}`,
        invoiceId: r.id,
        tenantId: tenant.id,
        parentUserId: r.parent,
        externalOrderId: `uji-${r.nomor}`,
        amount: String(r.total),
        paymentStatus: "paid",
        paidAt: r.paidAt,
        createdAt: r.paidAt ?? new Date(),
      })),
    ...belum.map((r) => ({
      id: `uji-po-${r.nomor}`,
      invoiceId: r.id,
      tenantId: tenant.id,
      parentUserId: r.parent,
      externalOrderId: `uji-${r.nomor}`,
      amount: String(r.total),
      paymentStatus: "pending",
      paidAt: null,
      createdAt: new Date(),
    })),
  ];
  if (rows.length) await db.insert(s.paymentOrders).values(rows).onConflictDoNothing();
  console.log(`payment_orders uji: ${rows.length} (paid ${rows.length - belum.length}, pending ${belum.length})`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
