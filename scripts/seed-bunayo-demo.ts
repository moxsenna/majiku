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
  galleryPhotos,
  conversations,
  messages,
  announcements,
} from "../src/db/schema";
import { eq, or, sql } from "drizzle-orm";

// Scrypt hash for "Password123!" in BetterAuth
const PASSWORD_HASH =
  "92f6dd6a5f7f21dafd5382eed62a0190:9db66ef79b89c2b9513ce3c4d88f3a62007eba70e82a755d2b9c1f1823a45887a83be3f578a9b3a3f5a8baa7f5dccdd22d77de65d441d06fc17cb4e1cd3459a5";

function getTodayWib(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.toISOString().slice(0, 10);
}

function getPastDate(daysAgo: number): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000 - daysAgo * 86400000);
  return wib.toISOString().slice(0, 10);
}

function getFutureDate(daysAhead: number): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000 + daysAhead * 86400000);
  return wib.toISOString().slice(0, 10);
}

async function main() {
  console.log("=== SEEDING BUNAYO DEMO TENANT (tnt_demo) ===");
  const today = getTodayWib();
  console.log(`Today WIB: ${today}`);

  // 1. Tenant: Bunayo Daycare Demo
  await db
    .insert(tenants)
    .values([
      {
        id: "tnt_demo",
        name: "Bunayo Daycare Demo",
        slug: "bunayo-demo",
        type: "daycare",
        tagline: "Daycare Ramah Anak & Edukasi Karakter Holistik",
        description:
          "Lembaga percontohan resmi Bunayo untuk simulasi operasional daycare, kelas anak, absensi terpadu, dan monitoring perkembangan harian.",
        city: "Jakarta Selatan",
        address: "Jl. Melati Indah No. 12, Kebayoran Baru, Jakarta Selatan",
        priceFrom: "1500000",
        programs: [
          {
            name: "Daycare Full Day",
            description: "Pendampingan penuh 07:00 - 17:30 dengan makan bergizi & stimulasi karakter",
            ageRange: "1-5 tahun",
            priceFrom: "2.500.000",
          },
          {
            name: "Kelas Bunga Matahari",
            description: "Sensory & motorik halus kelompok bermain",
            ageRange: "3-4 tahun",
            priceFrom: "1.500.000",
          },
          {
            name: "Kelas Pelangi",
            description: "Eksplorasi pra-sekolah, seni, dan kreativitas",
            ageRange: "4-5 tahun",
            priceFrom: "1.750.000",
          },
        ],
        photos: [
          "/images/daycare/daycare-hero.webp",
          "/images/daycare/daycare-sensory.webp",
          "/images/reports/report-art-activity.webp",
        ],
        whatsapp: "081234567890",
        adminUserId: "usr_demo_admin",
        isVerified: true,
        isActive: true,
      },
    ])
    .onConflictDoUpdate({
      target: tenants.id,
      set: {
        name: "Bunayo Daycare Demo",
        slug: "bunayo-demo",
        adminUserId: "usr_demo_admin",
        isActive: true,
      },
    });
  console.log("✓ Tenant tnt_demo siap.");

  // 2. Demo Users & Aliases
  interface DemoUserDef {
    id: string;
    email: string;
    name: string;
    role: "admin" | "tutor" | "parent";
    image: string;
  }

  const demoUsers: DemoUserDef[] = [
    // Primary accounts
    { id: "usr_demo_admin", email: "admin@bunayo.test", name: "Admin Bunayo", role: "admin", image: "/images/avatars/admin-avatar.webp" },
    { id: "usr_demo_tutor", email: "tutor@bunayo.test", name: "Bu Rina Wijaya (Tutor)", role: "tutor", image: "/images/avatars/parent-rina.webp" },
    { id: "usr_demo_parent", email: "parent@bunayo.test", name: "Ibu Anita (Bunda Aisyah)", role: "parent", image: "/images/avatars/parent-anita.webp" },

    // Aliases
    { id: "usr_demo_admin_gmail", email: "admin.test@gmail.com", name: "Admin Bunayo (Gmail)", role: "admin", image: "/images/avatars/admin-avatar.webp" },
    { id: "usr_demo_tutor_gmail", email: "tutor.test@gmail.com", name: "Bu Rina Wijaya (Gmail)", role: "tutor", image: "/images/avatars/parent-rina.webp" },
    { id: "usr_demo_parent_gmail", email: "parent.test@gmail.com", name: "Ibu Anita (Gmail)", role: "parent", image: "/images/avatars/parent-anita.webp" },
    { id: "usr_demo_rina_bunayo", email: "rina@bunayo.test", name: "Bu Rina Wijaya", role: "tutor", image: "/images/avatars/parent-rina.webp" },

    // Legacy aliases
    { id: "usr_demo_admin_leg", email: "admin@majiku.test", name: "Admin Bunayo (Legacy)", role: "admin", image: "/images/avatars/admin-avatar.webp" },
    { id: "usr_demo_rina_leg", email: "rina@majiku.test", name: "Bu Rina (Legacy)", role: "tutor", image: "/images/avatars/parent-rina.webp" },
    { id: "usr_demo_parent_leg", email: "parent@majiku.test", name: "Ibu Anita (Legacy)", role: "parent", image: "/images/avatars/parent-anita.webp" },
  ];

  for (const u of demoUsers) {
    const [byEmail] = await db.select().from(user).where(eq(user.email, u.email));
    const [byId] = await db.select().from(user).where(eq(user.id, u.id));

    let effectiveUserId = u.id;

    if (byEmail) {
      effectiveUserId = byEmail.id;
      await db
        .update(user)
        .set({ name: u.name, emailVerified: true, image: u.image })
        .where(eq(user.id, effectiveUserId));
    } else if (byId) {
      effectiveUserId = byId.id;
      await db
        .update(user)
        .set({ email: u.email, name: u.name, emailVerified: true, image: u.image })
        .where(eq(user.id, effectiveUserId));
    } else {
      await db
        .insert(user)
        .values({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: true,
          image: u.image,
        });
    }

    // Upsert account with Password123!
    const [acc] = await db.select().from(account).where(eq(account.userId, effectiveUserId));
    if (acc) {
      await db
        .update(account)
        .set({ password: PASSWORD_HASH, providerId: "credential", accountId: effectiveUserId })
        .where(eq(account.id, acc.id));
    } else {
      await db.insert(account).values({
        id: `acc_${effectiveUserId.slice(0, 24)}`,
        userId: effectiveUserId,
        // better-auth signInEmail mensyaratkan accountId === userId utk akun credential.
        accountId: effectiveUserId,
        providerId: "credential",
        password: PASSWORD_HASH,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Role
    await db
      .insert(userRoles)
      .values({
        id: `ur_${effectiveUserId.slice(0, 18)}_${u.role}`,
        userId: effectiveUserId,
        role: u.role,
      })
      .onConflictDoNothing();
  }
  console.log("✓ Semua akun demo & credential Password123! siap.");

  // 3. Classes
  await db
    .insert(classes)
    .values([
      {
        id: "cls_bunga_matahari",
        tenantId: "tnt_demo",
        name: "Kelas Bunga Matahari",
        description: "Kelas stimulasi sensory, motorik halus, dan kemandirian untuk usia 3-4 tahun.",
        capacity: 15,
        pricePerMonth: "1500000",
        sessionsPerMonth: 20,
        schedule: "Senin - Jumat, 08:00 - 12:00 WIB",
        location: "Ruang Matahari (Lantai 1)",
        isActive: true,
      },
      {
        id: "cls_pelangi",
        tenantId: "tnt_demo",
        name: "Kelas Pelangi",
        description: "Kelas pra-sekolah dengan eksplorasi seni, kreativitas, dan sosialisasi usia 4-5 tahun.",
        capacity: 12,
        pricePerMonth: "1750000",
        sessionsPerMonth: 20,
        schedule: "Senin - Jumat, 08:00 - 12:00 WIB",
        location: "Ruang Pelangi (Lantai 2)",
        isActive: true,
      },
    ])
    .onConflictDoUpdate({
      target: classes.id,
      set: {
        tenantId: "tnt_demo",
        name: "Kelas Bunga Matahari",
        isActive: true,
      },
    });
  console.log("✓ Kelas siap.");

  // 4. Tutors
  const [tutorUser] = await db.select().from(user).where(eq(user.email, "tutor@bunayo.test"));
  const tutorUserId = tutorUser?.id || "usr_demo_tutor";

  await db
    .insert(tutors)
    .values([
      {
        id: "tut_demo_rina",
        tenantId: "tnt_demo",
        userId: tutorUserId,
        name: "Bu Rina Wijaya",
        email: "tutor@bunayo.test",
        phone: "081234567891",
        photoUrl: "/images/avatars/parent-rina.webp",
        isActive: true,
      },
      {
        id: "tut_demo_maya",
        tenantId: "tnt_demo",
        name: "Ibu Maya Sari",
        email: "maya@bunayo.test",
        phone: "081234567892",
        photoUrl: "/images/avatars/tutor-maya.webp",
        isActive: true,
      },
      {
        id: "tut_demo_dina",
        tenantId: "tnt_demo",
        name: "Ibu Dina Permata",
        email: "dina@bunayo.test",
        phone: "081234567893",
        photoUrl: "/images/avatars/tutor-dina.webp",
        isActive: true,
      },
      {
        id: "tut_demo_ahmad",
        tenantId: "tnt_demo",
        name: "Pak Ahmad Rizki",
        email: "ahmad@bunayo.test",
        phone: "081234567894",
        photoUrl: "/images/avatars/tutor-ahmad.webp",
        isActive: true,
      },
    ])
    .onConflictDoUpdate({
      target: tutors.id,
      set: {
        tenantId: "tnt_demo",
        photoUrl: sql`excluded.photo_url`,
        name: sql`excluded.name`,
      },
    });

  // Assign Bu Rina to Kelas Bunga Matahari & Ibu Maya to Kelas Pelangi
  await db
    .insert(tutorClassAssignments)
    .values([
      {
        id: "tca_demo_rina_matahari",
        tutorId: "tut_demo_rina",
        classId: "cls_bunga_matahari",
        ratePerSession: "75000",
        isActive: true,
      },
      {
        id: "tca_demo_maya_pelangi",
        tutorId: "tut_demo_maya",
        classId: "cls_pelangi",
        ratePerSession: "75000",
        isActive: true,
      },
    ])
    .onConflictDoNothing();
  console.log("✓ Tutor Bu Rina & rekan guru siap.");

  // 5. Students
  const [parentUser] = await db.select().from(user).where(eq(user.email, "parent@bunayo.test"));
  const parentUserId = parentUser?.id || "usr_demo_parent";

  const studentList = [
    {
      id: "stu_demo_aisyah",
      name: "Aisyah Putri",
      dateOfBirth: "2021-04-12",
      parentUserId: parentUserId,
      parentName: "Ibu Anita",
      parentPhone: "081234567890",
      parentEmail: "parent@bunayo.test",
      photoUrl: "/images/avatars/student-aisyah.webp",
      registrationDate: "2026-01-10",
      classId: "cls_bunga_matahari",
    },
    {
      id: "stu_demo_raka",
      name: "Raka Pratama",
      dateOfBirth: "2021-02-18",
      parentUserId: null,
      parentName: "Pak Budi Pratama",
      parentPhone: "081298765432",
      parentEmail: "budi.raka@gmail.com",
      photoUrl: "/images/avatars/student-raka.webp",
      registrationDate: "2026-01-15",
      classId: "cls_bunga_matahari",
    },
    {
      id: "stu_demo_keisha",
      name: "Keisha Azzahra",
      dateOfBirth: "2021-07-25",
      parentUserId: null,
      parentName: "Ibu Citra Lestari",
      parentPhone: "081233344455",
      parentEmail: "citra.keisha@gmail.com",
      photoUrl: "/images/avatars/student-keisha.webp",
      registrationDate: "2026-02-01",
      classId: "cls_bunga_matahari",
    },
    {
      id: "stu_demo_arjuna",
      name: "Arjuna Wijaya",
      dateOfBirth: "2020-11-09",
      parentUserId: null,
      parentName: "Pak Doni Wijaya",
      parentPhone: "081277788899",
      parentEmail: "doni.arjuna@gmail.com",
      photoUrl: "/images/avatars/student-arjuna.webp",
      registrationDate: "2026-02-10",
      classId: "cls_bunga_matahari",
    },
    {
      id: "stu_demo_budi",
      name: "Budi Santoso",
      dateOfBirth: "2021-09-14",
      parentUserId: null,
      parentName: "Pak Hendra Santoso",
      parentPhone: "081244556677",
      parentEmail: "hendra.budi@gmail.com",
      photoUrl: "/images/avatars/student-budi.webp",
      registrationDate: "2026-02-15",
      classId: "cls_pelangi",
    },
    {
      id: "stu_demo_ahmad",
      name: "Ahmad Rizki",
      dateOfBirth: "2021-05-20",
      parentUserId: null,
      parentName: "Ibu Sarah Rizki",
      parentPhone: "081255667788",
      parentEmail: "sarah.ahmad@gmail.com",
      photoUrl: "/images/avatars/student-ahmad.webp",
      registrationDate: "2026-02-20",
      classId: "cls_pelangi",
    },
  ];

  for (const s of studentList) {
    await db
      .insert(students)
      .values({
        id: s.id,
        tenantId: "tnt_demo",
        name: s.name,
        dateOfBirth: s.dateOfBirth,
        parentUserId: s.parentUserId,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentEmail: s.parentEmail,
        photoUrl: s.photoUrl,
        registrationDate: s.registrationDate,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          tenantId: "tnt_demo",
          name: s.name,
          parentUserId: s.parentUserId,
          photoUrl: s.photoUrl,
        },
      });

    // Enrollment
    await db
      .insert(studentEnrollments)
      .values({
        id: `enr_${s.id}`,
        studentId: s.id,
        classId: s.classId,
        sessionsQuota: 20,
        sessionsUsed: 12,
        freePermitsAllowed: 2,
        freePermitsUsed: 0,
        enrollmentDate: s.registrationDate,
        billingDay: 1,
        isActive: true,
      })
      .onConflictDoNothing();
  }
  console.log("✓ Siswa & pendaftaran siap.");

  // 6. Attendance for Today & Past 3 Days
  const attendanceRecords = [
    // Today
    {
      id: `att_aisyah_${today}`,
      studentId: "stu_demo_aisyah",
      classId: "cls_bunga_matahari",
      date: today,
      status: "present" as const,
      checkInTime: "07:45:00",
      checkOutTime: "12:00:00",
      checkedInBy: "Bu Rina Wijaya",
    },
    {
      id: `att_raka_${today}`,
      studentId: "stu_demo_raka",
      classId: "cls_bunga_matahari",
      date: today,
      status: "present" as const,
      checkInTime: "08:00:00",
      checkOutTime: "12:00:00",
      checkedInBy: "Bu Rina Wijaya",
    },
    {
      id: `att_keisha_${today}`,
      studentId: "stu_demo_keisha",
      classId: "cls_bunga_matahari",
      date: today,
      status: "permit" as const,
      permitType: "sick" as const,
      permitReason: "Demam ringan dan istirahat di rumah",
      checkedInBy: "Bu Rina Wijaya",
    },
    {
      id: `att_arjuna_${today}`,
      studentId: "stu_demo_arjuna",
      classId: "cls_bunga_matahari",
      date: today,
      status: "permit" as const,
      permitType: "family" as const,
      permitReason: "Acara keluarga ke luar kota",
      checkedInBy: "Bu Rina Wijaya",
    },
    // Yesterday
    {
      id: `att_aisyah_${getPastDate(1)}`,
      studentId: "stu_demo_aisyah",
      classId: "cls_bunga_matahari",
      date: getPastDate(1),
      status: "present" as const,
      checkInTime: "07:50:00",
      checkOutTime: "12:05:00",
      checkedInBy: "Bu Rina Wijaya",
    },
    {
      id: `att_raka_${getPastDate(1)}`,
      studentId: "stu_demo_raka",
      classId: "cls_bunga_matahari",
      date: getPastDate(1),
      status: "present" as const,
      checkInTime: "07:55:00",
      checkOutTime: "12:00:00",
      checkedInBy: "Bu Rina Wijaya",
    },
  ];

  for (const a of attendanceRecords) {
    await db
      .insert(attendance)
      .values(a)
      .onConflictDoUpdate({
        target: attendance.id,
        set: {
          status: a.status,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime,
        },
      });
  }
  console.log("✓ Absensi hari ini & riwayat siap.");

  // 7. Invoices
  await db
    .insert(invoices)
    .values([
      {
        id: "inv_demo_aisyah_curr",
        invoiceNumber: "INV-202611-001",
        studentId: "stu_demo_aisyah",
        enrollmentId: "enr_stu_demo_aisyah",
        amount: "1500000",
        discount: "0",
        total: "1500000",
        status: "paid",
        billingPeriodStart: getPastDate(15),
        billingPeriodEnd: getFutureDate(15),
        dueDate: getFutureDate(5),
        paidAt: new Date(),
        notes: "SPP Bulan Berjalan - Paket Kelas Bunga Matahari",
      },
      {
        id: "inv_demo_raka_curr",
        invoiceNumber: "INV-202611-002",
        studentId: "stu_demo_raka",
        enrollmentId: "enr_stu_demo_raka",
        amount: "1500000",
        discount: "0",
        total: "1500000",
        status: "unpaid",
        billingPeriodStart: getPastDate(15),
        billingPeriodEnd: getFutureDate(15),
        dueDate: getFutureDate(7),
        notes: "SPP Bulan Berjalan - Menunggu Pembayaran",
      },
      {
        id: "inv_demo_keisha_curr",
        invoiceNumber: "INV-202611-003",
        studentId: "stu_demo_keisha",
        enrollmentId: "enr_stu_demo_keisha",
        amount: "1500000",
        discount: "100000",
        total: "1400000",
        status: "paid",
        billingPeriodStart: getPastDate(15),
        billingPeriodEnd: getFutureDate(15),
        dueDate: getFutureDate(5),
        paidAt: new Date(Date.now() - 3 * 86400000),
        notes: "SPP Bulan Berjalan (Diskon Early Bird)",
      },
    ])
    .onConflictDoUpdate({
      target: invoices.id,
      set: {
        status: "paid",
      },
    });
  console.log("✓ Tagihan SPP sinkron siap.");

  // 8. Daily Reports (Laporan Harian Guru ke Orang Tua)
  await db
    .insert(dailyReports)
    .values([
      {
        id: `rep_demo_aisyah_${today}`,
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        tutorUserId: tutorUserId,
        reportDate: today,
        mood: "Sangat ceria & antusias",
        meals: "Habis 1 porsi: Nasi tim ayam suwir, sup bayam wortel, pepaya potong. Minum air putih 3 gelas.",
        nap: "Tidur siang nyenyak 1 jam 45 menit (12:30 - 14:15 WIB), bangun segar.",
        activities:
          "1. Senam irama pagi bersama Bu Rina\n2. Melipat origami dan mewarnai bunga matahari\n3. Eksplorasi sensori tekstur pasir warna di meja sensori\n4. Bernyanyi lagu daerah bersama teman sekelas.",
        notes:
          "Aisyah sangat mandiri hari ini saat merapikan krayon setelah kegiatan seni. Hubungan sosial dengan teman-teman semakin hangat! 🌟",
        photos: [
          "/images/reports/report-aisyah-art.webp",
          "/images/reports/report-aisyah-sensory.webp",
          "/images/reports/report-aisyah-meal.webp",
        ],
        status: "submitted",
      },
      {
        id: `rep_demo_aisyah_${getPastDate(1)}`,
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        tutorUserId: tutorUserId,
        reportDate: getPastDate(1),
        mood: "Senang dan penuh rasa ingin tahu",
        meals: "Nasi lembut ikan salmon brokoli + pisang barangan, piring bersih.",
        nap: "Tidur siang 1 jam 30 menit (13:00 - 14:30 WIB).",
        activities:
          "Eksplorasi balok geometri, menyusun menara balok 10 tingkat, aktivitas gerak ceria di playground outdoor.",
        notes:
          "Aisyah sangat fokus menyusun puzzle dan menara balok tanpa jatuh. Respon motorik halus dan koordinasi matanya berkembang pesat.",
        photos: [
          "/images/reports/report-circle-story.webp",
          "/images/reports/report-group-outdoor.webp",
        ],
        status: "submitted",
      },
      {
        id: `rep_demo_aisyah_${getPastDate(2)}`,
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        tutorUserId: tutorUserId,
        reportDate: getPastDate(2),
        mood: "Tenang, ceria, dan bersahabat",
        meals: "Sup bola-bola tahu ayam + jagung manis, minum susu hangat 1 cangkir.",
        nap: "Tidur siang lelap 1 jam 40 menit (12:45 - 14:25 WIB).",
        activities:
          "Circle time mendengarkan dongeng fabel 'Kancil yang Bijak' bersama Bu Rina, senam peregangan anak.",
        notes:
          "Aisyah aktif bertanya mengenai karakter hewan di buku cerita dan mampu menceritakan kembali dengan bahasanya sendiri.",
        photos: [
          "/images/reports/report-naptime-peaceful.webp",
          "/images/reports/report-group-outdoor.webp",
        ],
        status: "submitted",
      },
      {
        id: `rep_demo_raka_${today}`,
        studentId: "stu_demo_raka",
        classId: "cls_bunga_matahari",
        tutorUserId: tutorUserId,
        reportDate: today,
        mood: "Aktif dan bersemangat",
        meals: "Makan siang lahap: Nasi ayam kecap + sayur bening bayam, habis 1 porsi.",
        nap: "Tidur siang 1 jam 15 menit (13:00 - 14:15 WIB).",
        activities:
          "Bermain motorik kasar di playground outdoor, mengenal angka 1-10 dengan kartu bergambar.",
        notes: "Raka sangat bersemangat saat sesi bermain outdoor bersama teman-teman.",
        photos: ["/images/reports/report-group-outdoor.webp"],
        status: "submitted",
      },
    ])
    .onConflictDoUpdate({
      target: dailyReports.id,
      set: {
        reportDate: sql`excluded.report_date`,
        mood: sql`excluded.mood`,
        meals: sql`excluded.meals`,
        nap: sql`excluded.nap`,
        activities: sql`excluded.activities`,
        notes: sql`excluded.notes`,
        photos: sql`excluded.photos`,
        status: "submitted",
      },
    });
  console.log("✓ Laporan harian lengkap guru ke orang tua siap.");

  // 8b. Gallery Photos (Foto Kegiatan Dokumentasi Lembaga)
  await db
    .insert(galleryPhotos)
    .values([
      {
        id: "gp_demo_1",
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-aisyah-art.webp",
        caption: "Aisyah menunjukkan hasil kreasi mewarnai bunga matahari",
        uploadedByUserId: tutorUserId,
      },
      {
        id: "gp_demo_2",
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-aisyah-sensory.webp",
        caption: "Eksplorasi sensori tekstur pasir dan manik-manik warna",
        uploadedByUserId: tutorUserId,
      },
      {
        id: "gp_demo_3",
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-aisyah-meal.webp",
        caption: "Makan siang bersama dengan menu gizi seimbang",
        uploadedByUserId: tutorUserId,
      },
      {
        id: "gp_demo_4",
        studentId: "stu_demo_raka",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-group-outdoor.webp",
        caption: "Aktivitas motorik kasar di taman bermain outdoor",
        uploadedByUserId: tutorUserId,
      },
      {
        id: "gp_demo_5",
        studentId: "stu_demo_keisha",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-circle-story.webp",
        caption: "Circle time mendengarkan cerita dan dongeng bersama Bu Rina",
        uploadedByUserId: tutorUserId,
      },
      {
        id: "gp_demo_6",
        studentId: "stu_demo_arjuna",
        classId: "cls_bunga_matahari",
        photoKey: "/images/reports/report-naptime-peaceful.webp",
        caption: "Waktu istirahat tidur siang yang nyaman dan tenang",
        uploadedByUserId: tutorUserId,
      },
    ])
    .onConflictDoUpdate({
      target: galleryPhotos.id,
      set: {
        photoKey: sql`excluded.photo_key`,
        caption: sql`excluded.caption`,
      },
    });
  console.log("✓ Foto kegiatan galeri lembaga siap.");

  // 9. Conversations & Messages
  const [conv] = await db
    .insert(conversations)
    .values({
      id: "conv_demo_parent_tutor",
      parentUserId: parentUserId,
      tutorUserId: tutorUserId,
      studentId: "stu_demo_aisyah",
      lastMessageAt: new Date(),
    })
    .onConflictDoUpdate({
      target: conversations.id,
      set: { lastMessageAt: new Date() },
    })
    .returning();

  const convId = conv?.id || "conv_demo_parent_tutor";

  await db
    .insert(messages)
    .values([
      {
        id: "msg_demo_1",
        conversationId: convId,
        senderUserId: tutorUserId,
        body: "Selamat pagi Ibu Anita! Aisyah hari ini sudah sampai di sekolah dengan ceria ya bu 😊",
        readAt: new Date(),
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        id: "msg_demo_2",
        conversationId: convId,
        senderUserId: parentUserId,
        body: "Pagi Bu Rina! Terima kasih infonya. Tadi pagi Aisyah sudah sarapan roti dan bekal buah naga ada di tas ya bu.",
        readAt: new Date(),
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "msg_demo_3",
        conversationId: convId,
        senderUserId: tutorUserId,
        body: "Baik Ibu Anita, kami dampingi saat waktu camilan nanti. Aisyah tadi juga sangat antusias saat senam pagi!",
        readAt: new Date(),
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ])
    .onConflictDoNothing();
  console.log("✓ Obrolan pesan Bu Rina & Ibu Anita siap.");

  // 10. Announcements
  const [adminUser] = await db.select().from(user).where(eq(user.email, "admin@bunayo.test"));
  const adminUserId = adminUser?.id || "usr_demo_admin";

  await db
    .insert(announcements)
    .values({
      id: "ann_demo_pentas_seni",
      tenantId: "tnt_demo",
      title: "Jadwal Pentas Seni & Kreativitas Anak Akhir Bulan",
      body: "Ayah dan Bunda yang berbahagia, Bunayo Daycare mengundang seluruh orang tua untuk menghadiri Pentas Seni Kreasi Anak pada hari Sabtu akhir bulan. Acara dimulai pukul 09.00 WIB dengan penampilan tari dan pameran karya seni anak-anak.",
      sentByUserId: adminUserId,
      recipientCount: 25,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: announcements.id,
      set: {
        title: "Jadwal Pentas Seni & Kreativitas Anak Akhir Bulan",
      },
    });
  console.log("✓ Pengumuman lembaga siap.");

  console.log("\n=======================================================");
  console.log("SEEDING SELESAI DENGAN SUKSES!");
  console.log("Tenant Demo    : tnt_demo (Bunayo Daycare Demo)");
  console.log("Admin Account  : admin@bunayo.test / Password123! (or admin.test@gmail.com)");
  console.log("Tutor Account  : tutor@bunayo.test / Password123! (or tutor.test@gmail.com)");
  console.log("Parent Account : parent@bunayo.test / Password123! (or parent.test@gmail.com)");
  console.log("Siswa Utama    : Aisyah Putri (Kelas Bunga Matahari)");
  console.log("=======================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error saat seeding demo Bunayo:", err);
  process.exit(1);
});
