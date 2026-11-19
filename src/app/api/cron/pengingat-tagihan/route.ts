import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { invoices, students } from "@/db/schema";
import { notifyUsers } from "@/server/notify";

/**
 * N6 — pengingat jatuh tempo tagihan. Dipanggil cron Workers harian (custom-worker.ts)
 * dengan header `x-cron-secret`. Idempoten per hari:
 * - H-3 dan hari-H (status unpaid) → pengingat ke ortu.
 * - Lewat jatuh tempo & masih unpaid → status jadi overdue + satu notifikasi (transisi terjadi sekali).
 */
export const dynamic = "force-dynamic";

function tanggalJakarta(offsetHari = 0): string {
  const d = new Date(Date.now() + 7 * 3_600_000 + offsetHari * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const rupiah = (n: string) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hariIni = tanggalJakarta(0);
  const h3 = tanggalJakarta(3);

  const kolom = {
    id: invoices.id,
    invoiceNumber: invoices.invoiceNumber,
    total: invoices.total,
    dueDate: invoices.dueDate,
    parentUserId: students.parentUserId,
    tenantId: students.tenantId,
    studentName: students.name,
  };

  const segera = await db
    .select(kolom)
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.status, "unpaid"), inArray(invoices.dueDate, [hariIni, h3])));

  const lewat = await db
    .update(invoices)
    .set({ status: "overdue", updatedAt: new Date() })
    .where(and(eq(invoices.status, "unpaid"), lt(invoices.dueDate, hariIni)))
    .returning({ id: invoices.id });

  const lewatRows = lewat.length
    ? await db
        .select(kolom)
        .from(invoices)
        .innerJoin(students, eq(students.id, invoices.studentId))
        .where(inArray(invoices.id, lewat.map((r) => r.id)))
    : [];

  for (const r of segera) {
    if (!r.parentUserId) continue;
    await notifyUsers({
      userIds: [r.parentUserId],
      type: "invoice_due",
      title: r.dueDate === hariIni ? `Tagihan ${r.studentName} jatuh tempo hari ini` : `Tagihan ${r.studentName} jatuh tempo 3 hari lagi`,
      body: `${r.invoiceNumber} · ${rupiah(r.total)}`,
      link: "/parent/billing",
      tenantId: r.tenantId,
    });
  }
  for (const r of lewatRows) {
    if (!r.parentUserId) continue;
    await notifyUsers({
      userIds: [r.parentUserId],
      type: "invoice_overdue",
      title: `Tagihan ${r.studentName} lewat jatuh tempo`,
      body: `${r.invoiceNumber} · ${rupiah(r.total)}`,
      link: "/parent/billing",
      tenantId: r.tenantId,
    });
  }

  return Response.json({ hariIni, pengingat: segera.length, overdue: lewatRows.length });
}
