"use server";

import { and, asc, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, invoices, paymentOrders, studentEnrollments, students } from "@/db/schema";
import { requireTenantContext } from "@/server/authz";
import { todayInWib } from "@/lib/datetime";
import { formatPeriode } from "@/lib/format";
import { URUTAN_AGING, waLink, type AgingRentang } from "@/lib/keuangan";

/**
 * K1 Ringkasan + P1 Penagihan + K2 detail tagihan — baca-saja, satu sumber angka (K1 dan P1 selaras).
 *
 * Definisi (mengikuti anotasi desain 02-admin-keuangan; sama dengan A1 hariIni.ts):
 * - Periode        = bulan berjalan WIB. Tagihan masuk periode bila billing_period_start (fallback tanggal
 *                    dibuat, WIB) jatuh di bulan itu.
 * - Ditagihkan     = nominal semua tagihan periode berjalan.
 * - Diterima       = bagian Ditagihkan yang berstatus Lunas (bukan terhadap total termasuk belum terbit).
 * - Menunggu       = periode berjalan, belum Lunas, belum lewat jatuh tempo (atau jatuh tempo belum diisi).
 * - Terlambat      = semua periode, belum Lunas, jatuh tempo sudah lewat → nominal penuh
 *                    (nominal pembayaran sebagian belum tercatat di sistem).
 * - Perlu Ditagih  = anak dengan enrollment aktif tanpa tagihan periode berjalan, setelah tanggal tagihnya
 *                    (billing_day) tiba; estimasi = harga kelas per bulan.
 * - Cara bayar     = Lunas periode berjalan dengan payment_orders paid = "Online"; sisanya =
 *                    "Tunai/transfer · dicatat admin". Metode QRIS/VA belum tercatat → rincian disembunyikan (BARU).
 * - Uang masuk     = sum tagihan Lunas per bulan berdasar paid_at (WIB), 6 bulan terakhir; bulan berjalan
 *                    masih berjalan ("s.d. hari ini").
 * - Keluarga       = pengelompokan anak: parent_user_id → email (lower) → nama wali → id anak.
 * BARU yang disembunyikan (REDESIGN-BACKLOG): pembayaran parsial, kuitansi, pengingat otomatis + riwayatnya,
 * settlement/pencairan, paket & biaya, denda, ekspor resmi.
 */


export interface BarisTagihan {
  id: string;
  nomor: string;
  keluarga: string;
  anak: string;
  kelas: string | null;
  periode: string | null;
  total: number;
  /** Status tagihan; belum lunas + lewat jatuh tempo dilaporkan sebagai "overdue" */
  status: "unpaid" | "paid" | "partial" | "overdue";
  dueDate: string | null;
  paidAt: string | null;
  hariTerlambat: number;
  /** "online" bila ada payment_orders paid; "manual" bila dicatat admin; null bila belum lunas */
  metode: "online" | "manual" | null;
  /** Nomor WA wali siap wa.me, bila ada */
  wa: string | null;
}

export interface BarisPerluDitagih {
  studentId: string;
  anak: string;
  kelas: string[];
  keluarga: string;
  nominal: number;
  billingDay: number | null;
  wa: string | null;
}

export interface KeuanganData {
  isDemo: boolean;
  diambilPada: string;
  /** "YYYY-MM-DD" WIB */
  tanggal: string;
  periode: string;
  kosong: boolean;
  terbit: number;
  terbitKeluarga: number;
  terbitAnak: number;
  diterima: number;
  diterimaKeluarga: number;
  menunggu: number;
  menungguKeluarga: number;
  terlambat: number;
  terlambatKeluarga: number;
  aging: Record<AgingRentang, { total: number; keluarga: number }>;
  perluDitagih: { anak: number; estimasi: number };
  perBulan: { ym: string; label: string; total: number; selesai: boolean }[];
  perKelas: { id: string; name: string; anak: number; tagihan: number; diterima: number }[];
  caraBayar: { online: number; onlineCount: number; manual: number; manualCount: number };
  daftar: {
    perluDitagih: BarisPerluDitagih[];
    menunggu: BarisTagihan[];
    terlambat: BarisTagihan[];
    lunas: BarisTagihan[];
  };
}

/** Periode tagihan (YYYY-MM, WIB) — satu ekspresi SQL yang sama dipakai semua kueri. */
function periodeInvoice() {
  return sql<string>`to_char(coalesce(${invoices.billingPeriodStart}, (${invoices.createdAt} AT TIME ZONE 'Asia/Jakarta')::date), 'YYYY-MM')`;
}

/** Kunci pengelompokan keluarga (sama dengan hariIni.ts). */
function kunciKeluarga() {
  return sql<string>`coalesce(${students.parentUserId}, lower(${students.parentEmail}), ${students.parentName}, ${students.id})`;
}

function namaKeluarga(parentName: string | null, anak: string) {
  const n = parentName?.trim();
  return n ? `Keluarga ${n.split(/\s+/).slice(-1)[0]}` : anak;
}

function hariSejak(tanggal: string, acuan: string) {
  return Math.round((Date.parse(acuan) - Date.parse(tanggal)) / 86_400_000);
}

function agingDari(hari: number): AgingRentang {
  if (hari <= 30) return "1-30";
  if (hari <= 60) return "31-60";
  return "60+";
}

export async function getKeuangan(): Promise<KeuanganData> {
  const ctx = await requireTenantContext();
  if (ctx.isDemo) return demoKeuangan();
  return hitungKeuangan(ctx.tenantId);
}

/** Hanya dipanggil setelah otorisasi tenant; sengaja tidak diekspor agar tidak menjadi server action. */
async function hitungKeuangan(tenantId: string): Promise<KeuanganData> {
  const tanggal = todayInWib();
  const ym = tanggal.slice(0, 7);
  const hari = Number(tanggal.slice(8, 10));
  const periodeLabel = formatPeriode(tanggal);

  // ---- Kelas & enrollment aktif (untuk Perlu Ditagih & per kelas) ----
  const [kelasRows, enrollRows] = await Promise.all([
    db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(and(eq(classes.tenantId, tenantId), eq(classes.isActive, true)))
      .orderBy(asc(classes.name)),
    db
      .select({
        studentId: studentEnrollments.studentId,
        classId: studentEnrollments.classId,
        billingDay: studentEnrollments.billingDay,
        price: classes.pricePerMonth,
        studentName: students.name,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(students.id, studentEnrollments.studentId))
      .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
      .where(and(eq(students.tenantId, tenantId), eq(students.isActive, true), eq(studentEnrollments.isActive, true))),
  ]);

  // ---- Semua tagihan lembaga + periode + penanda pembayaran online ----
  const invoiceRows = await db
    .select({
      id: invoices.id,
      nomor: invoices.invoiceNumber,
      studentId: invoices.studentId,
      studentName: students.name,
      kunci: kunciKeluarga(),
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      total: invoices.total,
      status: invoices.status,
      periodeStart: invoices.billingPeriodStart,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      ym: periodeInvoice(),
      online: paymentOrders.id,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .leftJoin(paymentOrders, and(eq(paymentOrders.invoiceId, invoices.id), eq(paymentOrders.paymentStatus, "paid")))
    .where(eq(students.tenantId, tenantId))
    .orderBy(desc(invoices.paidAt));

  const toBaris = (i: (typeof invoiceRows)[number]): BarisTagihan => {
    const telat = i.status !== "paid" && i.dueDate && String(i.dueDate) < tanggal;
    const kelasNama = kelasRows.find((k) => k.id === enrollRows.find((e) => e.studentId === i.studentId)?.classId)?.name ?? null;
    return {
      id: i.id,
      nomor: i.nomor,
      keluarga: namaKeluarga(i.parentName, i.studentName),
      anak: i.studentName,
      kelas: kelasNama,
      periode: i.periodeStart ? formatPeriode(String(i.periodeStart)) : null,
      total: Number(i.total) || 0,
      status: (telat ? "overdue" : i.status) as BarisTagihan["status"],
      dueDate: i.dueDate ? String(i.dueDate) : null,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
      hariTerlambat: telat && i.dueDate ? Math.max(1, hariSejak(String(i.dueDate), tanggal)) : 0,
      metode: i.status === "paid" ? (i.online ? "online" : "manual") : null,
      wa: waLink(i.parentPhone),
    };
  };

  const periodeRows = invoiceRows.filter((i) => i.ym === ym);

  // ---- Perlu Ditagih: enrollment aktif tanpa tagihan periode berjalan, billing_day sudah tiba ----
  const sudahDitagih = new Set(periodeRows.map((i) => i.studentId));
  const perAnak = new Map<string, BarisPerluDitagih>();
  for (const e of enrollRows) {
    if (sudahDitagih.has(e.studentId)) continue;
    if (e.billingDay && e.billingDay > hari) continue;
    const cur = perAnak.get(e.studentId) ?? {
      studentId: e.studentId,
      anak: e.studentName,
      kelas: [],
      keluarga: namaKeluarga(e.parentName, e.studentName),
      nominal: 0,
      billingDay: e.billingDay,
      wa: waLink(e.parentPhone),
    };
    cur.kelas.push(kelasRows.find((k) => k.id === e.classId)?.name ?? "Kelas");
    cur.nominal += Number(e.price) || 0;
    perAnak.set(e.studentId, cur);
  }

  const keluargaUnik = (rows: { kunci: string }[]) => new Set(rows.map((r) => String(r.kunci))).size;

  const terlambatRows = invoiceRows.filter((i) => i.status !== "paid" && i.dueDate && String(i.dueDate) < tanggal);
  const menungguRows = periodeRows.filter((i) => i.status !== "paid" && (!i.dueDate || String(i.dueDate) >= tanggal));
  const lunasRows = periodeRows
    .filter((i) => i.status === "paid")
    .sort((a, b) => (b.paidAt?.getTime() ?? 0) - (a.paidAt?.getTime() ?? 0));

  const agingSets = Object.fromEntries(URUTAN_AGING.map((k) => [k, { total: 0, keluarga: new Set<string>() }])) as Record<
    AgingRentang,
    { total: number; keluarga: Set<string> }
  >;
  for (const i of terlambatRows) {
    const hariTelat = Math.max(1, hariSejak(String(i.dueDate), tanggal));
    const b = agingSets[agingDari(hariTelat)];
    b.total += Number(i.total) || 0;
    b.keluarga.add(String(i.kunci));
  }

  // ---- Per kelas (periode berjalan) ----
  const perKelasMap = new Map<string, { tagihan: number; diterima: number }>();
  for (const i of periodeRows) {
    const classId = enrollRows.find((e) => e.studentId === i.studentId)?.classId;
    if (!classId) continue;
    const cur = perKelasMap.get(classId) ?? { tagihan: 0, diterima: 0 };
    cur.tagihan += Number(i.total) || 0;
    if (i.status === "paid") cur.diterima += Number(i.total) || 0;
    perKelasMap.set(classId, cur);
  }

  // ---- Uang masuk 6 bulan terakhir (per paid_at WIB) ----
  const [ty, tm] = [Number(ym.slice(0, 4)), Number(ym.slice(5, 7))];
  const bulanLabels = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(Date.UTC(ty, tm - 1 - (5 - k), 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return { ym: `${y}-${m}`, label: formatPeriode(`${y}-${m}-01`) };
  });
  const paidPerBulan = await db
    .select({
      ym: sql<string>`to_char((${invoices.paidAt} AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM')`,
      total: sql<string>`coalesce(sum(${invoices.total}::numeric), 0)`,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(students.tenantId, tenantId), eq(invoices.status, "paid"), isNotNull(invoices.paidAt)))
    .groupBy(sql`1`);
  const paidMap = new Map(paidPerBulan.map((r) => [r.ym, Number(r.total) || 0]));

  const cara = { online: 0, onlineCount: 0, manual: 0, manualCount: 0 };
  for (const i of lunasRows) {
    if (i.online) {
      cara.online += Number(i.total) || 0;
      cara.onlineCount++;
    } else {
      cara.manual += Number(i.total) || 0;
      cara.manualCount++;
    }
  }

  const perluDitagihAnak = [...perAnak.values()];

  return {
    isDemo: false,
    diambilPada: new Date().toISOString(),
    tanggal,
    periode: periodeLabel,
    kosong: kelasRows.length === 0 && enrollRows.length === 0 && invoiceRows.length === 0,
    terbit: periodeRows.reduce((s, i) => s + (Number(i.total) || 0), 0),
    terbitKeluarga: keluargaUnik(periodeRows),
    terbitAnak: new Set(periodeRows.map((i) => i.studentId)).size,
    diterima: lunasRows.reduce((s, i) => s + (Number(i.total) || 0), 0),
    diterimaKeluarga: keluargaUnik(lunasRows),
    menunggu: menungguRows.reduce((s, i) => s + (Number(i.total) || 0), 0),
    menungguKeluarga: keluargaUnik(menungguRows),
    terlambat: terlambatRows.reduce((s, i) => s + (Number(i.total) || 0), 0),
    terlambatKeluarga: keluargaUnik(terlambatRows),
    aging: Object.fromEntries(
      URUTAN_AGING.map((k) => [k, { total: agingSets[k].total, keluarga: agingSets[k].keluarga.size }]),
    ) as Record<AgingRentang, { total: number; keluarga: number }>,
    perluDitagih: {
      anak: perluDitagihAnak.length,
      estimasi: perluDitagihAnak.reduce((s, r) => s + r.nominal, 0),
    },
    perBulan: bulanLabels.map((b) => ({ ...b, total: paidMap.get(b.ym) ?? 0, selesai: b.ym < ym })),
    perKelas: kelasRows.map((k) => ({
      id: k.id,
      name: k.name,
      anak: enrollRows.filter((e) => e.classId === k.id).length,
      tagihan: perKelasMap.get(k.id)?.tagihan ?? 0,
      diterima: perKelasMap.get(k.id)?.diterima ?? 0,
    })),
    caraBayar: cara,
    daftar: {
      perluDitagih: perluDitagihAnak,
      menunggu: menungguRows.map(toBaris),
      terlambat: terlambatRows.map(toBaris).sort((a, b) => b.hariTerlambat - a.hariTerlambat),
      lunas: lunasRows.map(toBaris),
    },
  };
}

/* ------------------------------------------------------------------ */
/* K2 Detail tagihan + ledger keluarga                                  */
/* ------------------------------------------------------------------ */

export interface LedgerBaris {
  tanggal: string;
  keterangan: string;
  tagihan: number;
  bayar: number;
  saldo: number;
}

export interface TagihanDetail {
  isDemo: boolean;
  id: string;
  nomor: string;
  status: "unpaid" | "paid" | "overdue" | "partial";
  hariTerlambat: number;
  keluarga: string;
  anak: { id: string; name: string; kelas: string | null }[];
  rincian: { amount: number; discount: number; total: number; notes: string | null; dueDate: string | null; periode: string | null; paidAt: string | null };
  /**
   * Ledger ala buku kas dari tagihan keluarga: baris tagihan menambah utang, tagihan Lunas mengurangi.
   * Catatan pembayaran parsial belum tersimpan di sistem, jadi bayar tercatat selalu nominal penuh tagihan.
   */
  ledger: LedgerBaris[];
  wa: string | null;
}

export async function getTagihanDetail(id: string): Promise<TagihanDetail | null> {
  const ctx = await requireTenantContext();
  const tanggal = todayInWib();

  const [inv] = await db
    .select({
      id: invoices.id,
      nomor: invoices.invoiceNumber,
      studentId: invoices.studentId,
      total: invoices.total,
      amount: invoices.amount,
      discount: invoices.discount,
      status: invoices.status,
      periodeStart: invoices.billingPeriodStart,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      studentName: students.name,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      parentUserId: students.parentUserId,
      parentEmail: students.parentEmail,
    })
    .from(invoices)
    .innerJoin(students, eq(students.id, invoices.studentId))
    .where(and(eq(invoices.id, id), eq(students.tenantId, ctx.tenantId)))
    .limit(1);
  if (!inv) return null;

  // Keluarga = semua anak dengan kunci yang sama (user id / email / telepon / nama wali).
  const kunci = [
    inv.parentUserId ? eq(students.parentUserId, inv.parentUserId) : null,
    inv.parentEmail ? sql`lower(${students.parentEmail}) = ${inv.parentEmail.toLowerCase()}` : null,
    inv.parentPhone ? eq(students.parentPhone, inv.parentPhone) : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
  const filterKeluarga = kunci.length ? (kunci.length === 1 ? kunci[0] : or(...kunci)) : sql`false`;

  const [anakKeluarga, tagihanKeluarga] = await Promise.all([
    db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(and(eq(students.tenantId, ctx.tenantId), filterKeluarga))
      .orderBy(asc(students.name)),
    db
      .select({
        id: invoices.id,
        nomor: invoices.invoiceNumber,
        studentId: invoices.studentId,
        total: invoices.total,
        status: invoices.status,
        periodeStart: invoices.billingPeriodStart,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        online: paymentOrders.id,
      })
      .from(invoices)
      .innerJoin(students, eq(students.id, invoices.studentId))
      .leftJoin(paymentOrders, and(eq(paymentOrders.invoiceId, invoices.id), eq(paymentOrders.paymentStatus, "paid")))
      .where(and(eq(students.tenantId, ctx.tenantId), filterKeluarga))
      .orderBy(asc(sql`coalesce(${invoices.billingPeriodStart}, (${invoices.createdAt} AT TIME ZONE 'Asia/Jakarta')::date)`)),
  ]);

  const kelasRows = anakKeluarga.length
    ? await db
        .select({ studentId: studentEnrollments.studentId, name: classes.name })
        .from(studentEnrollments)
        .innerJoin(classes, eq(classes.id, studentEnrollments.classId))
        .where(and(inArray(studentEnrollments.studentId, anakKeluarga.map((a) => a.id)), eq(studentEnrollments.isActive, true)))
    : [];

  // Ledger: tagihan menambah utang, tagihan Lunas mengurangi (bayar tercatat = nominal penuh).
  const ledger: LedgerBaris[] = [];
  let saldo = 0;
  for (const t of tagihanKeluarga) {
    const tanggalTagih = t.periodeStart ? String(t.periodeStart) : (t.createdAt ? t.createdAt.toISOString().slice(0, 10) : tanggal);
    const pemilik = anakKeluarga.find((a) => a.id === t.studentId);
    saldo += Number(t.total) || 0;
    ledger.push({
      tanggal: tanggalTagih,
      keterangan: [t.periodeStart ? `Tagihan ${formatPeriode(String(t.periodeStart))}` : "Tagihan tanpa periode", pemilik?.name, t.nomor].filter(Boolean).join(" · "),
      tagihan: Number(t.total) || 0,
      bayar: 0,
      saldo,
    });
    if (t.status === "paid" && t.paidAt) {
      saldo -= Number(t.total) || 0;
      ledger.push({
        tanggal: t.paidAt.toISOString(),
        keterangan: [`Pembayaran ${t.online ? "online" : "dicatat admin"}`, t.nomor].filter(Boolean).join(" · "),
        tagihan: 0,
        bayar: Number(t.total) || 0,
        saldo,
      });
    }
  }

  const telat = inv.status !== "paid" && inv.dueDate && String(inv.dueDate) < tanggal;

  return {
    isDemo: ctx.isDemo,
    id: inv.id,
    nomor: inv.nomor,
    status: (telat ? "overdue" : inv.status) as TagihanDetail["status"],
    hariTerlambat: telat && inv.dueDate ? Math.max(1, hariSejak(String(inv.dueDate), tanggal)) : 0,
    keluarga: namaKeluarga(inv.parentName, inv.studentName),
    anak: anakKeluarga.map((a) => ({
      id: a.id,
      name: a.name,
      kelas: kelasRows.find((k) => k.studentId === a.id)?.name ?? null,
    })),
    rincian: {
      amount: Number(inv.amount) || 0,
      discount: Number(inv.discount) || 0,
      total: Number(inv.total) || 0,
      notes: inv.notes,
      dueDate: inv.dueDate ? String(inv.dueDate) : null,
      periode: inv.periodeStart ? formatPeriode(String(inv.periodeStart)) : null,
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    },
    ledger,
    wa: waLink(inv.parentPhone),
  };
}

/* ------------------------------------------------------------------ */
/* Data demo (akun @majiku.test) — contoh dari frame desain, bukan data lembaga mana pun */
/* ------------------------------------------------------------------ */

function demoKeuangan(): KeuanganData {
  const tanggal = todayInWib();
  const wa = waLink("081145212290");
  const baris = (i: number, keluarga: string, anak: string, total: number, extra: Partial<BarisTagihan> = {}): BarisTagihan => ({
    id: `demo-${i}`,
    nomor: `INV-DEMO-${String(i).padStart(3, "0")}`,
    keluarga,
    anak,
    kelas: "Baby Bee",
    periode: formatPeriode(tanggal),
    total,
    status: "unpaid",
    dueDate: null,
    paidAt: null,
    hariTerlambat: 0,
    metode: null,
    wa,
    ...extra,
  });
  return {
    isDemo: true,
    diambilPada: new Date().toISOString(),
    tanggal,
    periode: formatPeriode(tanggal),
    kosong: false,
    terbit: 18_400_000,
    terbitKeluarga: 21,
    terbitAnak: 30,
    diterima: 12_100_000,
    diterimaKeluarga: 14,
    menunggu: 6_300_000,
    menungguKeluarga: 7,
    terlambat: 1_900_000,
    terlambatKeluarga: 2,
    aging: { "1-30": { total: 0, keluarga: 0 }, "31-60": { total: 650_000, keluarga: 1 }, "60+": { total: 1_250_000, keluarga: 1 } },
    perluDitagih: { anak: 8, estimasi: 8_200_000 },
    perBulan: [
      { ym: "m5", label: "Jun 2026", total: 21_800_000, selesai: true },
      { ym: "m4", label: "Jul 2026", total: 22_900_000, selesai: true },
      { ym: "m3", label: "Agu 2026", total: 24_100_000, selesai: true },
      { ym: "m2", label: "Sep 2026", total: 24_600_000, selesai: true },
      { ym: "m1", label: "Okt 2026", total: 25_300_000, selesai: true },
      { ym: "m0", label: formatPeriode(tanggal), total: 12_100_000, selesai: false },
    ],
    perKelas: [
      { id: "d1", name: "Baby Bee", anak: 6, tagihan: 5_400_000, diterima: 2_700_000 },
      { id: "d2", name: "Toddler A", anak: 10, tagihan: 7_300_000, diterima: 3_600_000 },
      { id: "d3", name: "Playgroup B", anak: 11, tagihan: 7_000_000, diterima: 3_300_000 },
      { id: "d4", name: "TK A", anak: 11, tagihan: 6_900_000, diterima: 2_500_000 },
    ],
    caraBayar: { online: 10_750_000, onlineCount: 12, manual: 1_350_000, manualCount: 2 },
    daftar: {
      perluDitagih: [
        { studentId: "demo-s1", anak: "Dafa", kelas: ["TK A"], keluarga: "Keluarga Lestari", nominal: 1_550_000, billingDay: 15, wa },
        { studentId: "demo-s2", anak: "Rafa", kelas: ["Baby Bee"], keluarga: "Keluarga Santoso", nominal: 1_000_000, billingDay: 15, wa },
      ],
      menunggu: [
        baris(1, "Keluarga Siregar", "Kayla", 2_450_000, { dueDate: tanggal, kelas: "TK A" }),
        baris(2, "Keluarga Hartono", "Naila", 1_000_000, { dueDate: tanggal }),
      ],
      terlambat: [
        baris(3, "Keluarga Wibowo", "Bima", 650_000, { status: "overdue", periode: "Okt 2026", hariTerlambat: 43, kelas: "Toddler A" }),
        baris(4, "Keluarga Putri", "Aisyah", 1_250_000, { status: "overdue", periode: "Sep 2026", hariTerlambat: 63, kelas: "Playgroup B" }),
      ],
      lunas: [
        baris(5, "Keluarga Harahap", "Nara", 720_000, { status: "paid", metode: "online", paidAt: new Date().toISOString() }),
        baris(6, "Keluarga Nugroho", "Kenzo", 700_000, { status: "paid", metode: "manual", paidAt: new Date().toISOString() }),
      ],
    },
  };
}
