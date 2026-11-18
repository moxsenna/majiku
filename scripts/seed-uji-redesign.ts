/**
 * Seed data uji untuk verifikasi visual redesign Bunayo.
 * HANYA untuk database uji Neon (host ep-late-dawn-*). Menolak jalan di DB lain.
 *
 * Pakai:
 *   export $(grep -v '^#' .env.test.local | xargs -d '\n') BETTER_AUTH_URL=http://localhost:3000 \
 *     && npx tsx scripts/seed-uji-redesign.ts
 *
 * Akun (password: UjiBunayo123!) — domain @bunayo-uji.test bukan akun demo,
 * jadi semua layar membaca data nyata dari DB uji:
 *   admin.uji@bunayo-uji.test (admin) · guru.uji@bunayo-uji.test (tutor)
 *   wali.uji@bunayo-uji.test (parent, 2 anak)
 */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

const UJI_HOST = "ep-late-dawn-a1vqqh2c";
if (!process.env.NEON_DATABASE_URL?.includes(UJI_HOST)) {
  console.error(`Ditolak: NEON_DATABASE_URL bukan DB uji (${UJI_HOST}).`);
  process.exit(1);
}

const PASSWORD = "UjiBunayo123!";

async function main() {
  const { db } = await import("../src/db");
  const s = await import("../src/db/schema");
  const { auth } = await import("../src/server/auth");

  const existing = await db.select().from(s.tenants).where(eq(s.tenants.slug, "tk-uji-bunayo"));
  if (existing.length) {
    console.log("Sudah ada tenant uji. Hapus dulu bila ingin seed ulang.");
    return;
  }

  async function akun(email: string, name: string, role: "admin" | "tutor" | "parent") {
    const found = await db.select().from(s.user).where(eq(s.user.email, email));
    let id = found[0]?.id;
    if (!id) {
      const res = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name } });
      id = res.user.id;
    }
    await db.insert(s.userRoles).values({ id: randomUUID(), userId: id, role }).onConflictDoNothing();
    return id;
  }

  const adminId = await akun("admin.uji@bunayo-uji.test", "Sari Admin", "admin");
  const guruId = await akun("guru.uji@bunayo-uji.test", "Bu Dewi", "tutor");
  const waliId = await akun("wali.uji@bunayo-uji.test", "Rahmat Hidayat", "parent");

  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const hari = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d;
  };
  const today = iso(now);
  const y = now.getFullYear();
  const m = now.getMonth();
  const awalBulan = iso(new Date(Date.UTC(y, m, 1)));
  const akhirBulan = iso(new Date(Date.UTC(y, m + 1, 0)));
  const awalBulanLalu = iso(new Date(Date.UTC(y, m - 1, 1)));
  const akhirBulanLalu = iso(new Date(Date.UTC(y, m, 0)));

  const tenantId = randomUUID();
  await db.insert(s.tenants).values({
    id: tenantId,
    slug: "tk-uji-bunayo",
    name: "TK Pelangi (Uji)",
    type: "preschool",
    city: "Bandung",
    address: "Jl. Uji No. 1",
    priceFrom: "750000",
    adminUserId: adminId,
    isVerified: true,
  });

  const kelas = [
    { id: randomUUID(), name: "Kelompok Bermain A", capacity: 12, price: "750000" },
    { id: randomUUID(), name: "TK A Matahari", capacity: 15, price: "900000" },
    { id: randomUUID(), name: "TK B Pelangi", capacity: 15, price: "950000" },
  ];
  await db.insert(s.classes).values(
    kelas.map((k) => ({
      id: k.id,
      tenantId,
      name: k.name,
      capacity: k.capacity,
      pricePerMonth: k.price,
      sessionsPerMonth: 20,
      schedule: "Senin–Jumat 08.00–11.00",
    }))
  );

  const dow = now.getDay();
  await db.insert(s.classSchedules).values(
    kelas.map((k, i) => ({
      id: randomUUID(),
      classId: k.id,
      title: k.name,
      dayOfWeek: dow,
      startTime: ["08:00", "08:30", "13:00"][i],
      durationMinutes: 180,
      type: "class" as const,
    }))
  );

  const guruRows = [
    { id: randomUUID(), userId: guruId, name: "Bu Dewi", email: "guru.uji@bunayo-uji.test" },
    { id: randomUUID(), userId: null, name: "Pak Arif", email: null },
  ];
  await db.insert(s.tutors).values(guruRows.map((g) => ({ ...g, tenantId, phone: "081200000000" })));
  await db.insert(s.tutorClassAssignments).values([
    { id: randomUUID(), tutorId: guruRows[0].id, classId: kelas[0].id, ratePerSession: "50000" },
    { id: randomUUID(), tutorId: guruRows[0].id, classId: kelas[1].id, ratePerSession: "50000" },
    { id: randomUUID(), tutorId: guruRows[1].id, classId: kelas[2].id, ratePerSession: "55000" },
  ]);
  await db.insert(s.tutorAttendance).values({
    id: randomUUID(),
    tutorId: guruRows[0].id,
    userId: guruId,
    date: today,
    checkInTime: "07:40",
    status: "hadir",
  });

  // 14 anak; 2 anak pertama milik wali.uji (saudara kandung)
  const nama = [
    "Alya Putri", "Bima Hidayat", "Citra Lestari", "Dafa Pratama", "Elina Sari",
    "Fajar Nugroho", "Gita Maharani", "Hafiz Ramadhan", "Intan Permata", "Joko Saputra",
    "Kirana Ayu", "Lutfi Hakim", "Maya Anggraini", "Naufal Akbar",
  ];
  const anak = nama.map((n, i) => {
    const lahir = new Date(Date.UTC(y - 4 - (i % 3), (m + i) % 12, ((i * 3) % 27) + 1));
    if (i === 4) lahir.setUTCMonth(m, now.getDate()); // ulang tahun hari ini
    return {
      id: randomUUID(),
      tenantId,
      name: n,
      dateOfBirth: iso(lahir),
      parentUserId: i < 2 ? waliId : null,
      parentName: i < 2 ? "Rahmat Hidayat" : `Wali ${n.split(" ")[0]}`,
      parentPhone: `08123456${String(i).padStart(4, "0")}`,
      parentEmail: i < 2 ? "wali.uji@bunayo-uji.test" : null,
      registrationDate: awalBulanLalu,
      isActive: i !== 13,
      kelas: kelas[i % 3],
    };
  });
  await db.insert(s.students).values(anak.map(({ kelas: _k, ...a }) => a));

  const enroll = anak.map((a) => ({
    id: randomUUID(),
    studentId: a.id,
    classId: a.kelas.id,
    sessionsQuota: 20,
    sessionsUsed: 8,
    billingDay: 1,
    enrollmentDate: awalBulanLalu,
    isActive: a.isActive,
  }));
  await db.insert(s.studentEnrollments).values(enroll);

  // Kehadiran: 10 hari kerja terakhir + hari ini (sebagian belum tiba)
  const hadirRows: (typeof s.attendance.$inferInsert)[] = [];
  for (let d = -14; d <= 0; d++) {
    const tgl = hari(d);
    if (tgl.getDay() === 0 || tgl.getDay() === 6) continue;
    anak.forEach((a, i) => {
      if (!a.isActive) return;
      if (d === 0 && i >= 9) return; // belum tiba hari ini
      const r = (i + d + 20) % 9;
      const status = r === 0 ? "absent" : r === 1 ? "late" : r === 2 && i % 2 ? "permit" : "present";
      hadirRows.push({
        id: randomUUID(),
        studentId: a.id,
        classId: a.kelas.id,
        enrollmentId: enroll[i].id,
        date: iso(tgl),
        status,
        checkInTime: status === "present" ? "07:50:00" : status === "late" ? "08:25:00" : null,
        checkOutTime: d < 0 && status !== "absent" && status !== "permit" && !(d === -1 && i === 3) ? "11:05:00" : null,
        permitType: status === "permit" ? "sick" : null,
        permitReason: status === "permit" ? "Demam" : null,
      });
    });
  }
  await db.insert(s.attendance).values(hadirRows);

  // Tagihan: bulan lalu (lunas/terlambat), bulan ini (campuran)
  let no = 1;
  const inv = (a: (typeof anak)[number], i: number, start: string, end: string, status: "paid" | "unpaid" | "overdue" | "partial", due: string, paidAt: Date | null) => ({
    id: randomUUID(),
    invoiceNumber: `UJI-${String(no++).padStart(4, "0")}`,
    studentId: a.id,
    enrollmentId: enroll[i].id,
    amount: a.kelas.price,
    discount: "0",
    total: a.kelas.price,
    status,
    billingPeriodStart: start,
    billingPeriodEnd: end,
    dueDate: due,
    paidAt,
  });
  const invRows = [
    ...anak.slice(0, 13).map((a, i) =>
      i < 11
        ? inv(a, i, awalBulanLalu, akhirBulanLalu, "paid", iso(hari(-25)), hari(-24 + (i % 3)))
        : inv(a, i, awalBulanLalu, akhirBulanLalu, "overdue", iso(hari(-25)), null)
    ),
    ...anak.slice(0, 13).map((a, i) => {
      const st = i < 6 ? "paid" : i < 9 ? "unpaid" : i < 11 ? "overdue" : "partial";
      const due = st === "overdue" ? iso(hari(-3)) : iso(hari(7));
      return inv(a, i, awalBulan, akhirBulan, st, due, st === "paid" ? hari(-(i % 5)) : null);
    }),
  ];
  await db.insert(s.invoices).values(invRows);

  // Trial: satu terjadwal lewat, satu baru masuk, satu sudah diterima (punya data kesehatan)
  await db.insert(s.trialApplications).values([
    {
      id: randomUUID(), tenantId, classId: kelas[0].id, childName: "Oscar Wijaya", childBirthDate: iso(new Date(Date.UTC(y - 3, 2, 4))),
      parentName: "Wijaya", parentPhone: "081299990001", status: "scheduled", trialScheduledAt: hari(-2),
    },
    {
      id: randomUUID(), tenantId, classId: kelas[1].id, childName: "Putri Amelia", parentName: "Amelia",
      parentPhone: "081299990002", status: "submitted", requestedStartDate: iso(hari(10)),
    },
    {
      id: randomUUID(), tenantId, classId: kelas[0].id, childName: anak[0].name, parentUserId: waliId,
      parentName: "Rahmat Hidayat", parentPhone: anak[0].parentPhone, allergies: "Kacang tanah",
      medicalNotes: "Asma ringan, inhaler di tas", emergencyContact: "Siti (ibu)", emergencyPhone: "081211112222",
      status: "admitted", admittedAt: hari(-40), admittedStudentId: anak[0].id,
    },
  ]);

  // Laporan harian kemarin untuk sebagian anak kelas A
  await db.insert(s.dailyReports).values(
    anak.filter((a, i) => a.kelas.id === kelas[0].id && i < 6).map((a) => ({
      id: randomUUID(), studentId: a.id, classId: kelas[0].id, tutorUserId: guruId, reportDate: iso(hari(-1)),
      mood: "senang", meals: "Habis", nap: "45 menit", activities: "Menggambar dan bernyanyi",
    }))
  );

  console.log(`Selesai. Tenant ${tenantId}, ${anak.length} anak, ${hadirRows.length} absensi, ${invRows.length} tagihan.`);
  console.log(`Masuk: admin.uji@bunayo-uji.test / ${PASSWORD}`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
