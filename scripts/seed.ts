import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/db";
import {
  user,
  userRoles,
  classes,
  tutors,
  tutorClassAssignments,
  tutorBonuses,
  students,
  studentEnrollments,
  attendance,
  invoices,
  waitingList,
} from "../src/db/schema";

async function main() {
  console.log("Memulai seeding database demo...");

  // 1. BetterAuth Users (3 rows)
  await db
    .insert(user)
    .values([
      {
        id: "usr_admin",
        name: "Admin Majiku",
        email: "admin@majiku.test",
        emailVerified: true,
      },
      {
        id: "usr_tutor",
        name: "Bu Rina",
        email: "rina@majiku.test",
        emailVerified: true,
      },
      {
        id: "usr_parent",
        name: "Orang Tua Demo",
        email: "parent@majiku.test",
        emailVerified: true,
      },
    ])
    .onConflictDoNothing();

  // 2. User Roles (3 rows)
  await db
    .insert(userRoles)
    .values([
      { id: "ur_1", userId: "usr_admin", role: "admin" },
      { id: "ur_2", userId: "usr_tutor", role: "tutor" },
      { id: "ur_3", userId: "usr_parent", role: "parent" },
    ])
    .onConflictDoNothing();

  // 3. Classes (4 rows)
  await db
    .insert(classes)
    .values([
      {
        id: "cls_1",
        name: "Baby Bee",
        description: "Sensory & stimulasi motorik untuk usia 6-12 bulan",
        capacity: 8,
        pricePerMonth: "650000",
        sessionsPerMonth: 8,
        schedule: "Senin & Rabu, 09:00 - 10:00 WIB",
        location: "Ruang Bee (Lantai 1)",
        isActive: true,
      },
      {
        id: "cls_2",
        name: "Little Explorer",
        description: "Eksplorasi sensorik, bahasa, dan motorik kasar usia 1-2 tahun",
        capacity: 10,
        pricePerMonth: "750000",
        sessionsPerMonth: 8,
        schedule: "Selasa & Kamis, 10:00 - 11:30 WIB",
        location: "Ruang Explorer (Lantai 1)",
        isActive: true,
      },
      {
        id: "cls_3",
        name: "Smart Kids",
        description: "Pra-calistung, sosialisasi, dan kemandirian usia 3-4 tahun",
        capacity: 12,
        pricePerMonth: "850000",
        sessionsPerMonth: 8,
        schedule: "Senin & Kamis, 13:00 - 14:30 WIB",
        location: "Ruang Smart (Lantai 2)",
        isActive: true,
      },
      {
        id: "cls_4",
        name: "Creative Junior",
        description: "Seni lukis, kriya tangan, musik, & sains dasar usia 5-6 tahun",
        capacity: 12,
        pricePerMonth: "900000",
        sessionsPerMonth: 8,
        schedule: "Jumat & Sabtu, 09:30 - 11:00 WIB",
        location: "Studio Kreatif (Lantai 2)",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 4. Tutors (3 rows, tut_1 linked to usr_tutor)
  await db
    .insert(tutors)
    .values([
      {
        id: "tut_1",
        userId: "usr_tutor",
        name: "Rina Wulandari, S.Pd.",
        email: "rina@majiku.test",
        phone: "081234567891",
        isActive: true,
      },
      {
        id: "tut_2",
        userId: null,
        name: "Budi Santoso, M.Pd.",
        email: "budi.santoso@majiku.test",
        phone: "081234567892",
        isActive: true,
      },
      {
        id: "tut_3",
        userId: null,
        name: "Siti Nurhaliza, S.Psi.",
        email: "siti.nurhaliza@majiku.test",
        phone: "081234567893",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 5. Tutor Class Assignments
  await db
    .insert(tutorClassAssignments)
    .values([
      {
        id: "tca_1",
        tutorId: "tut_1",
        classId: "cls_1",
        ratePerSession: "125000",
        isActive: true,
      },
      {
        id: "tca_2",
        tutorId: "tut_1",
        classId: "cls_2",
        ratePerSession: "125000",
        isActive: true,
      },
      {
        id: "tca_3",
        tutorId: "tut_2",
        classId: "cls_3",
        ratePerSession: "150000",
        isActive: true,
      },
      {
        id: "tca_4",
        tutorId: "tut_3",
        classId: "cls_4",
        ratePerSession: "150000",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 6. Tutor Bonuses
  await db
    .insert(tutorBonuses)
    .values([
      {
        id: "tb_1",
        tutorId: "tut_1",
        amount: "500000",
        description: "Bonus kehadiran penuh bulan berjalan",
        month: 10,
        year: 2026,
      },
      {
        id: "tb_2",
        tutorId: "tut_2",
        amount: "350000",
        description: "Bonus evaluasi performa mengajar luar biasa",
        month: 10,
        year: 2026,
      },
    ])
    .onConflictDoNothing();

  // 7. Students (8 rows, stu_1 and stu_2 linked to usr_parent)
  await db
    .insert(students)
    .values([
      {
        id: "stu_1",
        name: "Ahmad Rizky Pratama",
        dateOfBirth: "2024-05-10",
        parentUserId: "usr_parent",
        parentName: "Orang Tua Demo",
        parentPhone: "081122334455",
        parentEmail: "parent@majiku.test",
        registrationDate: "2026-01-10",
        isActive: true,
      },
      {
        id: "stu_2",
        name: "Aisyah Putri Azzahra",
        dateOfBirth: "2024-08-15",
        parentUserId: "usr_parent",
        parentName: "Orang Tua Demo",
        parentPhone: "081122334455",
        parentEmail: "parent@majiku.test",
        registrationDate: "2026-01-15",
        isActive: true,
      },
      {
        id: "stu_3",
        name: "Bilal Al-Fatih",
        dateOfBirth: "2023-03-20",
        parentUserId: null,
        parentName: "Hendra Wijaya",
        parentPhone: "081299887711",
        parentEmail: "hendra.w@example.com",
        registrationDate: "2026-02-01",
        isActive: true,
      },
      {
        id: "stu_4",
        name: "Chantika Dewi",
        dateOfBirth: "2023-11-12",
        parentUserId: null,
        parentName: "Dewi Lestari",
        parentPhone: "081299887722",
        parentEmail: "dewi.l@example.com",
        registrationDate: "2026-02-15",
        isActive: true,
      },
      {
        id: "stu_5",
        name: "Danendra Rayyan",
        dateOfBirth: "2022-07-08",
        parentUserId: null,
        parentName: "Bambang Pamungkas",
        parentPhone: "081299887733",
        parentEmail: "bambang.p@example.com",
        registrationDate: "2026-03-01",
        isActive: true,
      },
      {
        id: "stu_6",
        name: "Elvira Kirana",
        dateOfBirth: "2022-09-25",
        parentUserId: null,
        parentName: "Ratna Sari",
        parentPhone: "081299887744",
        parentEmail: "ratna.s@example.com",
        registrationDate: "2026-03-10",
        isActive: true,
      },
      {
        id: "stu_7",
        name: "Fathan Maulana",
        dateOfBirth: "2021-04-14",
        parentUserId: null,
        parentName: "Gunawan Susanto",
        parentPhone: "081299887755",
        parentEmail: "gunawan.s@example.com",
        registrationDate: "2026-04-05",
        isActive: true,
      },
      {
        id: "stu_8",
        name: "Giselle Anastasya",
        dateOfBirth: "2021-12-02",
        parentUserId: null,
        parentName: "Silvia Anggraeni",
        parentPhone: "081299887766",
        parentEmail: "silvia.a@example.com",
        registrationDate: "2026-04-12",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 8. Student Enrollments (8 rows)
  await db
    .insert(studentEnrollments)
    .values([
      {
        id: "enr_1",
        studentId: "stu_1",
        classId: "cls_1",
        sessionsQuota: 8,
        sessionsUsed: 3,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-01-10",
        billingDay: 5,
        isActive: true,
      },
      {
        id: "enr_2",
        studentId: "stu_2",
        classId: "cls_1",
        sessionsQuota: 8,
        sessionsUsed: 4,
        freePermitsAllowed: 2,
        freePermitsUsed: 1,
        enrollmentDate: "2026-01-15",
        billingDay: 5,
        isActive: true,
      },
      {
        id: "enr_3",
        studentId: "stu_3",
        classId: "cls_2",
        sessionsQuota: 8,
        sessionsUsed: 2,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-02-01",
        billingDay: 10,
        isActive: true,
      },
      {
        id: "enr_4",
        studentId: "stu_4",
        classId: "cls_2",
        sessionsQuota: 8,
        sessionsUsed: 5,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-02-15",
        billingDay: 10,
        isActive: true,
      },
      {
        id: "enr_5",
        studentId: "stu_5",
        classId: "cls_3",
        sessionsQuota: 8,
        sessionsUsed: 6,
        freePermitsAllowed: 2,
        freePermitsUsed: 1,
        enrollmentDate: "2026-03-01",
        billingDay: 15,
        isActive: true,
      },
      {
        id: "enr_6",
        studentId: "stu_6",
        classId: "cls_3",
        sessionsQuota: 8,
        sessionsUsed: 3,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-03-10",
        billingDay: 15,
        isActive: true,
      },
      {
        id: "enr_7",
        studentId: "stu_7",
        classId: "cls_4",
        sessionsQuota: 8,
        sessionsUsed: 1,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-04-05",
        billingDay: 20,
        isActive: true,
      },
      {
        id: "enr_8",
        studentId: "stu_8",
        classId: "cls_4",
        sessionsQuota: 8,
        sessionsUsed: 4,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: "2026-04-12",
        billingDay: 20,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 9. Attendance (10 rows for today's date with varied statuses: present, absent, late, permit)
  const todayDate = new Date().toISOString().slice(0, 10);

  await db
    .insert(attendance)
    .values([
      {
        id: "att_1",
        studentId: "stu_1",
        classId: "cls_1",
        enrollmentId: "enr_1",
        date: todayDate,
        status: "present",
        checkInTime: "08:55:00",
        checkOutTime: "10:05:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_2",
        studentId: "stu_2",
        classId: "cls_1",
        enrollmentId: "enr_2",
        date: todayDate,
        status: "late",
        checkInTime: "09:20:00",
        checkOutTime: "10:00:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_3",
        studentId: "stu_3",
        classId: "cls_2",
        enrollmentId: "enr_3",
        date: todayDate,
        status: "present",
        checkInTime: "09:55:00",
        checkOutTime: "11:30:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_4",
        studentId: "stu_4",
        classId: "cls_2",
        enrollmentId: "enr_4",
        date: todayDate,
        status: "permit",
        permitType: "sick",
        permitReason: "Demam tinggi",
        isFreePermit: true,
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_5",
        studentId: "stu_5",
        classId: "cls_3",
        enrollmentId: "enr_5",
        date: todayDate,
        status: "absent",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_6",
        studentId: "stu_6",
        classId: "cls_3",
        enrollmentId: "enr_6",
        date: todayDate,
        status: "present",
        checkInTime: "12:55:00",
        checkOutTime: "14:30:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_7",
        studentId: "stu_7",
        classId: "cls_4",
        enrollmentId: "enr_7",
        date: todayDate,
        status: "present",
        checkInTime: "09:25:00",
        checkOutTime: "11:00:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_8",
        studentId: "stu_8",
        classId: "cls_4",
        enrollmentId: "enr_8",
        date: todayDate,
        status: "permit",
        permitType: "family",
        permitReason: "Acara keluarga ke luar kota",
        isFreePermit: false,
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_9",
        studentId: "stu_1",
        classId: "cls_2",
        enrollmentId: null,
        date: todayDate,
        status: "present",
        checkInTime: "10:00:00",
        checkOutTime: "11:30:00",
        checkedInBy: "usr_tutor",
      },
      {
        id: "att_10",
        studentId: "stu_2",
        classId: "cls_2",
        enrollmentId: null,
        date: todayDate,
        status: "late",
        checkInTime: "10:15:00",
        checkOutTime: "11:30:00",
        checkedInBy: "usr_tutor",
      },
    ])
    .onConflictDoNothing();

  // 10. Invoices (6 rows with varied statuses: unpaid, paid, overdue)
  await db
    .insert(invoices)
    .values([
      {
        id: "inv_1",
        invoiceNumber: "INV-202610-001",
        studentId: "stu_1",
        enrollmentId: "enr_1",
        amount: "650000",
        discount: "0",
        total: "650000",
        status: "paid",
        billingPeriodStart: "2026-10-01",
        billingPeriodEnd: "2026-10-31",
        dueDate: "2026-10-05",
        paidAt: new Date(),
        notes: "SPP Oktober 2026 - Lunas via Transfer BCA",
      },
      {
        id: "inv_2",
        invoiceNumber: "INV-202610-002",
        studentId: "stu_2",
        enrollmentId: "enr_2",
        amount: "650000",
        discount: "50000",
        total: "600000",
        status: "paid",
        billingPeriodStart: "2026-10-01",
        billingPeriodEnd: "2026-10-31",
        dueDate: "2026-10-05",
        paidAt: new Date(),
        notes: "SPP Oktober 2026 - Diskon Saudara Kandung Rp 50.000",
      },
      {
        id: "inv_3",
        invoiceNumber: "INV-202610-003",
        studentId: "stu_3",
        enrollmentId: "enr_3",
        amount: "750000",
        discount: "0",
        total: "750000",
        status: "unpaid",
        billingPeriodStart: "2026-10-01",
        billingPeriodEnd: "2026-10-31",
        dueDate: "2026-10-10",
        paidAt: null,
        notes: "SPP Oktober 2026 - Menunggu Pembayaran",
      },
      {
        id: "inv_4",
        invoiceNumber: "INV-202610-004",
        studentId: "stu_4",
        enrollmentId: "enr_4",
        amount: "750000",
        discount: "0",
        total: "750000",
        status: "unpaid",
        billingPeriodStart: "2026-10-01",
        billingPeriodEnd: "2026-10-31",
        dueDate: "2026-10-10",
        paidAt: null,
        notes: "SPP Oktober 2026 - Menunggu Pembayaran",
      },
      {
        id: "inv_5",
        invoiceNumber: "INV-202609-001",
        studentId: "stu_5",
        enrollmentId: "enr_5",
        amount: "850000",
        discount: "0",
        total: "850000",
        status: "overdue",
        billingPeriodStart: "2026-09-01",
        billingPeriodEnd: "2026-09-30",
        dueDate: "2026-09-15",
        paidAt: null,
        notes: "SPP September 2026 - Jatuh tempo terlewati",
      },
      {
        id: "inv_6",
        invoiceNumber: "INV-202609-002",
        studentId: "stu_6",
        enrollmentId: "enr_6",
        amount: "850000",
        discount: "100000",
        total: "750000",
        status: "overdue",
        billingPeriodStart: "2026-09-01",
        billingPeriodEnd: "2026-09-30",
        dueDate: "2026-09-15",
        paidAt: null,
        notes: "SPP September 2026 - Jatuh tempo terlewati",
      },
    ])
    .onConflictDoNothing();

  // 11. Waiting List (3 rows with waiting/notified status)
  await db
    .insert(waitingList)
    .values([
      {
        id: "wl_1",
        studentName: "Kenzo Alfarizi",
        parentName: "Orang Tua Demo",
        parentPhone: "081122334455",
        parentEmail: "parent@majiku.test",
        parentUserId: "usr_parent",
        classId: "cls_1",
        status: "waiting",
        priority: 1,
        notes: "Antrean utama kelas Baby Bee",
      },
      {
        id: "wl_2",
        studentName: "Lavinia Quinn",
        parentName: "Maya Indah",
        parentPhone: "081344556677",
        parentEmail: "maya.indah@example.com",
        parentUserId: null,
        classId: "cls_2",
        status: "notified",
        notifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        priority: 2,
        notes: "Sudah dikirim notifikasi ketersediaan slot",
      },
      {
        id: "wl_3",
        studentName: "Muhammad Rafa",
        parentName: "Rudi Hartono",
        parentPhone: "081377889900",
        parentEmail: "rudi.h@example.com",
        parentUserId: null,
        classId: "cls_3",
        status: "waiting",
        priority: 1,
        notes: "Menunggu pembukaan jadwal baru",
      },
    ])
    .onConflictDoNothing();

  // Verifikasi jumlah baris per tabel
  const tables = [
    "user",
    "user_roles",
    "classes",
    "tutors",
    "tutor_class_assignments",
    "tutor_bonuses",
    "students",
    "student_enrollments",
    "attendance",
    "invoices",
    "waiting_list",
  ];

  console.log("Verifikasi jumlah baris di database:");
  for (const tableName of tables) {
    const res = await db.execute<{ count: string }>(
      sql.raw(`SELECT count(*)::text as count FROM "${tableName}"`)
    );
    console.log(`- ${tableName}: ${res.rows[0]?.count ?? 0} baris`);
  }

  console.log("Seed selesai");
  process.exit(0);
}

main().catch((e) => {
  console.error("Gagal menjalankan seed:", e);
  process.exit(1);
});
