import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import {
  tenants,
  user,
  account,
  userRoles,
  classes,
  tutors,
  tutorClassAssignments,
  students,
  studentEnrollments,
  attendance,
  invoices,
  dailyReports,
  conversations,
  messages,
} from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { isDemoEmail, isDemoTenant, DEMO_TENANT_ID } from "../src/lib/demo";
import { assertDemoMutationLock, DemoMutationError } from "../src/server/authz";
import { todayInWib } from "../src/lib/datetime";

async function runVerification() {
  console.log("=================================================");
  console.log("   VERIFIKASI BUNAYO DEMO & MUTATION LOCK        ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Check isDemoEmail & isDemoTenant
  assert(isDemoEmail("admin@bunayo.test"), "admin@bunayo.test terdeteksi sebagai demo");
  assert(isDemoEmail("tutor@bunayo.test"), "tutor@bunayo.test terdeteksi sebagai demo");
  assert(isDemoEmail("parent@bunayo.test"), "parent@bunayo.test terdeteksi sebagai demo");
  assert(isDemoEmail("admin.test@gmail.com"), "admin.test@gmail.com terdeteksi sebagai demo");
  assert(isDemoEmail("tutor.test@gmail.com"), "tutor.test@gmail.com terdeteksi sebagai demo");
  assert(isDemoEmail("parent.test@gmail.com"), "parent.test@gmail.com terdeteksi sebagai demo");
  assert(!isDemoEmail("owner@gmail.com"), "owner@gmail.com TIDAK terdeteksi sebagai demo");
  assert(isDemoTenant(DEMO_TENANT_ID), "isDemoTenant(tnt_demo) bernilai true");

  // 2. Check Mutation Lock
  try {
    assertDemoMutationLock({ user: { email: "admin@bunayo.test", id: "u1" } } as any, "tnt_demo");
    assert(false, "Mutation lock harus throw DemoMutationError untuk admin@bunayo.test");
  } catch (err) {
    assert(err instanceof DemoMutationError, "Mutation lock melempar DemoMutationError dengan benar");
  }

  try {
    assertDemoMutationLock({ user: { email: "prod_user@gmail.com", id: "u2" } } as any, "tnt_real");
    assert(true, "Mutation lock mengizinkan mutasi pada tenant non-demo");
  } catch {
    assert(false, "Mutation lock tidak boleh melempar error untuk tenant non-demo");
  }

  // 3. Check Tenant Bunayo Demo in DB
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT_ID)).limit(1);
  assert(!!tenant, "Tenant tnt_demo ada di database Neon");
  assert(tenant?.name === "Bunayo Daycare Demo", `Nama tenant: ${tenant?.name}`);

  // 4. Check Demo Users & Credentials in account table
  const testEmails = [
    "admin@bunayo.test",
    "tutor@bunayo.test",
    "parent@bunayo.test",
    "admin.test@gmail.com",
    "tutor.test@gmail.com",
    "parent.test@gmail.com",
  ];

  for (const em of testEmails) {
    const [u] = await db.select().from(user).where(eq(user.email, em)).limit(1);
    assert(!!u, `User ${em} terdaftar di tabel user`);
    if (u) {
      const [acc] = await db.select().from(account).where(eq(account.userId, u.id)).limit(1);
      assert(!!acc && !!acc.password, `User ${em} memiliki credential password di tabel account`);
    }
  }

  // 5. Check Classes & Tutor Synchronization
  const demoClasses = await db.select().from(classes).where(eq(classes.tenantId, DEMO_TENANT_ID));
  assert(demoClasses.length >= 2, `Jumlah kelas di tnt_demo: ${demoClasses.length} (minimal 2)`);

  const [tutorRina] = await db.select().from(tutors).where(eq(tutors.id, "tut_demo_rina")).limit(1);
  assert(!!tutorRina, `Tutor Bu Rina (tut_demo_rina) terdaftar`);

  const [assignment] = await db
    .select()
    .from(tutorClassAssignments)
    .where(eq(tutorClassAssignments.tutorId, "tut_demo_rina"))
    .limit(1);
  assert(!!assignment, `Bu Rina ditugaskan di kelas (ID: ${assignment?.classId})`);

  // 6. Check Students & Cross-Portal Synchronization
  const demoStudents = await db.select().from(students).where(eq(students.tenantId, DEMO_TENANT_ID));
  assert(demoStudents.length >= 4, `Jumlah siswa sinkron: ${demoStudents.length} siswa (Aisyah, Raka, Keisha, Arjuna, dkk)`);

  const [aisyah] = await db.select().from(students).where(eq(students.id, "stu_demo_aisyah")).limit(1);
  assert(!!aisyah, "Siswa Aisyah Putri (stu_demo_aisyah) ditemukan");
  assert(aisyah?.photoUrl?.includes("student-aisyah.jpg") || false, "Foto Aisyah Putri menggunakan asset lokal Indonesia");

  // 7. Check Attendance Today
  const today = todayInWib();
  const todayAtt = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.date, today), eq(attendance.classId, "cls_bunga_matahari")));
  assert(todayAtt.length === 4, `Absensi hari ini (${today}): ${todayAtt.length} siswa tercatat`);

  // 8. Check Invoices Synchronization
  const demoInvoices = await db
    .select()
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .where(eq(students.tenantId, DEMO_TENANT_ID));
  assert(demoInvoices.length >= 2, `Tagihan SPP sinkron: ${demoInvoices.length} tagihan`);

  // 9. Check Daily Reports
  const reports = await db.select().from(dailyReports).where(eq(dailyReports.studentId, "stu_demo_aisyah"));
  assert(reports.length >= 2, `Laporan harian Aisyah: ${reports.length} laporan`);

  // 10. Check Conversations
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, "conv_demo_parent_tutor"));
  assert(!!conv, "Thread obrolan antara Bu Rina dan Ibu Anita tersedia");

  console.log("\n=================================================");
  console.log(`HASIL: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
