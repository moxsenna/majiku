import "dotenv/config";
import "../src/server/actions/announcements";
import { db } from "../src/db";
import { classSchedules, classes } from "../src/db/schema";

// Mapping nama kelas mock -> id kelas seed
const CLASS_BY_NAME: Record<string, string> = {};

async function buildClassMap() {
  const rows = await db.select({ id: classes.id, name: classes.name }).from(classes);
  rows.forEach((r) => {
    CLASS_BY_NAME[r.name] = r.id;
  });
}

// ["Kelas Bunga Matahari" -> cls pertama, "Kelas Pelangi" -> cls kedua, "Kelas Bintang" -> cls ketiga]
const FALLBACK_BY_NAME: Record<string, string> = {};

interface SeedEvent {
  id: string;
  title: string;
  mockClassName: string | null; // null = Semua Kelas
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  location?: string;
  type: "class" | "activity" | "event" | "holiday";
}

const events: SeedEvent[] = [
  { id: "sched_1", title: "Circle Time", mockClassName: null, dayOfWeek: 1, startTime: "08:00", durationMinutes: 30, type: "activity" },
  { id: "sched_2", title: "Belajar Alfabet", mockClassName: "Kelas Bunga Matahari", dayOfWeek: 1, startTime: "09:00", durationMinutes: 45, location: "Ruang Kelas 1", type: "class" },
  { id: "sched_3", title: "Makan Siang", mockClassName: null, dayOfWeek: 1, startTime: "11:30", durationMinutes: 45, type: "activity" },
  { id: "sched_4", title: "Senam Pagi", mockClassName: null, dayOfWeek: 2, startTime: "08:00", durationMinutes: 30, location: "Lapangan", type: "activity" },
  { id: "sched_5", title: "Belajar Angka", mockClassName: "Kelas Pelangi", dayOfWeek: 2, startTime: "09:00", durationMinutes: 45, location: "Ruang Kelas 2", type: "class" },
  { id: "sched_6", title: "Kelas Seni", mockClassName: "Kelas Bintang", dayOfWeek: 3, startTime: "09:00", durationMinutes: 60, location: "Ruang Kreativitas", type: "class" },
  { id: "sched_7", title: "Storytelling", mockClassName: null, dayOfWeek: 3, startTime: "14:00", durationMinutes: 30, location: "Perpustakaan", type: "activity" },
  { id: "sched_8", title: "Belajar Bahasa Inggris", mockClassName: "Kelas Bunga Matahari", dayOfWeek: 4, startTime: "09:00", durationMinutes: 45, type: "class" },
  { id: "sched_9", title: "Fun Friday", mockClassName: null, dayOfWeek: 5, startTime: "09:00", durationMinutes: 120, location: "Playground", type: "event" },
];

const CLASS_FALLBACK_IDS = ["cls_1", "cls_2", "cls_3"];

async function resolveClassId(mockClassName: string | null): Promise<string | null> {
  if (!mockClassName) return null;
  if (CLASS_BY_NAME[mockClassName]) return CLASS_BY_NAME[mockClassName];
  if (FALLBACK_BY_NAME[mockClassName]) return FALLBACK_BY_NAME[mockClassName];
  // Map deterministik ke kelas seed berurutan
  const order = Object.keys(FALLBACK_BY_NAME).length;
  const id = CLASS_FALLBACK_IDS[order % CLASS_FALLBACK_IDS.length];
  FALLBACK_BY_NAME[mockClassName] = id;
  return id;
}

async function main() {
  await buildClassMap();

  const rows = [];
  for (const e of events) {
    rows.push({
      id: e.id,
      classId: await resolveClassId(e.mockClassName),
      title: e.title,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      durationMinutes: e.durationMinutes,
      location: e.location ?? null,
      type: e.type,
      isActive: true,
    });
  }

  await db.insert(classSchedules).values(rows).onConflictDoNothing();

  const all = await db.select({ id: classSchedules.id }).from(classSchedules);
  console.log(`Seed jadwal selesai: ${all.length} baris (idempotent)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
