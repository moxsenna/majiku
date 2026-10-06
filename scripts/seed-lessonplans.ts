import "dotenv/config";
import "../src/server/actions/announcements";
import { db } from "../src/db";
import { lessonPlans } from "../src/db/schema";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const plans = [
  {
    id: "plan_1",
    title: "Numerasi - Mengenal Angka 1-10",
    subject: "Numerasi",
    classId: "cls_3",
    tutorUserId: null,
    planDate: daysFromNow(-1),
    timeRange: "08:00 - 10:00",
    status: "completed" as const,
    objectives: [
      "Anak mampu mengenal angka 1-10",
      "Anak mampu menghitung benda konkrit",
      "Anak mampu menulis angka 1-5",
    ],
    activities: [
      { id: "pa_1", title: "Circle Time - Bernyanyi Angka", durationMinutes: 10, description: "Bernyanyi lagu angka bersama", completed: true },
      { id: "pa_2", title: "Menghitung Manik-manik", durationMinutes: 20, description: "Menghitung dan mengelompokkan manik-manik", completed: true },
      { id: "pa_3", title: "Menulis Angka di Pasir", durationMinutes: 15, description: "Menelusuri angka di nampan pasir", completed: true },
      { id: "pa_4", title: "Games Tebak Angka", durationMinutes: 15, description: "Permainan interaktif", completed: true },
    ],
    materials: ["Manik-manik warna", "Nampan pasir", "Kartu angka", "Speaker", "Stiker reward"],
  },
  {
    id: "plan_2",
    title: "Sensori - Mengenal Tekstur",
    subject: "Sensori",
    classId: "cls_2",
    tutorUserId: null,
    planDate: daysFromNow(0),
    timeRange: "10:00 - 11:30",
    status: "in_progress" as const,
    objectives: [
      "Anak mampu membedakan tekstur kasar dan halus",
      "Anak mampu mendeskripsikan sensasi saat menyentuh",
    ],
    activities: [
      { id: "pa_5", title: "Eksplorasi Kotak Sensori", durationMinutes: 15, description: "Meraba berbagai tekstur", completed: true },
      { id: "pa_6", title: "Kolase Tekstur", durationMinutes: 30, description: "Menempel bahan bertekstur", completed: false },
      { id: "pa_7", title: "Bercerita Sensasi", durationMinutes: 15, description: "Mendeskripsikan rasa sentuhan", completed: false },
    ],
    materials: ["Kotak sensori", "Kertas tekstur", "Lem", "Kapas", "Amplas halus"],
  },
  {
    id: "plan_3",
    title: "Seni Lukis - Alam Sekitar",
    subject: "Seni",
    classId: "cls_4",
    tutorUserId: null,
    planDate: daysFromNow(3),
    timeRange: "09:00 - 10:30",
    status: "upcoming" as const,
    objectives: [
      "Anak mampu mengekspresikan ide lewat warna",
      "Anak mampu menggambar objek alam sederhana",
    ],
    activities: [
      { id: "pa_8", title: "Observasi Halaman", durationMinutes: 10, description: "Melihat pohon dan bunga", completed: false },
      { id: "pa_9", title: "Sketching Bebas", durationMinutes: 20, description: "Menggambar bentuk dasar", completed: false },
      { id: "pa_10", title: "Mewarnai Cat Air", durationMinutes: 40, description: "Melukis dengan cat air", completed: false },
    ],
    materials: ["Cat air", "Kuas", "Palet", "Kertas lukis A3", "Celemek", "Lap"],
  },
];

async function main() {
  await db.insert(lessonPlans).values(plans).onConflictDoNothing();
  const all = await db.select({ id: lessonPlans.id }).from(lessonPlans);
  console.log(`Seed RPP selesai: ${all.length} baris (idempotent)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
