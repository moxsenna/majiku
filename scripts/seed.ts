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
  tenants,
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

  // 12. Tenants (10 rows for marketplace)
  await db
    .insert(tenants)
    .values([
      {
        id: "tnt_1",
        slug: "majiku-kids",
        name: "Majiku Kids",
        type: "daycare",
        tagline: "Sensory Daycare & Early Learning Space",
        description:
          "Daycare dan kelas stimulasi tumbuh kembang anak berbasis sensorik dan bermain aktif di Tangerang.",
        city: "Tangerang",
        address: "Jl. Boulevard Bintaro Jaya Blok B7, Tangerang Selatan",
        latitude: "-6.2758",
        longitude: "106.7082",
        priceFrom: "700000",
        programs: [
          {
            name: "Tiny Tints",
            ageRange: "2-4 tahun",
            priceFrom: "700000",
          },
          {
            name: "Majiku Pop Up Class",
            ageRange: "2-3 tahun",
            priceFrom: "125000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
        ],
        whatsapp: "6281234567890",
        isVerified: true,
        isActive: true,
      },
      {
        id: "tnt_2",
        slug: "lentera-kecil-preschool",
        name: "Lentera Kecil Preschool",
        type: "preschool",
        tagline: "Montessori Early Childhood Education",
        description:
          "Preschool dengan pendekatan Montessori berstandar internasional untuk kemandirian dan rasa ingin tahu anak.",
        city: "Jakarta Selatan",
        address: "Jl. Kemang Raya No. 42, Jakarta Selatan",
        latitude: "-6.2608",
        longitude: "106.8157",
        priceFrom: "2500000",
        programs: [
          {
            name: "Toddler Community",
            ageRange: "1.5-3 tahun",
            priceFrom: "2500000",
          },
          {
            name: "Children House",
            ageRange: "3-6 tahun",
            priceFrom: "3200000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        ],
        whatsapp: "6281198765432",
        isVerified: true,
        isActive: true,
      },
      {
        id: "tnt_3",
        slug: "bintang-pelajar-bimbel-depok",
        name: "Bimbel Bintang Prestasi Depok",
        type: "bimbel",
        tagline: "Bimbingan Belajar SD & Persiapan Masuk SMP Unggulan",
        description:
          "Bimbel interaktif dengan metode pemahaman konsep logika dan pendampingan PR harian anak.",
        city: "Depok",
        address: "Jl. Margonda Raya No. 180, Depok",
        latitude: "-6.3725",
        longitude: "106.8322",
        priceFrom: "850000",
        programs: [
          {
            name: "Kelas Reguler SD",
            ageRange: "6-12 tahun",
            priceFrom: "850000",
          },
          {
            name: "Intensif Ujian & Olimpiade",
            ageRange: "9-12 tahun",
            priceFrom: "1400000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
        ],
        whatsapp: "6281311223344",
        isVerified: true,
        isActive: true,
      },
      {
        id: "tnt_4",
        slug: "tunas-harapan-daycare-bandung",
        name: "Tunas Harapan Daycare",
        type: "daycare",
        tagline: "Home Away From Home for Your Little Ones",
        description:
          "Penitipan anak ramah dan aman dengan pengawasan dokter anak berkala serta asupan nutrisi sehat di Bandung.",
        city: "Bandung",
        address: "Jl. R.E. Martadinata No. 88, Bandung",
        latitude: "-6.9080",
        longitude: "107.6163",
        priceFrom: "1800000",
        programs: [
          {
            name: "Full Day Care",
            ageRange: "3 bulan - 4 tahun",
            priceFrom: "2200000",
          },
          {
            name: "Half Day Stimulasi",
            ageRange: "1-4 tahun",
            priceFrom: "1800000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
        ],
        whatsapp: "6281722334455",
        isVerified: true,
        isActive: true,
      },
      {
        id: "tnt_5",
        slug: "mentari-preschool-surabaya",
        name: "Mentari Preschool Surabaya",
        type: "preschool",
        tagline: "Nurturing Curious and Confident Minds",
        description:
          "Pendidikan anak usia dini berbasis kurikulum bilingual (Indonesia - Inggris) dengan fokus sosio-emosional.",
        city: "Surabaya",
        address: "Jl. Raya Darmo Permai II No. 15, Surabaya",
        latitude: "-7.2831",
        longitude: "112.6845",
        priceFrom: "2100000",
        programs: [
          {
            name: "Nursery",
            ageRange: "2-3 tahun",
            priceFrom: "2100000",
          },
          {
            name: "Kindergarten A & B",
            ageRange: "4-6 tahun",
            priceFrom: "2800000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
        ],
        whatsapp: "6281933445566",
        isVerified: true,
        isActive: true,
      },
      {
        id: "tnt_6",
        slug: "cerdas-ceria-bimbel-bekasi",
        name: "Cerdas Ceria Learning Center",
        type: "bimbel",
        tagline: "Belajar Menyenangkan, Nilai Membanggakan",
        description:
          "Bimbel baca tulis hitung (calistung) dan matematika kreatif anak usia dini hingga sekolah dasar di Bekasi.",
        city: "Bekasi",
        address: "Jl. Boulevard Raya Grand Galaxy City Ruko RGA No. 12, Bekasi",
        latitude: "-6.2635",
        longitude: "106.9744",
        priceFrom: "750000",
        programs: [
          {
            name: "Calistung Fun Learning",
            ageRange: "4-6 tahun",
            priceFrom: "750000",
          },
          {
            name: "Matematika Logika Cilik",
            ageRange: "7-10 tahun",
            priceFrom: "950000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
        ],
        whatsapp: "6281544556677",
        isVerified: false,
        isActive: true,
      },
      {
        id: "tnt_7",
        slug: "kasih-bunda-daycare-tangerang",
        name: "Kasih Bunda Daycare & Nursery",
        type: "daycare",
        tagline: "Kasih Sayang Ibu di Tempat Penitipan Terpercaya",
        description:
          "Fasilitas penitipan anak dengan CCTV online 24 jam untuk orang tua dan menu gizi terstandarisasi.",
        city: "Tangerang",
        address: "Jl. MH Thamrin No. 25, Cikokol, Tangerang",
        latitude: "-6.2088",
        longitude: "106.6342",
        priceFrom: "1500000",
        programs: [
          {
            name: "Infant Care",
            ageRange: "2-12 bulan",
            priceFrom: "2000000",
          },
          {
            name: "Toddler Daycare",
            ageRange: "1-3 tahun",
            priceFrom: "1500000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1596464716127-f2a829822301?w=800",
        ],
        whatsapp: "6281255667788",
        isVerified: false,
        isActive: true,
      },
      {
        id: "tnt_8",
        slug: "pelangi-preschool-jakarta",
        name: "Pelangi Nusantara Preschool",
        type: "preschool",
        tagline: "Play, Learn, and Grow Together",
        description:
          "Mendorong kecerdasan majemuk (multiple intelligences) anak melalui seni, musik, dan eksplorasi sains.",
        city: "Jakarta Selatan",
        address: "Jl. Tebet Barat Dalam Raya No. 50, Jakarta Selatan",
        latitude: "-6.2415",
        longitude: "106.8485",
        priceFrom: "2800000",
        programs: [
          {
            name: "Early Explorers",
            ageRange: "2-3 tahun",
            priceFrom: "2800000",
          },
          {
            name: "Kindy Creative",
            ageRange: "4-5 tahun",
            priceFrom: "3500000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
        ],
        whatsapp: "6281366778899",
        isVerified: false,
        isActive: true,
      },
      {
        id: "tnt_9",
        slug: "al-falah-bimbel-quran-depok",
        name: "Al-Falah Islamic Tutoring",
        type: "bimbel",
        tagline: "Membentuk Generasi Cerdas dan Berakhlak Mulia",
        description:
          "Bimbingan tahsin Al-Quran dan pendampingan materi akademik sekolah dasar dengan suasana islami.",
        city: "Depok",
        address: "Jl. Siliwangi No. 14, Depok",
        latitude: "-6.4025",
        longitude: "106.8285",
        priceFrom: "700000",
        programs: [
          {
            name: "Tahsin & Iqro Cilik",
            ageRange: "4-8 tahun",
            priceFrom: "700000",
          },
          {
            name: "Bimbel Tematik SD",
            ageRange: "7-12 tahun",
            priceFrom: "900000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=800",
        ],
        whatsapp: "6281877889900",
        isVerified: false,
        isActive: true,
      },
      {
        id: "tnt_10",
        slug: "sahabat-kecil-daycare-bandung",
        name: "Sahabat Kecil Daycare",
        type: "daycare",
        tagline: "Ruang Tumbuh Nyaman dan Hangat Bagi Buah Hati",
        description:
          "Daycare dengan area outdoor luas di Bandung utara untuk melatih motorik kasar dan koneksi anak dengan alam.",
        city: "Bandung",
        address: "Jl. Setiabudi No. 102, Bandung",
        latitude: "-6.8645",
        longitude: "107.5932",
        priceFrom: "1600000",
        programs: [
          {
            name: "Daycare Harian / Drop-in",
            ageRange: "1-5 tahun",
            priceFrom: "150000",
          },
          {
            name: "Daycare Bulanan Full Day",
            ageRange: "1-5 tahun",
            priceFrom: "1600000",
          },
        ],
        photos: [
          "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800",
        ],
        whatsapp: "6281988990011",
        isVerified: false,
        isActive: true,
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
    "tenants",
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
