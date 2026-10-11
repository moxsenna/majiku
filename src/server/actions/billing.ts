"use server";

import { headers } from "next/headers";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { invoices, studentEnrollments, students, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { requireTenantContext } from "@/server/authz";

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  studentId: string;
  enrollmentId: string | null;
  amount: number;
  discount: number;
  total: number;
  status: string;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  studentName: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  registrationDate: string | null;
  // Backward compatibility aliases
  invoice_number: string;
  student_id: string;
  enrollment_id: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  due_date: string | null;
  paid_at: string | null;
  students: {
    name: string;
    parent_name: string | null;
    parent_email: string | null;
    parent_phone: string | null;
    registration_date: string | null;
  };
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function getInvoices(): Promise<InvoiceRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isParent) return [];

  const conditions = [];
  if (isAdmin) {
    const ctx = await requireTenantContext();
    conditions.push(eq(students.tenantId, ctx.tenantId));
  } else if (isParent) {
    conditions.push(
      session.user.email
        ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))!
        : eq(students.parentUserId, session.user.id)
    );
  }

  const query = db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      studentId: invoices.studentId,
      enrollmentId: invoices.enrollmentId,
      amount: invoices.amount,
      discount: invoices.discount,
      total: invoices.total,
      status: invoices.status,
      billingPeriodStart: invoices.billingPeriodStart,
      billingPeriodEnd: invoices.billingPeriodEnd,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      notes: invoices.notes,
      studentName: students.name,
      parentName: students.parentName,
      parentEmail: students.parentEmail,
      parentPhone: students.parentPhone,
      registrationDate: students.registrationDate,
    })
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .orderBy(desc(invoices.dueDate));

  const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    studentId: r.studentId,
    enrollmentId: r.enrollmentId,
    amount: Number(r.amount ?? 0),
    discount: Number(r.discount ?? 0),
    total: Number(r.total ?? 0),
    status: r.status,
    billingPeriodStart: r.billingPeriodStart ? String(r.billingPeriodStart) : null,
    billingPeriodEnd: r.billingPeriodEnd ? String(r.billingPeriodEnd) : null,
    dueDate: r.dueDate ? String(r.dueDate) : null,
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    notes: r.notes,
    studentName: r.studentName,
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    parentPhone: r.parentPhone,
    registrationDate: r.registrationDate ? String(r.registrationDate) : null,
    invoice_number: r.invoiceNumber,
    student_id: r.studentId,
    enrollment_id: r.enrollmentId,
    billing_period_start: r.billingPeriodStart ? String(r.billingPeriodStart) : null,
    billing_period_end: r.billingPeriodEnd ? String(r.billingPeriodEnd) : null,
    due_date: r.dueDate ? String(r.dueDate) : null,
    paid_at: r.paidAt ? r.paidAt.toISOString() : null,
    students: {
      name: r.studentName,
      parent_name: r.parentName,
      parent_email: r.parentEmail,
      parent_phone: r.parentPhone,
      registration_date: r.registrationDate ? String(r.registrationDate) : null,
    },
  }));
}

export interface BillingEnrollmentRow {
  id: string;
  studentId: string;
  classId: string;
  billingDay: number | null;
  studentName: string;
  className: string;
  pricePerMonth: number;
  // Backward compatibility aliases
  student_id: string;
  class_id: string;
  billing_day: number | null;
  students: { name: string };
  classes: { name: string; price_per_month: number };
}

export async function getBillingEnrollments(): Promise<BillingEnrollmentRow[]> {
  const session = await getSessionSafely();
  if (!session) return [];
  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAdmin = roles.includes("admin") || roles.includes("moderator");
  const isParent = roles.includes("parent");

  if (!isAdmin && !isParent) return [];

  const conditions = [eq(studentEnrollments.isActive, true)];
  if (isAdmin) {
    const ctx = await requireTenantContext();
    conditions.push(eq(students.tenantId, ctx.tenantId));
  } else if (isParent) {
    conditions.push(
      session.user.email
        ? or(eq(students.parentUserId, session.user.id), eq(students.parentEmail, session.user.email))!
        : eq(students.parentUserId, session.user.id)
    );
  }

  const rows = await db
    .select({
      id: studentEnrollments.id,
      studentId: studentEnrollments.studentId,
      classId: studentEnrollments.classId,
      billingDay: studentEnrollments.billingDay,
      studentName: students.name,
      className: classes.name,
      pricePerMonth: classes.pricePerMonth,
    })
    .from(studentEnrollments)
    .innerJoin(students, eq(studentEnrollments.studentId, students.id))
    .innerJoin(classes, eq(studentEnrollments.classId, classes.id))
    .where(and(...conditions));

  return rows.map((r) => {
    const price = Number(r.pricePerMonth ?? 0);
    return {
      id: r.id,
      studentId: r.studentId,
      classId: r.classId,
      billingDay: r.billingDay,
      studentName: r.studentName,
      className: r.className,
      pricePerMonth: price,
      student_id: r.studentId,
      class_id: r.classId,
      billing_day: r.billingDay,
      students: { name: r.studentName },
      classes: { name: r.className, price_per_month: price },
    };
  });
}

export async function markInvoicePaid(invoiceId: string) {
  const ctx = await requireTenantContext();
  if (!invoiceId) throw new Error("ID invoice wajib diisi");

  const scopedInvoices = db
    .select({ id: invoices.id })
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .where(and(eq(invoices.id, invoiceId), eq(students.tenantId, ctx.tenantId)));

  const result = await db
    .update(invoices)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(inArray(invoices.id, scopedInvoices))
    .returning({ id: invoices.id });

  if (result.length === 0) {
    throw new Error("Invoice tidak ditemukan");
  }

  return { success: true };
}

export interface CreateInvoiceInput {
  studentId: string;
  amount: number;
  discount?: number;
  dueDate: string;
  notes?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
}

export async function createInvoice(input: CreateInvoiceInput) {
  const ctx = await requireTenantContext();

  if (!input.studentId) throw new Error("Pilih siswa terlebih dahulu");
  if (!input.amount || input.amount <= 0) throw new Error("Nominal tagihan harus lebih dari 0");
  if (!input.dueDate) throw new Error("Tanggal jatuh tempo wajib diisi");

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, input.studentId), eq(students.tenantId, ctx.tenantId)))
    .limit(1);

  if (!student) throw new Error("Data siswa tidak ditemukan");

  const [enrollment] = await db
    .select({ id: studentEnrollments.id })
    .from(studentEnrollments)
    .where(and(eq(studentEnrollments.studentId, input.studentId), eq(studentEnrollments.isActive, true)))
    .limit(1);

  const discount = input.discount ? Number(input.discount) : 0;
  const total = Math.max(0, Number(input.amount) - discount);
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${yearMonth}-${randomSuffix}`;
  const id = crypto.randomUUID();

  await db.insert(invoices).values({
    id,
    invoiceNumber,
    studentId: input.studentId,
    enrollmentId: enrollment?.id || null,
    amount: String(input.amount),
    discount: String(discount),
    total: String(total),
    status: "unpaid",
    billingPeriodStart: input.billingPeriodStart || null,
    billingPeriodEnd: input.billingPeriodEnd || null,
    dueDate: input.dueDate,
    notes: input.notes || null,
  });

  return { success: true, id, invoiceNumber };
}

export async function getBillingStudentOptions(): Promise<Array<{ id: string; name: string }>> {
  const ctx = await requireTenantContext();

  return await db
    .select({ id: students.id, name: students.name })
    .from(students)
    .where(and(eq(students.tenantId, ctx.tenantId), eq(students.isActive, true)))
    .orderBy(asc(students.name));
}
