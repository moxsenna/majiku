"use server";

import { headers } from "next/headers";
import { sql, eq, ne, desc, asc, and } from "drizzle-orm";
import { db } from "@/db";
import {
  students,
  classes,
  tutors,
  tutorClassAssignments,
  studentEnrollments,
  attendance,
  invoices,
  dailyReports,
  tenants,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { requireTenantContext } from "@/server/authz";
import { isDemoEmail } from "@/lib/demo";
import { todayInWib } from "@/lib/datetime";
import {
  demoDailyReports,
  demoAttendanceEntries,
  demoBirthdays,
  demoBillingItems,
  demoPendingReports,
  getDemoTutorsForWidget,
  getDemoClassesForWidget,
  type DemoDailyReport,
  type DemoBirthday,
  type DemoBillingItem,
  type DemoPendingReport,
} from "@/lib/demoData";

export interface AdminDashboardOverviewData {
  isDemo: boolean;
  totalStudents: number;
  totalCapacity: number;
  activeTutorsCount: number;
  activeClassesCount: number;
  todayPresentCount: number;
  todayAttendancePercent: number;
  monthlyRevenue: number;
  unpaidInvoicesSum: number;
  pendingReportsCount: number;
  unreadMessagesCount: number;
  // Detail collections
  classes: Array<{
    id: string;
    name: string;
    capacity: number;
    studentsCount: number;
    schedule?: string | null;
  }>;
  tutors: Array<{
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    className?: string;
  }>;
  todayAttendanceEntries: Array<{
    id: string;
    studentName: string;
    className: string;
    status: "present" | "absent" | "late" | "pending";
    checkInTime?: string | null;
  }>;
  recentDailyReports: DemoDailyReport[];
  pendingReports: DemoPendingReport[];
  birthdays: DemoBirthday[];
  billingItems: DemoBillingItem[];
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewData> {
  let session = null;
  try {
    const h = await headers();
    session = await auth.api.getSession({ headers: h });
  } catch {
    // default fallback for unauthenticated edge cases
  }

  const userEmail = session?.user?.email;
  const isDemo = isDemoEmail(userEmail);

  // Jika akun demo (*@majiku.test atau demo@majiku.id), sajikan mock dataset penuh
  if (isDemo) {
    const demoClassesWidget = getDemoClassesForWidget();
    const demoTutorsWidget = getDemoTutorsForWidget();
    return {
      isDemo: true,
      totalStudents: 156,
      totalCapacity: 180,
      activeTutorsCount: demoTutorsWidget.length,
      activeClassesCount: demoClassesWidget.length,
      todayPresentCount: 147,
      todayAttendancePercent: 94,
      monthlyRevenue: 234500000,
      unpaidInvoicesSum: 45500000,
      pendingReportsCount: demoPendingReports.length,
      unreadMessagesCount: 23,
      classes: demoClassesWidget.map((c) => ({
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        studentsCount: c.studentsCount,
        schedule: c.tutorName,
      })),
      tutors: demoTutorsWidget.map((t) => ({
        id: t.id,
        name: t.name,
        email: null,
        phone: null,
        className: t.className,
      })),
      todayAttendanceEntries: demoAttendanceEntries.map((a) => ({
        id: a.id,
        studentName: a.studentName,
        className: a.className,
        status: a.status,
        checkInTime: a.checkInTime,
      })),
      recentDailyReports: demoDailyReports,
      pendingReports: demoPendingReports,
      birthdays: demoBirthdays,
      billingItems: demoBillingItems,
    };
  }

  // --- QUERY REAL DATABASE UNTUK AKUN NON-DEMO (PRODUKSI) ---
  // Isolasi tenant: admin hanya melihat data lembaganya sendiri.
  const ctx = await requireTenantContext();
  const tenantId = ctx.tenantId;
  const todayDate = todayInWib();

  // 1. Total Siswa Aktif
  const [studentsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(and(eq(students.isActive, true), eq(students.tenantId, tenantId)));
  const totalStudents = studentsResult?.count || 0;

  // 2. Kelas & Total Kapasitas
  const dbClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      capacity: classes.capacity,
      schedule: classes.schedule,
    })
    .from(classes)
    .where(and(eq(classes.isActive, true), eq(classes.tenantId, tenantId)))
    .orderBy(asc(classes.name));

  const totalCapacity = dbClasses.reduce(
    (sum, c) => sum + (c.capacity || 0),
    0
  );

  // Ambil count enrollment per kelas (hanya kelas milik tenant)
  const enrollmentCounts = await db
    .select({
      classId: studentEnrollments.classId,
      count: sql<number>`count(*)::int`,
    })
    .from(studentEnrollments)
    .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
    .where(and(eq(studentEnrollments.isActive, true), eq(classes.tenantId, tenantId)))
    .groupBy(studentEnrollments.classId);

  const enrollmentMap = new Map<string, number>();
  for (const ec of enrollmentCounts) {
    enrollmentMap.set(ec.classId, ec.count);
  }

  const mappedClasses = dbClasses.map((c) => ({
    id: c.id,
    name: c.name,
    capacity: c.capacity || 0,
    studentsCount: enrollmentMap.get(c.id) || 0,
    schedule: c.schedule,
  }));

  // 3. Tutors Aktif
  const dbTutors = await db
    .select({
      id: tutors.id,
      name: tutors.name,
      email: tutors.email,
      phone: tutors.phone,
    })
    .from(tutors)
    .where(and(eq(tutors.isActive, true), eq(tutors.tenantId, tenantId)))
    .orderBy(asc(tutors.name));

  // Ambil penugasan kelas tutor
  const tutorAssignments = await db
    .select({
      tutorId: tutorClassAssignments.tutorId,
      className: classes.name,
    })
    .from(tutorClassAssignments)
    .innerJoin(classes, eq(classes.id, tutorClassAssignments.classId))
    .where(and(eq(tutorClassAssignments.isActive, true), eq(classes.tenantId, tenantId)));

  const tutorClassMap = new Map<string, string>();
  for (const ta of tutorAssignments) {
    tutorClassMap.set(ta.tutorId, ta.className);
  }

  const mappedTutors = dbTutors.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    className: tutorClassMap.get(t.id) || "Belum ditugaskan",
  }));

  // 4. Absensi Hari Ini
  const todayRecords = await db
    .select({
      id: attendance.id,
      studentName: students.name,
      className: classes.name,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
    })
    .from(attendance)
    .innerJoin(students, eq(students.id, attendance.studentId))
    .leftJoin(classes, eq(classes.id, attendance.classId))
    .where(and(eq(attendance.date, todayDate), eq(students.tenantId, tenantId)))
    .limit(20);

  const todayPresentCount = todayRecords.filter(
    (r) => r.status === "present"
  ).length;
  const todayAttendancePercent =
    totalStudents > 0
      ? Math.round((todayPresentCount / totalStudents) * 100)
      : 0;

  // 5. Keuangan / Invoices
  const [unpaidResult] = await db
    .select({ sum: sql<number>`coalesce(sum(${invoices.total}::numeric), 0)::int` })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(ne(invoices.status, "paid"), eq(students.tenantId, tenantId)));
  const unpaidInvoicesSum = unpaidResult?.sum || 0;

  // Pendapatan bulan berjalan (WIB), bukan akumulasi historis seluruh invoice lunas
  const [paidResult] = await db
    .select({ sum: sql<number>`coalesce(sum(${invoices.total}::numeric), 0)::int` })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(
      and(
        eq(invoices.status, "paid"),
        eq(students.tenantId, tenantId),
        sql`date_trunc('month', ${invoices.paidAt} AT TIME ZONE 'Asia/Jakarta') = date_trunc('month', now() AT TIME ZONE 'Asia/Jakarta')`
      )
    );
  const monthlyRevenue = paidResult?.sum || 0;

  const recentInvoices = await db
    .select({
      id: invoices.id,
      studentName: students.name,
      amount: invoices.total,
      status: invoices.status,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(eq(students.tenantId, tenantId))
    .orderBy(desc(invoices.createdAt))
    .limit(5);

  const mappedBillingItems: DemoBillingItem[] = recentInvoices.map((inv) => ({
    id: inv.id,
    parentName: "Orang Tua Siswa",
    studentName: inv.studentName,
    amount: Number(inv.amount) || 0,
    status: inv.status === "paid" ? "paid" : inv.status === "overdue" ? "overdue" : "unpaid",
    dueDate: inv.dueDate ? String(inv.dueDate) : todayDate,
  }));

  // 6. Laporan Harian (Draft Pending & Published Recent)
  const [draftReportsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dailyReports)
    .innerJoin(students, eq(students.id, dailyReports.studentId))
    .where(and(eq(dailyReports.status, "draft"), eq(students.tenantId, tenantId)));
  const pendingReportsCount = draftReportsResult?.count || 0;

  const recentReports = await db
    .select({
      id: dailyReports.id,
      studentName: students.name,
      className: classes.name,
      reportDate: dailyReports.reportDate,
      mood: dailyReports.mood,
      activities: dailyReports.activities,
      photos: dailyReports.photos,
    })
    .from(dailyReports)
    .innerJoin(students, eq(students.id, dailyReports.studentId))
    .leftJoin(classes, eq(classes.id, dailyReports.classId))
    .where(eq(students.tenantId, tenantId))
    .orderBy(desc(dailyReports.createdAt))
    .limit(5);

  const mappedRecentDailyReports: DemoDailyReport[] = recentReports.map((r) => ({
    id: r.id,
    studentName: r.studentName,
    studentAvatar: "",
    className: r.className || "Kelas Umum",
    time: r.reportDate ? String(r.reportDate) : todayDate,
    type: "activity",
    title: r.mood ? `Mood: ${r.mood}` : "Aktivitas Harian",
    description: r.activities || "Catatan kegiatan harian siswa.",
    imageUrl: r.photos && r.photos.length > 0 ? `/api/photos/${r.photos[0]}` : undefined,
    staffName: "Tutor",
  }));

  return {
    isDemo: false,
    totalStudents,
    totalCapacity,
    activeTutorsCount: dbTutors.length,
    activeClassesCount: dbClasses.length,
    todayPresentCount,
    todayAttendancePercent,
    monthlyRevenue,
    unpaidInvoicesSum,
    pendingReportsCount,
    unreadMessagesCount: 0,
    classes: mappedClasses,
    tutors: mappedTutors,
    todayAttendanceEntries: todayRecords.map((r) => ({
      id: r.id,
      studentName: r.studentName,
      className: r.className || "Kelas Umum",
      status: (r.status as "present" | "absent" | "late" | "pending") || "present",
      checkInTime: r.checkInTime ? String(r.checkInTime) : null,
    })),
    recentDailyReports: mappedRecentDailyReports,
    pendingReports: [],
    birthdays: [],
    billingItems: mappedBillingItems,
  };
}

export async function getTenantProfile() {
  const ctx = await requireTenantContext();
  return ctx.tenant || null;
}

export async function updateTenantProfile(input: {
  name: string;
  phone?: string;
  address?: string;
}) {
  const ctx = await requireTenantContext();

  // Akun demo tidak boleh mengubah data lembaga operasional nyata
  if (ctx.isDemo) {
    return { success: true, demo: true };
  }

  await db
    .update(tenants)
    .set({
      name: input.name,
      whatsapp: input.phone || null,
      address: input.address || null,
      updatedAt: new Date(),
    })
    // WAJIB scope ke tenant milik admin — bukan baris pertama tabel
    .where(eq(tenants.id, ctx.tenantId));

  return { success: true };
}
