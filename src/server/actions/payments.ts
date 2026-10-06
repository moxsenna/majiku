"use server";

import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, paymentOrders, students, classes, studentEnrollments } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { createPayCoreOrder, isPaymentsEnabled } from "@/server/paycore";

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

function isParentOrAdmin(roles: AppRole[]): boolean {
  return roles.includes("parent") || roles.includes("admin") || roles.includes("moderator");
}

export interface ParentInvoiceSummary {
  id: string;
  invoiceNumber: string;
  studentName: string;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  amount: number;
  discount: number;
  total: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
}

export async function getMyInvoices(): Promise<ParentInvoiceSummary[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isParentOrAdmin(roles)) return [];

  const isAdmin = roles.includes("admin") || roles.includes("moderator");

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      studentName: students.name,
      billingPeriodStart: invoices.billingPeriodStart,
      billingPeriodEnd: invoices.billingPeriodEnd,
      amount: invoices.amount,
      discount: invoices.discount,
      total: invoices.total,
      status: invoices.status,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
    })
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .where(isAdmin ? undefined : eq(students.parentUserId, session.user.id))
    .orderBy(desc(invoices.dueDate));

  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    studentName: r.studentName,
    billingPeriodStart: r.billingPeriodStart,
    billingPeriodEnd: r.billingPeriodEnd,
    amount: Number(r.amount ?? 0),
    discount: Number(r.discount ?? 0),
    total: Number(r.total ?? 0),
    status: r.status,
    dueDate: r.dueDate,
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
  }));
}

export interface ParentInvoiceDetail extends ParentInvoiceSummary {
  className: string | null;
  parentName: string | null;
  parentPhone: string | null;
  payments: {
    id: string;
    paycoreOrderId: string | null;
    paymentStatus: string;
    checkoutUrl: string | null;
    createdAt: string | null;
  }[];
}

export async function getMyInvoiceById(
  invoiceId: string
): Promise<ParentInvoiceDetail | null> {
  const session = await getSessionSafely();
  if (!session) return null;

  const roles = await getMyRoles().catch(() => [] as AppRole[]);
  if (!isParentOrAdmin(roles)) return null;

  const isAdmin = roles.includes("admin") || roles.includes("moderator");

  const rows = await db
    .select({
      invoice: invoices,
      studentName: students.name,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      studentParentUserId: students.parentUserId,
    })
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (!isAdmin && row.studentParentUserId !== session.user.id) {
    // Bukan invoice milik parent ini — perlakukan sebagai tidak ditemukan
    return null;
  }

  const enrollRows = await db
    .select({ className: classes.name })
    .from(studentEnrollments)
    .innerJoin(classes, eq(studentEnrollments.classId, classes.id))
    .where(eq(studentEnrollments.studentId, row.invoice.studentId))
    .limit(1);

  const payments = await db
    .select({
      id: paymentOrders.id,
      paycoreOrderId: paymentOrders.paycoreOrderId,
      paymentStatus: paymentOrders.paymentStatus,
      checkoutUrl: paymentOrders.checkoutUrl,
      createdAt: paymentOrders.createdAt,
    })
    .from(paymentOrders)
    .where(eq(paymentOrders.invoiceId, invoiceId))
    .orderBy(desc(paymentOrders.createdAt))
    .limit(10);

  return {
    id: row.invoice.id,
    invoiceNumber: row.invoice.invoiceNumber,
    studentName: row.studentName,
    billingPeriodStart: row.invoice.billingPeriodStart,
    billingPeriodEnd: row.invoice.billingPeriodEnd,
    amount: Number(row.invoice.amount ?? 0),
    discount: Number(row.invoice.discount ?? 0),
    total: Number(row.invoice.total ?? 0),
    status: row.invoice.status,
    dueDate: row.invoice.dueDate,
    paidAt: row.invoice.paidAt ? row.invoice.paidAt.toISOString() : null,
    className: enrollRows[0]?.className ?? null,
    parentName: row.parentName,
    parentPhone: row.parentPhone,
    payments: payments.map((p) => ({
      id: p.id,
      paycoreOrderId: p.paycoreOrderId,
      paymentStatus: p.paymentStatus,
      checkoutUrl: p.checkoutUrl,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    })),
  };
}

export async function createInvoicePaymentOrder(
  invoiceId: string
): Promise<{
  checkoutUrl: string;
  qrString: string | null;
  expiresAt: string | null;
}> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login untuk membayar");
  }

  const detail = await getMyInvoiceById(invoiceId);
  if (!detail) {
    throw new Error("Invoice tidak ditemukan");
  }
  if (detail.status === "paid") {
    throw new Error("Invoice sudah lunas");
  }
  if (!isPaymentsEnabled()) {
    throw new Error("Pembayaran online belum tersedia");
  }

  const amount = Math.round(detail.total);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nominal invoice tidak valid");
  }

  const externalOrderId = `majiku-inv-${invoiceId.slice(0, 8)}-${crypto.randomUUID().slice(0, 8)}`;

  const [pending] = await db
    .insert(paymentOrders)
    .values({
      id: crypto.randomUUID(),
      invoiceId: detail.id,
      parentUserId: session.user.id,
      externalOrderId,
      productKey: "spp_invoice",
      amount: String(amount),
      currency: "IDR",
      paymentStatus: "pending",
    })
    .returning({ id: paymentOrders.id });

  try {
    const phone = detail.parentPhone?.trim();
    const result = await createPayCoreOrder({
      externalOrderId,
      amount,
      invoiceNumber: detail.invoiceNumber,
      invoiceId: detail.id,
      customer: {
        name: session.user.name ?? detail.parentName ?? "Orang Tua",
        email: session.user.email,
        ...(phone && phone.length >= 8 ? { phone } : {}),
      },
    });

    await db
      .update(paymentOrders)
      .set({ paycoreOrderId: result.paycoreOrderId, checkoutUrl: result.checkoutUrl, updatedAt: new Date() })
      .where(eq(paymentOrders.id, pending.id));

    return {
      checkoutUrl: result.checkoutUrl,
      qrString: result.qrString ?? null,
      expiresAt: result.expiresAt ?? null,
    };
  } catch (e) {
    // Order tetap pending di lokal untuk audit; pesan error asli diteruskan
    throw e;
  }
}

export async function checkInvoiceStatus(
  invoiceId: string
): Promise<{ isPaid: boolean; status: string }> {
  const session = await getSessionSafely();
  if (!session) {
    return { isPaid: false, status: "unauthenticated" };
  }

  const detail = await getMyInvoiceById(invoiceId);
  if (!detail) {
    return { isPaid: false, status: "not_found" };
  }

  return {
    isPaid: detail.status === "paid",
    status: detail.status,
  };
}
