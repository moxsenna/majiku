"use server";

import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { announcements, students, user } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";

/**
 * O11 Pengumuman — baca-saja, scope tenant. Tulis/hapus memakai action lama (announcements.ts).
 * Definisi:
 * - Penerima        = akun wali (parent_user_id) unik dari anak aktif lembaga, dihitung saat dikirim
 *                     (announcements.recipient_count). Wali tanpa akun tertaut tidak menerima di aplikasi.
 * - Penerima saat ini = hitungan yang sama untuk pengumuman berikutnya.
 * - Keluarga tanpa akun = anak aktif tanpa parent_user_id (dikelompokkan per kontak wali).
 * BARU yang disembunyikan: audiens per kelas/keluarga, jadwal kirim, kanal WhatsApp, draf, tingkat baca + pengingat.
 */

export interface PengumumanItem {
  id: string;
  title: string;
  body: string;
  createdAt: string | null;
  recipientCount: number;
  pengirim: string | null;
}

export interface PengumumanData {
  isDemo: boolean;
  diambilPada: string;
  penerimaSaatIni: number;
  keluargaTanpaAkun: number;
  daftar: PengumumanItem[];
}

export async function getPengumuman(): Promise<PengumumanData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo) return demoPengumuman();

  const [rows, penerima, tanpaAkun] = await Promise.all([
    db
      .select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        createdAt: announcements.createdAt,
        recipientCount: announcements.recipientCount,
        pengirim: user.name,
      })
      .from(announcements)
      .leftJoin(user, eq(user.id, announcements.sentByUserId))
      .where(eq(announcements.tenantId, ctx.tenantId))
      .orderBy(desc(announcements.createdAt)),
    db
      .select({ n: sql<number>`count(distinct ${students.parentUserId})::int` })
      .from(students)
      .where(and(eq(students.tenantId, ctx.tenantId), eq(students.isActive, true), isNotNull(students.parentUserId))),
    db
      .select({
        n: sql<number>`count(distinct coalesce(nullif(${students.parentPhone}, ''), nullif(${students.parentEmail}, ''), ${students.id}))::int`,
      })
      .from(students)
      .where(and(eq(students.tenantId, ctx.tenantId), eq(students.isActive, true), sql`${students.parentUserId} is null`)),
  ]);

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    penerimaSaatIni: penerima[0]?.n ?? 0,
    keluargaTanpaAkun: tanpaAkun[0]?.n ?? 0,
    daftar: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      recipientCount: r.recipientCount ?? 0,
    })),
  };
}

function demoPengumuman(): PengumumanData {
  const hari = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    penerimaSaatIni: 29,
    keluargaTanpaAkun: 3,
    daftar: [
      {
        id: "dp1",
        title: "Lembaga tutup 18 Nov (pelatihan guru)",
        body: "Ayah Bunda, pada Rabu 18 Nov lembaga tutup karena pelatihan guru. Kegiatan kembali normal Kamis 19 Nov.",
        createdAt: hari(7),
        recipientCount: 29,
        pengirim: "Dewi Lestari",
      },
      {
        id: "dp2",
        title: "Jadwal imunisasi Baby Bee",
        body: "Imunisasi rutin untuk Baby Bee dijadwalkan Senin depan pukul 09.00 bersama bidan puskesmas.",
        createdAt: hari(14),
        recipientCount: 28,
        pengirim: "Dewi Lestari",
      },
    ],
  };
}
