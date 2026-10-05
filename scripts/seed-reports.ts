import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { dailyReports } from "../src/db/schema";

async function main() {
  console.log("Seeding daily reports...");

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const sampleReports = [
    {
      id: "rep_1",
      studentId: "stu_1",
      classId: "cls_1",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Sangat ceria, antusias saat circle time pagi",
      meals: "Habis 1 porsi bubur ayam wortel, minum air putih 250ml",
      nap: "Tidur 1.5 jam (12:30 - 14:00) nyenyak tanpa terbangun",
      activities: "Stimulasi sensori tekstur beras warna & menyusun balok busa",
      notes: "Ahmad sangat fokus saat kegiatan sensori, koordinasi motorik halusnya bagus.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_2",
      studentId: "stu_2",
      classId: "cls_1",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Awalnya sedikit pemalu, lalu aktif bermain bersama teman",
      meals: "Makan siang sup sayur labu dan nasi habis 3/4 porsi, cemilan buah pepaya habis",
      nap: "Tidur 1 jam 15 menit (12:45 - 14:00)",
      activities: "Mendengarkan dongeng fabel dan bernyanyi lagu gerak tubuh",
      notes: "Aisyah mulai mau berbagi mainan dengan teman sebangku.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_3",
      studentId: "stu_3",
      classId: "cls_2",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Ceria dan sangat berenergi sepanjang hari",
      meals: "Makan siang nasi, telur dadar, dan tumis buncis habis tuntas",
      nap: "Tidur siang 1 jam (13:00 - 14:00)",
      activities: "Lari estafet bola warna di playground dan eksplorasi pasir kinetik",
      notes: "Motorik kasarnya berkembang sangat pesat, lincah dan berani melompat.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_4",
      studentId: "stu_4",
      classId: "cls_2",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Tenang, suka mengamati dan kooperatif",
      meals: "Makan siang habis 1 porsi nasi tim ayam, minum susu formula siang 180ml",
      nap: "Tidur siang nyenyak 2 jam (12:00 - 14:00)",
      activities: "Mengenal bentuk geometri dengan puzzle kayu dan meronce manik besar",
      notes: "Konsentrasi Chantika luar biasa saat meronce manik-manik.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_5",
      studentId: "stu_5",
      classId: "cls_3",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Bahagia dan suka bercerita kepada guru",
      meals: "Habis 1 porsi nasi ikan fillet krispi + sayur bayam bening",
      nap: "Istirahat santai membaca buku cerita (tidak tidur)",
      activities: "Belajar menebalkan huruf vokal A-I-U-E-O dan mewarnai gambar pelangi",
      notes: "Daffa sudah bisa memegang pensil dengan teknik tripod grip yang benar.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_6",
      studentId: "stu_6",
      classId: "cls_3",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Ramah dan suka membantu merapikan mainan",
      meals: "Makan siang capcay ayam dan nasi habis bersih, minum air putih cukup",
      nap: "Tidur siang 1 jam (13:00 - 14:00)",
      activities: "Permainan tebak angka 1-10 dan simulasi belanja mini di kelas",
      notes: "Evelyn menunjukkan jiwa kepemimpinan saat sesi bermain peran bersama teman.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_7",
      studentId: "stu_7",
      classId: "cls_4",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Kreatif, penuh rasa ingin tahu",
      meals: "Makan siang ayam kecap dan sop wortel habis 1 porsi",
      nap: "Istirahat tenang di pojok baca 45 menit",
      activities: "Membuat kerajinan origami hewan dan eksperimen sederhana sains air berwarna",
      notes: "Fattah sangat antusias dan mengajukan banyak pertanyaan kritis mengenai sains air.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_8",
      studentId: "stu_8",
      classId: "cls_4",
      tutorUserId: "usr_tutor",
      reportDate: today,
      mood: "Ceria, percaya diri saat presentasi gambar",
      meals: "Habis 1 mangkok soto ayam santan gurih dan nasi, cemilan biskuit gandum",
      nap: "Tidur siang 1 jam (13:15 - 14:15)",
      activities: "Melukis dengan teknik finger painting dan menceritakan makna lukisan",
      notes: "Gisella percaya diri maju di depan kelas menceritakan lukisan taman bunganya.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_9",
      studentId: "stu_1",
      classId: "cls_1",
      tutorUserId: "usr_tutor",
      reportDate: yesterday,
      mood: "Sedikit cemas saat diantar pagi hari, tenang setelah 10 menit",
      meals: "Makan bubur oats pisang habis 1 porsi kecil",
      nap: "Tidur siang 1 jam (13:00 - 14:00)",
      activities: "Bermain balok kayu dan mendengarkan musik relaksasi",
      notes: "Perlu adaptasi pagi sebentar, namun setelah bermain balok langsung ceria kembali.",
      photos: [],
      status: "submitted" as const,
    },
    {
      id: "rep_10",
      studentId: "stu_2",
      classId: "cls_1",
      tutorUserId: "usr_tutor",
      reportDate: yesterday,
      mood: "Sangat senang bermain air saat sesi sensory play",
      meals: "Makan siang macaroni schotel habis 1 potong besar",
      nap: "Tidur siang nyenyak 1.5 jam (12:30 - 14:00)",
      activities: "Sensory play air spons warna dan meniru suara hewan",
      notes: "Baju sempat sedikit basah saat sensory play air dan sudah diganti dengan baju cadangan.",
      photos: [],
      status: "submitted" as const,
    },
  ];

  await db.insert(dailyReports).values(sampleReports).onConflictDoNothing();

  const counts = await db
    .select({
      reportDate: dailyReports.reportDate,
      count: sql<number>`count(*)::int`,
    })
    .from(dailyReports)
    .groupBy(dailyReports.reportDate)
    .orderBy(dailyReports.reportDate);

  console.log("Daily reports seeded successfully. Summary per date:");
  console.table(counts);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed daily reports failed:", err);
  process.exit(1);
});
