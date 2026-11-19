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
  announcements,
} from "../src/db/schema";
import { eq, or } from "drizzle-orm";

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
          "/images/daycare/daycare-hero.jpg",
          "/images/daycare/daycare-sensory.jpg",
          "/images/reports/report-art-activity.jpg",
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
  }

  const demoUsers: DemoUserDef[] = [
    // Primary accounts
    { id: "usr_demo_admin", email: "admin@bunayo.test", name: "Admin Bunayo", role: "admin" },
    { id: "usr_demo_tutor", email: "tutor@bunayo.test", name: "Bu Rina Wijaya (Tutor)", role: "tutor" },
    { id: "usr_demo_parent", email: "parent@bunayo.test", name: "Ibu Anita (Bunda Aisyah)", role: "parent" },

    // Aliases
    { id: "usr_demo_admin_gmail", email: "admin.test@gmail.com", name: "Admin Bunayo (Gmail)", role: "admin" },
    { id: "usr_demo_tutor_gmail", email: "tutor.test@gmail.com", name: "Bu Rina Wijaya (Gmail)", role: "tutor" },
    { id: "usr_demo_parent_gmail", email: "parent.test@gmail.com", name: "Ibu Anita (Gmail)", role: "parent" },
    { id: "usr_demo_rina_bunayo", email: "rina@bunayo.test", name: "Bu Rina Wijaya", role: "tutor" },

    // Legacy aliases
    { id: "usr_demo_admin_leg", email: "admin@majiku.test", name: "Admin Bunayo (Legacy)", role: "admin" },
    { id: "usr_demo_rina_leg", email: "rina@majiku.test", name: "Bu Rina (Legacy)", role: "tutor" },
    { id: "usr_demo_parent_leg", email: "parent@majiku.test", name: "Ibu Anita (Legacy)", role: "parent" },
  ];

  for (const u of demoUsers) {
    const [byEmail] = await db.select().from(user).where(eq(user.email, u.email));
    const [byId] = await db.select().from(user).where(eq(user.id, u.id));

    let effectiveUserId = u.id;

    if (byEmail) {
      effectiveUserId = byEmail.id;
      await db
        .update(user)
        .set({ name: u.name, emailVerified: true })
        .where(eq(user.id, effectiveUserId));
    } else if (byId) {
      effectiveUserId = byId.id;
      await db
        .update(user)
        .set({ email: u.email, name: u.name, emailVerified: true })
        .where(eq(user.id, effectiveUserId));
    } else {
      await db
        .insert(user)
        .values({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: true,
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

  // 4. Tutor: Bu Rina Wijaya
  const [tutorUser] = await db.select().from(user).where(eq(user.email, "tutor@bunayo.test"));
  const tutorUserId = tutorUser?.id || "usr_demo_tutor";

  await db
    .insert(tutors)
    .values({
      id: "tut_demo_rina",
      tenantId: "tnt_demo",
      userId: tutorUserId,
      name: "Bu Rina Wijaya",
      email: "tutor@bunayo.test",
      phone: "081234567891",
      photoUrl: "/images/avatars/parent-rina.jpg",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: tutors.id,
      set: {
        tenantId: "tnt_demo",
        userId: tutorUserId,
        photoUrl: "/images/avatars/parent-rina.jpg",
      },
    });

  // Assign Bu Rina to Kelas Bunga Matahari
  await db
    .insert(tutorClassAssignments)
    .values({
      id: "tca_demo_rina_matahari",
      tutorId: "tut_demo_rina",
      classId: "cls_bunga_matahari",
      ratePerSession: "75000",
      isActive: true,
    })
    .onConflictDoNothing();
  console.log("✓ Tutor Bu Rina siap & ditugaskan di Kelas Bunga Matahari.");

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
      photoUrl: "/images/avatars/student-aisyah.jpg",
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
      photoUrl: "/images/avatars/student-raka.jpg",
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
      photoUrl: "/images/avatars/student-keisha.jpg",
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
      photoUrl: "/images/avatars/student-arjuna.jpg",
      registrationDate: "2026-02-10",
      classId: "cls_bunga_matahari",
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

  // 8. Daily Reports for Aisyah Putri
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
        meals: "Makan siang lahap: Sayur sop wortel + ayam fillet, habis 1 porsi",
        nap: "Tidur siang nyenyak 1 jam 30 menit (12:30 - 14:00 WIB)",
        activities:
          "Mewarnai bunga matahari, menyusun balok lego melatih motorik halus, senam riang bersama Bu Rina.",
        notes: "Aisyah sangat kooperatif hari ini dan membantu merapikan mainan bersama teman-teman.",
        photos: ["/images/reports/report-art-activity.jpg", "/images/daycare/daycare-sensory.jpg"],
        status: "submitted",
      },
      {
        id: `rep_demo_aisyah_${getPastDate(1)}`,
        studentId: "stu_demo_aisyah",
        classId: "cls_bunga_matahari",
        tutorUserId: tutorUserId,
        reportDate: getPastDate(1),
        mood: "Senang dan aktif bereksplorasi",
        meals: "Nasi tim ikan salmon + brokoli, minum air putih 3 gelas",
        nap: "Tidur siang 1 jam (13:00 - 14:00 WIB)",
        activities: "Mengenal bentuk geometri, bermain pasir kinetik, mendengarkan dongeng fabel.",
        notes: "Aisyah menunjukkan peningkatan fokus saat menyusun puzzle 12 keping.",
        photos: ["/images/daycare/daycare-sensory.jpg"],
        status: "submitted",
      },
    ])
    .onConflictDoUpdate({
      target: dailyReports.id,
      set: {
        reportDate: today,
        status: "submitted",
      },
    });
  console.log("✓ Laporan harian Aisyah siap.");

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
