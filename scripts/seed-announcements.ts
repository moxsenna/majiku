import "dotenv/config";
import "../src/server/actions/announcements";
import { db } from "../src/db";
import { announcements, user } from "../src/db/schema";

const DEMO_USER_ID = "usr_admin";

const demoAnnouncements = [
  {
    id: "ann_1",
    title: "Libur Nasional Bersama",
    body: "Diberitahukan kepada seluruh orang tua, kegiatan daycare libur pada tanggal 10 Oktober 2026 bertepatan dengan libur nasional. Kegiatan belajar mengajar kembali pada hari kerja berikutnya.",
    daysAgo: 5,
  },
  {
    id: "ann_2",
    title: "Kegiatan Outdoor Jumat Ini",
    body: "Jumat ini anak-anak akan melakukan kegiatan outdoor di halaman belakang. Mohon siapkan baju ganti, topi, dan tabungan sunscreen sebelum berangkat. Terima kasih!",
    daysAgo: 1,
  },
  {
    id: "ann_3",
    title: "Pembayaran SPP Bulan Ini",
    body: "Bapak/Ibu yang budiman, invoice SPP bulan ini telah terbit dan dapat dilihat pada menu Tagihan. Mohon lakukan pembayaran sebelum tanggal 25 untuk menghindari denda keterlambatan.",
    daysAgo: 0,
  },
];

async function main() {
  await db
    .insert(user)
    .values([{ id: DEMO_USER_ID, name: "Admin Majiku", email: "admin@majiku.test" }])
    .onConflictDoNothing();

  const now = Date.now();
  const rows = demoAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    sentByUserId: DEMO_USER_ID,
    recipientCount: 3,
    createdAt: new Date(now - a.daysAgo * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now - a.daysAgo * 24 * 60 * 60 * 1000),
  }));

  await db.insert(announcements).values(rows).onConflictDoNothing();

  const all = await db.select({ id: announcements.id }).from(announcements);
  console.log(`Seed pengumuman selesai: ${all.length} baris (idempotent)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
